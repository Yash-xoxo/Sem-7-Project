"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { PortfolioProfitBars } from "@/components/portfolio-profit-bars"
import { RiskRadar } from "@/components/risk-radar"
import { AITradingToggle } from "@/components/ai-trading-toggle"
import { Chatbot } from "@/components/chatbot"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { stocksData, updateStockPrice } from "@/lib/stock-data"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import type { Stock } from "@/lib/types"
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Trash2, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function PortfolioPage() {
  const { portfolio, trades, resetPortfolio, updatePrices } = usePortfolioStore()
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stocks, setStocks] = useState<Stock[]>(stocksData)
  const [loading, setLoading] = useState(false)

  const fetchLiveData = async () => {
    setLoading(true)
    try {
      const symbols = stocksData.map((s) => s.symbol).join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (response.ok) {
        const liveData = await response.json()
        setStocks(
          stocksData.map((stock) => {
            const live = liveData[stock.symbol]
            if (live && live.c > 0) {
              return updateStockPrice(stock, live)
            }
            return stock
          }),
        )
      }
    } catch (error) {
      console.error("Error fetching live data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStockBySymbol = (symbol: string) => stocks.find((s) => s.symbol === symbol)

  const fetchAIAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio, trades }),
      })
      if (response.ok) {
        const data = await response.json()
        setAiAnalysis(data)
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalysisToggle = () => {
    setShowAnalysis(!showAnalysis)
    if (!showAnalysis && !aiAnalysis) {
      fetchAIAnalysis()
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Portfolio</h1>
            <p className="text-muted-foreground">Track your investments and performance (USD with INR)</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                fetchLiveData()
                updatePrices()
              }}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Update
            </Button>
            <Button
              variant="secondary"
              onClick={handleAnalysisToggle}
              className={cn(showAnalysis && "bg-primary text-primary-foreground")}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </Button>
            <Button variant="destructive" onClick={resetPortfolio}>
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummary />
        </div>

        <div className="mb-8">
          <AITradingToggle />
        </div>

        {/* AI Analysis Panel */}
        {showAnalysis && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/20 to-card border border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Portfolio Analysis (Gemini)</h3>
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Analyzing your portfolio...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">Overall Health</p>
                  <p
                    className={cn(
                      "font-semibold capitalize",
                      aiAnalysis.overallHealth === "excellent" || aiAnalysis.overallHealth === "good"
                        ? "text-[#22c55e]"
                        : aiAnalysis.overallHealth === "fair"
                          ? "text-yellow-500"
                          : "text-[#ef4444]",
                    )}
                  >
                    {aiAnalysis.overallHealth}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <p className="font-semibold text-foreground">{aiAnalysis.riskScore}/10</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">Diversification</p>
                  <p className="font-semibold text-foreground">{aiAnalysis.diversificationScore}/10</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">1Y Predicted Return</p>
                  <p
                    className={cn(
                      "font-semibold",
                      aiAnalysis.predictedReturn?.oneYear >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
                    )}
                  >
                    {aiAnalysis.predictedReturn?.oneYear >= 0 ? "+" : ""}
                    {aiAnalysis.predictedReturn?.oneYear}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Click to generate AI analysis</p>
            )}

            {aiAnalysis?.recommendations && (
              <div className="mt-4 p-4 rounded-lg bg-card/50">
                <p className="text-sm font-medium text-foreground mb-2">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RiskRadar />
          <PortfolioProfitBars />
        </div>

        {/* Holdings */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Holdings</h2>

          {portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Avg Price</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Current</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const stock = getStockBySymbol(holding.symbol)
                    const currentPrice = stock?.price || holding.currentPrice
                    const value = currentPrice * holding.quantity
                    const profitLoss = value - holding.avgPrice * holding.quantity
                    const profitLossPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100
                    const isProfit = profitLoss >= 0

                    return (
                      <tr key={holding.symbol} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-foreground">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-foreground">{holding.quantity}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-foreground">${holding.avgPrice.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{formatINR(holding.avgPrice * USD_TO_INR)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-foreground">${currentPrice.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{formatINR(currentPrice * USD_TO_INR)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-foreground">${value.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{formatINR(value * USD_TO_INR)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div
                            className={cn("flex flex-col items-end", isProfit ? "text-[#22c55e]" : "text-[#ef4444]")}
                          >
                            <div className="flex items-center gap-1">
                              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span className="font-semibold">
                                {isProfit ? "+" : ""}${profitLoss.toFixed(2)}
                              </span>
                            </div>
                            <span className="text-sm">
                              ({isProfit ? "+" : ""}
                              {profitLossPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Link href={`/trade?symbol=${holding.symbol}`}>
                            <Button variant="secondary" size="sm">
                              Trade
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-card border border-border text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Holdings Yet</h3>
              <p className="text-muted-foreground mb-4">Start trading to build your portfolio</p>
              <Link href="/trade">
                <Button className="bg-primary text-primary-foreground">Start Trading</Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Chatbot />
    </div>
  )
}
