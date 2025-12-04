"use client"

import { useMemo, useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { stocksData, updateStockPrice } from "@/lib/stock-data"

export function PortfolioProfitBars() {
  const { portfolio } = usePortfolioStore()
  const [liveStocks, setLiveStocks] = useState(stocksData)

  // Fetch live prices to update holdings
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const symbols = portfolio.holdings.map((h) => h.symbol).join(",")
        if (!symbols) return

        const response = await fetch(`/api/stock-data?symbols=${symbols}`)
        if (response.ok) {
          const liveData = await response.json()
          setLiveStocks((prev) =>
            prev.map((stock) => {
              const live = liveData[stock.symbol]
              if (live && live.c > 0) {
                return updateStockPrice(stock, live)
              }
              return stock
            }),
          )
        }
      } catch (error) {
        console.error("Error fetching live prices:", error)
      }
    }

    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 15000)
    return () => clearInterval(interval)
  }, [portfolio.holdings])

  const chartData = useMemo(() => {
    if (portfolio.holdings.length === 0) return []

    return portfolio.holdings
      .map((holding) => {
        // Get live price for this holding
        const liveStock = liveStocks.find((s) => s.symbol === holding.symbol)
        const currentPrice = liveStock?.price || holding.currentPrice

        // Calculate actual profit/loss in USD
        const profitUSD = (currentPrice - holding.avgPrice) * holding.quantity
        const profitINR = profitUSD * USD_TO_INR
        const profitPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100

        return {
          symbol: holding.symbol,
          name: holding.name,
          profit: profitUSD,
          profitINR: profitINR,
          percent: profitPercent,
          quantity: holding.quantity,
          avgPrice: holding.avgPrice,
          currentPrice: currentPrice,
        }
      })
      .sort((a, b) => b.profit - a.profit)
  }, [portfolio.holdings, liveStocks])

  if (chartData.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Profit/Loss by Holding</h3>
        <div className="flex flex-col items-center justify-center h-[200px] text-center">
          <p className="text-muted-foreground mb-2">No holdings yet</p>
          <p className="text-sm text-muted-foreground">Buy some stocks to see your P&L breakdown</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.symbol}</p>
          <p className="text-sm text-muted-foreground">{data.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Qty:</span> {data.quantity}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Avg:</span> ${data.avgPrice.toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Current:</span> ${data.currentPrice.toFixed(2)}
            </p>
            <p className={`text-sm font-semibold ${data.profit >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              P&L: {formatINR(data.profitINR)} ({data.percent >= 0 ? "+" : ""}
              {data.percent.toFixed(2)}%)
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Profit/Loss by Holding</h3>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 10 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#fff", fontSize: 12, fontWeight: 600 }}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#666" />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20">
          <p className="text-xs text-muted-foreground">Total Gains</p>
          <p className="text-lg font-bold text-[#22c55e]">
            {formatINR(chartData.filter((d) => d.profit > 0).reduce((sum, d) => sum + d.profitINR, 0))}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
          <p className="text-xs text-muted-foreground">Total Losses</p>
          <p className="text-lg font-bold text-[#ef4444]">
            {formatINR(Math.abs(chartData.filter((d) => d.profit < 0).reduce((sum, d) => sum + d.profitINR, 0)))}
          </p>
        </div>
      </div>
    </div>
  )
}
