"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { StockCard } from "@/components/stock-card"
import { StockTicker } from "@/components/stock-ticker"
import { Chatbot } from "@/components/chatbot"
import { stocksData, updateStockPrice } from "@/lib/stock-data"
import type { Stock } from "@/lib/types"
import { Search, Filter, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FilterType = "all" | "bullish" | "bearish"

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
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

  const filteredStocks = stocks.filter((stock: Stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filter === "all" || stock.prediction === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="pt-16">
        <StockTicker />
      </div>

      <main className="pt-4 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">All Stocks</h1>
              <p className="text-muted-foreground">
                Browse and analyze all available stocks with AI predictions (USD with INR conversion)
              </p>
            </div>
            <div className="text-right">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading live data...</span>
                </div>
              ) : (
                lastUpdated && (
                  <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "secondary"}
              onClick={() => setFilter("all")}
              className={cn(filter === "all" && "bg-primary text-primary-foreground")}
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              variant={filter === "bullish" ? "default" : "secondary"}
              onClick={() => setFilter("bullish")}
              className={cn(filter === "bullish" && "bg-[#22c55e] text-white hover:bg-[#22c55e]/90")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Bullish
            </Button>
            <Button
              variant={filter === "bearish" ? "default" : "secondary"}
              onClick={() => setFilter("bearish")}
              className={cn(filter === "bearish" && "bg-[#ef4444] text-white hover:bg-[#ef4444]/90")}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Bearish
            </Button>
          </div>
        </div>

        {/* Stocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock: Stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stocks found matching your criteria</p>
          </div>
        )}
      </main>

      <Chatbot />
    </div>
  )
}
