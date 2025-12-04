"use client"

import { useEffect, useState } from "react"

export function FearGreedIndex() {
  const [value, setValue] = useState(55)
  const [label, setLabel] = useState<string>("Neutral")

  useEffect(() => {
    // Simulate changing fear/greed based on market conditions
    const updateIndex = () => {
      const newValue = Math.floor(Math.random() * 30) + 40 // 40-70 range
      setValue(newValue)
    }

    updateIndex()
    const interval = setInterval(updateIndex, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (value <= 25) setLabel("Extreme Fear")
    else if (value <= 40) setLabel("Fear")
    else if (value <= 60) setLabel("Neutral")
    else if (value <= 75) setLabel("Greed")
    else setLabel("Extreme Greed")
  }, [value])

  const getColor = () => {
    if (value <= 25) return "#ef4444"
    if (value <= 40) return "#f97316"
    if (value <= 60) return "#eab308"
    if (value <= 75) return "#84cc16"
    return "#22c55e"
  }

  const rotation = (value / 100) * 180 - 90 // -90 to 90 degrees

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Fear & Greed Index</h3>

      <div className="relative w-48 h-24 mx-auto mb-4">
        {/* Gauge background */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#333" strokeWidth="20" strokeLinecap="round" />
          {/* Colored segments */}
          <path d="M 10 100 A 90 90 0 0 1 55 25" fill="none" stroke="#ef4444" strokeWidth="20" strokeLinecap="round" />
          <path d="M 55 25 A 90 90 0 0 1 100 10" fill="none" stroke="#f97316" strokeWidth="20" />
          <path d="M 100 10 A 90 90 0 0 1 145 25" fill="none" stroke="#eab308" strokeWidth="20" />
          <path
            d="M 145 25 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={getColor()}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 100)`}
          />
          <circle cx="100" cy="100" r="8" fill={getColor()} />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold mb-1" style={{ color: getColor() }}>
          {value}
        </p>
        <p className="text-sm font-medium" style={{ color: getColor() }}>
          {label}
        </p>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-4">
        <span>Extreme Fear</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  )
}
