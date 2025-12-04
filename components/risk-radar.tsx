"use client"

import { useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { getStockBySymbol } from "@/lib/stock-data"

export function RiskRadar() {
  const { portfolio } = usePortfolioStore()

  const riskData = useMemo(() => {
    const holdings = portfolio.holdings

    // Calculate various risk metrics
    const diversification = Math.min(holdings.length * 15, 100) // More holdings = better diversification

    const volatility =
      holdings.length > 0
        ? (holdings.reduce((sum, h) => {
            const stock = getStockBySymbol(h.symbol)
            return sum + Math.abs(stock?.changePercent || 0)
          }, 0) /
            holdings.length) *
          10
        : 50

    const sectorConcentration = holdings.length > 0 ? 70 : 50

    const aiAlignment =
      holdings.length > 0
        ? (holdings.reduce((sum, h) => {
            const stock = getStockBySymbol(h.symbol)
            return sum + (stock?.prediction === "bullish" ? 1 : 0)
          }, 0) /
            holdings.length) *
          100
        : 50

    const liquidityRisk = (portfolio.cash / portfolio.totalValue) * 100

    const profitStability =
      portfolio.profitLossPercent >= 0
        ? Math.min(50 + portfolio.profitLossPercent * 5, 100)
        : Math.max(50 + portfolio.profitLossPercent * 5, 0)

    return [
      { metric: "Diversification", value: diversification, fullMark: 100 },
      { metric: "Low Volatility", value: 100 - volatility, fullMark: 100 },
      { metric: "Sector Balance", value: sectorConcentration, fullMark: 100 },
      { metric: "AI Alignment", value: aiAlignment, fullMark: 100 },
      { metric: "Liquidity", value: liquidityRisk, fullMark: 100 },
      { metric: "Profit Stability", value: profitStability, fullMark: 100 },
    ]
  }, [portfolio])

  const overallScore = useMemo(() => {
    return Math.round(riskData.reduce((sum, d) => sum + d.value, 0) / riskData.length)
  }, [riskData])

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Risk Radar</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{overallScore}</p>
          <p className="text-xs text-muted-foreground">Risk Score</p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={riskData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#888", fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#666", fontSize: 10 }} />
            <Radar
              name="Risk Profile"
              dataKey="value"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toFixed(0)}%`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
