"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { CandlestickChart } from "@/components/candlestick-chart"
import { AISentimentOverlay } from "@/components/ai-sentiment-overlay"
import { Chatbot } from "@/components/chatbot"
import { stocksData, updateStockPrice } from "@/lib/stock-data"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import type { Stock } from "@/lib/types"
import { Brain, TrendingUp, TrendingDown, Sparkles, Clock, Shield, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TimeFrame = "1Y" | "3Y" | "5Y"

export default function PredictionsPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1Y")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [stocks, setStocks] = useState<Stock[]>(stocksData)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLiveData = async () => {
    try {
      const symbols = stocksData.map((s) => s.symbol).join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (response.ok) {
        const liveData = await response.json()
        setStocks((prev) =>
          prev.map((stock) => {
            const live = liveData[stock.symbol]
            if (live && live.c > 0) {
              return updateStockPrice(stock, live)
            }
            return stock
          }),
        )
        setLastUpdated(new Date())
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

  const bullishStocks = stocks
    .filter((s) => s.prediction === "bullish")
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 10)

  const bearishStocks = stocks
    .filter((s) => s.prediction === "bearish")
    .sort((a, b) => a.aiScore - b.aiScore)
    .slice(0, 10)

  const getTimeFrameMultiplier = (tf: TimeFrame) => {
    switch (tf) {
      case "1Y":
        return 1
      case "3Y":
        return 2.5
      case "5Y":
        return 4
    }
  }

  const calculateProjectedGrowth = (stock: Stock, tf: TimeFrame) => {
    const multiplier = getTimeFrameMultiplier(tf)
    const baseGrowth = ((stock.targetPrice - stock.price) / stock.price) * 100
    return (baseGrowth * multiplier * (stock.prediction === "bullish" ? 1 : -0.5)).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Predictions</h1>
                <p className="text-muted-foreground">Gemini AI-powered stock analysis and forecasts</p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              lastUpdated && (
                <p className="text-xs text-muted-foreground">Updated: {lastUpdated.toLocaleTimeString()}</p>
              )
            )}
          </div>
        </div>

        {/* Time Frame Selector */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-card border border-border">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Prediction Timeframe:</span>
          <div className="flex gap-2">
            {(["1Y", "3Y", "5Y"] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? "default" : "secondary"}
                size="sm"
                onClick={() => setTimeFrame(tf)}
                className={cn(timeFrame === tf && "bg-primary text-primary-foreground")}
              >
                {tf === "1Y" ? "1 Year" : tf === "3Y" ? "3 Years" : "5 Years"}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/20 to-card border border-primary/30">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Market Analysis</h3>
              <p className="text-muted-foreground">
                Based on current market trends, technical indicators, and fundamental analysis, our Gemini AI model
                predicts strong performance in the technology and healthcare sectors over the next{" "}
                {timeFrame === "1Y" ? "year" : timeFrame === "3Y" ? "3 years" : "5 years"}. Prices shown in USD with INR
                conversion.
              </p>
            </div>
          </div>
        </div>

        {/* Top 10 Bullish */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Top 10 Profitable Stocks</h2>
              <p className="text-sm text-[#22c55e]">AI recommends buying these stocks</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Price (USD)</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Target (USD)</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">AI Score</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">{timeFrame} Growth</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {bullishStocks.map((stock, index) => (
                  <tr
                    key={stock.symbol}
                    className="border-b border-border/50 hover:bg-[#22c55e]/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <td className="py-4 px-4">
                      <span className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-bold text-sm">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-foreground">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-foreground">${stock.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(stock.price * USD_TO_INR)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-[#22c55e]">${stock.targetPrice.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(stock.targetPrice * USD_TO_INR)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-[#22c55e] rounded-full" style={{ width: `${stock.aiScore}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-[#22c55e]">{stock.aiScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-bold text-[#22c55e]">+{calculateProjectedGrowth(stock, timeFrame)}%</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-sm font-medium">
                        {stock.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top 10 Bearish */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Top 10 Risky Stocks</h2>
              <p className="text-sm text-[#ef4444]">AI recommends avoiding these stocks</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Price (USD)</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Target (USD)</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">AI Score</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">{timeFrame} Risk</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {bearishStocks.map((stock, index) => (
                  <tr
                    key={stock.symbol}
                    className="border-b border-border/50 hover:bg-[#ef4444]/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <td className="py-4 px-4">
                      <span className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center text-[#ef4444] font-bold text-sm">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-foreground">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-foreground">${stock.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(stock.price * USD_TO_INR)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-[#ef4444]">${stock.targetPrice.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(stock.targetPrice * USD_TO_INR)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-[#ef4444] rounded-full" style={{ width: `${stock.aiScore}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-[#ef4444]">{stock.aiScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-bold text-[#ef4444]">{calculateProjectedGrowth(stock, timeFrame)}%</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-sm font-medium">
                        {stock.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Stock Detail Modal */}
        {selectedStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedStock.symbol}</h3>
                  <p className="text-muted-foreground">{selectedStock.name}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedStock(null)}>
                  Close
                </Button>
              </div>

              <AISentimentOverlay
                sentiment={selectedStock.prediction === "bullish" ? "positive" : "negative"}
                score={selectedStock.aiScore}
                recommendation={`${selectedStock.recommendation} - Target: $${selectedStock.targetPrice} (${formatINR(selectedStock.targetPrice * USD_TO_INR)})`}
              />

              <div className="mt-4">
                <CandlestickChart symbol={selectedStock.symbol} basePrice={selectedStock.price} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-xl font-bold text-foreground">${selectedStock.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{formatINR(selectedStock.price * USD_TO_INR)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Target Price</p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      selectedStock.prediction === "bullish" ? "text-[#22c55e]" : "text-[#ef4444]",
                    )}
                  >
                    ${selectedStock.targetPrice.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatINR(selectedStock.targetPrice * USD_TO_INR)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">AI Confidence</p>
                  <p className="text-xl font-bold text-foreground">{selectedStock.aiScore}%</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Sector</p>
                  <p className="text-xl font-bold text-foreground">{selectedStock.sector}</p>
                </div>
              </div>

              <div
                className={cn(
                  "mt-6 p-4 rounded-lg border",
                  selectedStock.prediction === "bullish"
                    ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                    : "bg-[#ef4444]/10 border-[#ef4444]/30",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedStock.prediction === "bullish" ? (
                    <Shield className="w-5 h-5 text-[#22c55e]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                  )}
                  <span
                    className={cn(
                      "font-semibold",
                      selectedStock.prediction === "bullish" ? "text-[#22c55e]" : "text-[#ef4444]",
                    )}
                  >
                    AI Analysis (Gemini)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedStock.prediction === "bullish"
                    ? `Based on strong fundamentals, positive market sentiment, and technical indicators, ${selectedStock.symbol} shows high potential for growth. The AI recommends this as a ${selectedStock.recommendation.toLowerCase()} opportunity with a projected upside of ${(((selectedStock.targetPrice - selectedStock.price) / selectedStock.price) * 100).toFixed(1)}%.`
                    : `Based on declining fundamentals, negative market sentiment, and bearish technical indicators, ${selectedStock.symbol} shows significant downside risk. The AI recommends avoiding this stock with a projected decline of ${(((selectedStock.price - selectedStock.targetPrice) / selectedStock.price) * 100).toFixed(1)}%.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Chatbot />
    </div>
  )
}
