"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { StockTicker } from "@/components/stock-ticker"
import { MarketOverview } from "@/components/market-overview"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { StockCard } from "@/components/stock-card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { FearGreedIndex } from "@/components/fear-greed-index"
import { Heatmap } from "@/components/heatmap"
import { RiskRadar } from "@/components/risk-radar"
import { PortfolioProfitBars } from "@/components/portfolio-profit-bars"
import { AISentimentOverlay } from "@/components/ai-sentiment-overlay"
import { AITradingToggle } from "@/components/ai-trading-toggle"
import { Chatbot } from "@/components/chatbot"
import { stocksData, updateStockPrice } from "@/lib/stock-data"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import type { Stock } from "@/lib/types"
import { Brain, TrendingUp, TrendingDown, Sparkles, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
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
    .slice(0, 4)

  const bearishStocks = stocks
    .filter((s) => s.prediction === "bearish")
    .sort((a, b) => a.aiScore - b.aiScore)
    .slice(0, 4)

  const featuredStock = stocks.find((s) => s.symbol === "NVDA") || stocks[0]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="pt-16">
        <StockTicker />
      </div>

      <main className="pt-4 px-4 max-w-7xl mx-auto">
        <section className="mb-8">
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium text-primary">Wealth Wiz AI-Powered Analysis</span>
                  {lastUpdated && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Smart Investment Decisions</h1>
                <p className="text-muted-foreground max-w-xl">
                  Get AI-powered stock predictions with 40 live stocks, real-time market analysis, and virtual trading.
                  Prices fetched from Finnhub API.
                </p>
              </div>
              <Link href="/predictions">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Brain className="w-4 h-4 mr-2" />
                  View AI Predictions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AITradingToggle />
          <FearGreedIndex />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Market Overview</h2>
          <MarketOverview />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Portfolio</h2>
          <PortfolioSummary />
        </section>

        <section className="mb-8">
          <Heatmap />
        </section>

        <section className="mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {featuredStock.symbol} - {featuredStock.name}
                </h3>
                <p className="text-sm text-muted-foreground">Top AI Pick - 30 Day Candlestick</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${featuredStock.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{formatINR(featuredStock.price * USD_TO_INR)}</p>
                <p className={`text-sm ${featuredStock.changePercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {featuredStock.changePercent >= 0 ? "+" : ""}
                  {featuredStock.changePercent.toFixed(2)}% Today
                </p>
              </div>
            </div>

            <AISentimentOverlay
              sentiment="positive"
              score={featuredStock.aiScore}
              recommendation={`Strong Buy - AI and data center demand continues. Target: $${featuredStock.targetPrice} (${formatINR(featuredStock.targetPrice * USD_TO_INR)})`}
            />

            <div className="mt-4">
              <CandlestickChart symbol={featuredStock.symbol} basePrice={featuredStock.price} />
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskRadar />
          <PortfolioProfitBars />
        </section>

        {/* AI Recommended - Bullish */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
              <h2 className="text-xl font-bold text-foreground">AI Recommends - Buy</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-medium">
                Profitable
              </span>
            </div>
            <Link href="/predictions" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bullishStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </section>

        {/* AI Not Recommended - Bearish */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#ef4444]" />
              <h2 className="text-xl font-bold text-foreground">AI Warns - Avoid</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-medium">Risky</span>
            </div>
            <Link href="/predictions" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bearishStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </section>
      </main>

      <Chatbot />
    </div>
  )
}
