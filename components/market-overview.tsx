"use client"

import { TrendingUp, TrendingDown, Activity } from "lucide-react"

const marketIndices = [
  { name: "NIFTY 50", value: 24567.35, change: 156.78, changePercent: 0.64 },
  { name: "SENSEX", value: 81234.56, change: 478.9, changePercent: 0.59 },
  { name: "BANK NIFTY", value: 52345.67, change: -123.45, changePercent: -0.24 },
  { name: "INDIA VIX", value: 12.34, change: -0.56, changePercent: -4.34 },
]

export function MarketOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {marketIndices.map((index) => {
        const isPositive = index.change > 0

        return (
          <div key={index.name} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{index.name}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {index.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? "+" : ""}
                {index.change.toFixed(2)}
              </span>
              <span>
                ({isPositive ? "+" : ""}
                {index.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
