"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface TickerStock {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const TICKER_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "JPM",
  "V",
  "JNJ",
  "WMT",
  "PG",
  "UNH",
  "HD",
  "BAC",
]

export function StockTicker() {
  const [stocks, setStocks] = useState<TickerStock[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchLiveData = async () => {
    try {
      const symbols = TICKER_SYMBOLS.join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (response.ok) {
        const data = await response.json()
        const updatedStocks: TickerStock[] = TICKER_SYMBOLS.map((symbol) => {
          const quote = data[symbol]
          if (quote && quote.c > 0) {
            return {
              symbol,
              price: quote.c,
              change: quote.d || 0,
              changePercent: quote.dp || 0,
            }
          }
          // Fallback to default if API fails
          return {
            symbol,
            price: getDefaultPrice(symbol),
            change: 0,
            changePercent: 0,
          }
        })
        setStocks(updatedStocks)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error fetching ticker data:", error)
      // Use fallback prices on error
      setStocks(
        TICKER_SYMBOLS.map((symbol) => ({
          symbol,
          price: getDefaultPrice(symbol),
          change: (Math.random() - 0.5) * 2,
          changePercent: (Math.random() - 0.5) * 2,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()

    // Update every 10 seconds
    const interval = setInterval(fetchLiveData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Double the stocks array for seamless loop
  const displayStocks = [...stocks, ...stocks]

  if (loading) {
    return (
      <div className="w-full overflow-hidden bg-card/80 border-b border-border py-3">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading live market data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-card/80 border-b border-border py-2">
      <div
        className="flex animate-ticker"
        style={{
          width: "fit-content",
        }}
      >
        {displayStocks.map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center gap-3 px-6 border-r border-border/50">
            <span className="font-bold text-foreground">{stock.symbol}</span>
            <span className="text-foreground">${stock.price.toFixed(2)}</span>
            <span className="text-muted-foreground text-xs">({formatINR(stock.price * USD_TO_INR)})</span>
            <span
              className={cn(
                "flex items-center gap-1 text-sm",
                stock.changePercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
              )}
            >
              {stock.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stock.changePercent >= 0 ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      {lastUpdate && (
        <div className="text-center text-xs text-muted-foreground mt-1">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

function getDefaultPrice(symbol: string): number {
  const defaults: Record<string, number> = {
    AAPL: 195.6,
    MSFT: 425.8,
    GOOGL: 177.5,
    AMZN: 198.2,
    NVDA: 135.5,
    META: 585.4,
    TSLA: 248.9,
    JPM: 205.3,
    V: 287.4,
    JNJ: 156.4,
    WMT: 82.5,
    PG: 168.2,
    UNH: 567.8,
    HD: 375.6,
    BAC: 42.15,
  }
  return defaults[symbol] || 100
}
