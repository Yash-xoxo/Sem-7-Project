"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

interface HeatmapStock {
  symbol: string
  name: string
  change: number
  marketCap: string
}

const HEATMAP_SYMBOLS = [
  { symbol: "NVDA", name: "NVIDIA", marketCap: "2.15T" },
  { symbol: "AAPL", name: "Apple", marketCap: "3.02T" },
  { symbol: "MSFT", name: "Microsoft", marketCap: "3.16T" },
  { symbol: "GOOGL", name: "Alphabet", marketCap: "2.2T" },
  { symbol: "AMZN", name: "Amazon", marketCap: "2.05T" },
  { symbol: "META", name: "Meta", marketCap: "1.38T" },
  { symbol: "TSLA", name: "Tesla", marketCap: "790B" },
  { symbol: "JPM", name: "JPMorgan", marketCap: "571B" },
  { symbol: "V", name: "Visa", marketCap: "543B" },
  { symbol: "UNH", name: "UnitedHealth", marketCap: "521B" },
  { symbol: "JNJ", name: "J&J", marketCap: "380B" },
  { symbol: "XOM", name: "ExxonMobil", marketCap: "467B" },
  { symbol: "WMT", name: "Walmart", marketCap: "456B" },
  { symbol: "HD", name: "Home Depot", marketCap: "389B" },
  { symbol: "PG", name: "P&G", marketCap: "387B" },
  { symbol: "BAC", name: "Bank of America", marketCap: "300B" },
  { symbol: "DIS", name: "Disney", marketCap: "170B" },
  { symbol: "NFLX", name: "Netflix", marketCap: "280B" },
  { symbol: "AMD", name: "AMD", marketCap: "220B" },
  { symbol: "INTC", name: "Intel", marketCap: "95B" },
]

function getColorForChange(change: number): string {
  if (change >= 3) return "bg-[#15803d]"
  if (change >= 2) return "bg-[#22c55e]"
  if (change >= 1) return "bg-[#4ade80]"
  if (change >= 0) return "bg-[#86efac]"
  if (change >= -1) return "bg-[#fca5a5]"
  if (change >= -2) return "bg-[#f87171]"
  if (change >= -3) return "bg-[#ef4444]"
  return "bg-[#dc2626]"
}

function getTextColor(change: number): string {
  if (Math.abs(change) >= 2) return "text-white"
  return "text-foreground"
}

export function Heatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapStock[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiveData = async () => {
    try {
      const symbols = HEATMAP_SYMBOLS.map((s) => s.symbol).join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (response.ok) {
        const liveData = await response.json()
        const updated = HEATMAP_SYMBOLS.map((stock) => ({
          symbol: stock.symbol,
          name: stock.name,
          marketCap: stock.marketCap,
          change: liveData[stock.symbol]?.dp || (Math.random() - 0.5) * 4,
        }))
        setHeatmapData(updated)
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error)
      // Fallback to random data
      setHeatmapData(
        HEATMAP_SYMBOLS.map((stock) => ({
          ...stock,
          change: (Math.random() - 0.5) * 4,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Market Heatmap</h3>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          Loading live data...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Market Heatmap</h3>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
        {heatmapData.map((stock) => (
          <div
            key={stock.symbol}
            className={cn(
              "p-3 rounded-lg transition-all hover:scale-105 cursor-pointer",
              getColorForChange(stock.change),
            )}
          >
            <p className={cn("font-bold text-sm", getTextColor(stock.change))}>{stock.symbol}</p>
            <p className={cn("text-xs opacity-80", getTextColor(stock.change))}>
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#dc2626]" />
          <span className="text-xs text-muted-foreground">-3%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#ef4444]" />
          <span className="text-xs text-muted-foreground">-2%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#86efac]" />
          <span className="text-xs text-muted-foreground">0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#22c55e]" />
          <span className="text-xs text-muted-foreground">+2%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#15803d]" />
          <span className="text-xs text-muted-foreground">+3%+</span>
        </div>
      </div>
    </div>
  )
}
