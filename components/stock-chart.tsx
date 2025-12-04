"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StockChartProps {
  symbol: string
  basePrice: number
  isPositive?: boolean
}

function generateChartData(basePrice: number, days = 30, trend: "up" | "down" | "neutral" = "up") {
  const data = []
  let price = basePrice * 0.85

  for (let i = 0; i < days; i++) {
    const trendBias = trend === "up" ? 0.55 : trend === "down" ? 0.45 : 0.5
    const change = (Math.random() - (1 - trendBias)) * (basePrice * 0.03)
    price = Math.max(price + change, basePrice * 0.5)

    if (i === days - 1) {
      price = basePrice
    }

    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return data
}

export function StockChart({ symbol, basePrice, isPositive = true }: StockChartProps) {
  const [data, setData] = useState<{ date: string; price: number }[]>([])

  useEffect(() => {
    setData(generateChartData(basePrice, 30, isPositive ? "up" : "down"))
  }, [basePrice, isPositive])

  const color = isPositive ? "#22c55e" : "#ef4444"

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 10 }}
            tickFormatter={(value) => `$${value}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#gradient-${symbol})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
