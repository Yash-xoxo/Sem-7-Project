"use client"

import { usePortfolioStore } from "@/lib/portfolio-store"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export function PortfolioSummary() {
  const { portfolio } = usePortfolioStore()
  const isProfit = portfolio.profitLoss >= 0

  const totalValueINR = portfolio.totalValue * USD_TO_INR
  const cashINR = portfolio.cash * USD_TO_INR
  const investedINR = portfolio.totalInvested * USD_TO_INR
  const profitLossINR = portfolio.profitLoss * USD_TO_INR

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Total Value</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{formatINR(totalValueINR)}</p>
      </div>

      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-[#22c55e]" />
          </div>
          <span className="text-sm text-muted-foreground">Cash Available</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{formatINR(cashINR)}</p>
      </div>

      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm text-muted-foreground">Invested</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{formatINR(investedINR)}</p>
      </div>

      <div
        className={cn(
          "p-5 rounded-xl border",
          isProfit ? "bg-[#0a1f0a] border-[#22c55e]/30" : "bg-[#1f0a0a] border-[#ef4444]/30",
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isProfit ? "bg-[#22c55e]/20" : "bg-[#ef4444]/20",
            )}
          >
            {isProfit ? (
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">P&L</span>
        </div>
        <p className={cn("text-2xl font-bold", isProfit ? "text-[#22c55e]" : "text-[#ef4444]")}>
          {isProfit ? "+" : ""}
          {formatINR(profitLossINR)}
        </p>
        <p className={cn("text-sm font-medium", isProfit ? "text-[#22c55e]" : "text-[#ef4444]")}>
          ({isProfit ? "+" : ""}
          {portfolio.profitLossPercent.toFixed(2)}%)
        </p>
      </div>
    </div>
  )
}
