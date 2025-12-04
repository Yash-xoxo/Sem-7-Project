"use client"

import { useState, useEffect, useCallback } from "react"
import type { Stock } from "@/lib/types"
import { stocksData, updateStockPrice } from "@/lib/stock-data"

export function useLiveStocks(refreshInterval = 10000) {
  const [stocks, setStocks] = useState<Stock[]>(stocksData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLiveData = useCallback(async () => {
    try {
      const symbols = stocksData.map((s) => s.symbol).join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (!response.ok) throw new Error("Failed to fetch live data")

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
      setError(null)
    } catch (err) {
      console.error("Error fetching live stock data:", err)
      setError("Unable to fetch live data. Using cached prices.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveData()

    const interval = setInterval(fetchLiveData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchLiveData, refreshInterval])

  return { stocks, loading, error, lastUpdated, refetch: fetchLiveData }
}

export function useLiveStock(symbol: string, refreshInterval = 10000) {
  const [quote, setQuote] = useState<{
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    open: number
    previousClose: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/stock-data?symbol=${symbol}&type=quote`)
      if (!response.ok) throw new Error("Failed to fetch quote")

      const data = await response.json()

      if (data && data.c > 0) {
        setQuote({
          price: data.c,
          change: data.d || 0,
          changePercent: data.dp || 0,
          high: data.h || data.c,
          low: data.l || data.c,
          open: data.o || data.c,
          previousClose: data.pc || data.c,
        })
      }
      setError(null)
    } catch (err) {
      console.error(`Error fetching quote for ${symbol}:`, err)
      setError("Unable to fetch live quote")
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchQuote()

    const interval = setInterval(fetchQuote, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchQuote, refreshInterval])

  return { quote, loading, error, refetch: fetchQuote }
}
