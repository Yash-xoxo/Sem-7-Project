"use client"

import { useEffect, useState, useMemo } from "react"
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  symbol: string
  basePrice: number
}

function generateCandlestickData(basePrice: number, days = 30): CandlestickData[] {
  const data: CandlestickData[] = []
  let currentPrice = basePrice * 0.9

  for (let i = 0; i < days; i++) {
    const volatility = 0.03
    const open = currentPrice
    const change = (Math.random() - 0.45) * basePrice * volatility
    const close = open + change
    const high = Math.max(open, close) + Math.random() * basePrice * 0.01
    const low = Math.min(open, close) - Math.random() * basePrice * 0.01
    const volume = Math.floor(Math.random() * 50000000) + 10000000

    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })

    currentPrice = close
  }

  return data
}

// Custom candlestick shape
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props
  const { open, close, high, low } = payload
  const isUp = close >= open

  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(open, close)
  const wickX = x + width / 2

  const scale = height / (high - low)
  const scaledHigh = 0
  const scaledLow = height
  const scaledOpen = (high - open) * scale
  const scaledClose = (high - close) * scale
  const scaledBodyTop = Math.min(scaledOpen, scaledClose)
  const scaledBodyHeight = Math.max(Math.abs(scaledClose - scaledOpen), 1)

  return (
    <g>
      {/* Wick */}
      <line
        x1={wickX}
        y1={y + scaledHigh}
        x2={wickX}
        y2={y + scaledLow}
        stroke={isUp ? "#22c55e" : "#ef4444"}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + 2}
        y={y + scaledBodyTop}
        width={width - 4}
        height={scaledBodyHeight}
        fill={isUp ? "#22c55e" : "#ef4444"}
        stroke={isUp ? "#22c55e" : "#ef4444"}
      />
    </g>
  )
}

export function CandlestickChart({ symbol, basePrice }: CandlestickChartProps) {
  const [data, setData] = useState<CandlestickData[]>([])

  useEffect(() => {
    setData(generateCandlestickData(basePrice, 30))
  }, [basePrice])

  const [minPrice, maxPrice] = useMemo(() => {
    if (data.length === 0) return [0, 0]
    const lows = data.map((d) => d.low)
    const highs = data.map((d) => d.high)
    return [Math.min(...lows) * 0.98, Math.max(...highs) * 1.02]
  }, [data])

  const avgPrice = useMemo(() => {
    if (data.length === 0) return 0
    return data.reduce((sum, d) => sum + d.close, 0) / data.length
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 10 }}
            tickFormatter={(value) => formatINR(value * USD_TO_INR)}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload
                const isUp = d.close >= d.open
                return (
                  <div className="p-3 bg-card border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{d.date}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground">Open:</span>
                      <span className="text-foreground">{formatINR(d.open * USD_TO_INR)}</span>
                      <span className="text-muted-foreground">High:</span>
                      <span className="text-foreground">{formatINR(d.high * USD_TO_INR)}</span>
                      <span className="text-muted-foreground">Low:</span>
                      <span className="text-foreground">{formatINR(d.low * USD_TO_INR)}</span>
                      <span className="text-muted-foreground">Close:</span>
                      <span className={isUp ? "text-[#22c55e]" : "text-[#ef4444]"}>
                        {formatINR(d.close * USD_TO_INR)}
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine
            y={avgPrice}
            stroke="#666"
            strokeDasharray="3 3"
            label={{ value: "Avg", fill: "#666", fontSize: 10 }}
          />
          <Bar dataKey="high" shape={<CandlestickShape />} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
