"use client"

import type { Stock } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"

interface StockCardProps {
  stock: Stock
  variant?: "default" | "compact"
}

export function StockCard({ stock, variant = "default" }: StockCardProps) {
  const isPositive = stock.changePercent > 0
  const isNegative = stock.changePercent < 0

  const priceUSD = stock.price
  const priceINR = stock.price * USD_TO_INR
  const targetPriceUSD = stock.targetPrice
  const targetPriceINR = stock.targetPrice * USD_TO_INR

  if (variant === "compact") {
    return (
      <Link href={`/trade?symbol=${stock.symbol}`}>
        <div
          className={cn(
            "p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
            stock.prediction === "bullish"
              ? "bg-[#0a1f0a] border-[#22c55e]/30 hover:border-[#22c55e]/60"
              : stock.prediction === "bearish"
                ? "bg-[#1f0a0a] border-[#ef4444]/30 hover:border-[#ef4444]/60"
                : "bg-card border-border hover:border-primary/50",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">${priceUSD.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{formatINR(priceINR)}</p>
              <p
                className={cn(
                  "text-xs font-medium flex items-center justify-end gap-1",
                  isPositive ? "text-[#22c55e]" : isNegative ? "text-[#ef4444]" : "text-muted-foreground",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/trade?symbol=${stock.symbol}`}>
      <div
        className={cn(
          "p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
          stock.prediction === "bullish"
            ? "bg-[#0a1f0a] border-[#22c55e]/30 hover:border-[#22c55e]/60"
            : stock.prediction === "bearish"
              ? "bg-[#1f0a0a] border-[#ef4444]/30 hover:border-[#ef4444]/60"
              : "bg-card border-border hover:border-primary/50",
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-foreground">{stock.symbol}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  stock.prediction === "bullish"
                    ? "bg-[#22c55e]/20 text-[#22c55e]"
                    : stock.prediction === "bearish"
                      ? "bg-[#ef4444]/20 text-[#ef4444]"
                      : "bg-muted text-muted-foreground",
                )}
              >
                AI: {stock.aiScore}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">${priceUSD.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mb-1">{formatINR(priceINR)}</p>
            <p
              className={cn(
                "text-sm font-medium flex items-center justify-end gap-1",
                isPositive ? "text-[#22c55e]" : isNegative ? "text-[#ef4444]" : "text-muted-foreground",
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              {isPositive ? "+" : ""}${Math.abs(stock.change).toFixed(2)} ({isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-semibold text-foreground">${targetPriceUSD.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{formatINR(targetPriceINR)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sector</p>
            <p className="text-sm font-medium text-foreground">{stock.sector}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rec.</p>
            <p
              className={cn(
                "text-sm font-medium",
                stock.recommendation.includes("Buy")
                  ? "text-[#22c55e]"
                  : stock.recommendation.includes("Sell")
                    ? "text-[#ef4444]"
                    : "text-muted-foreground",
              )}
            >
              {stock.recommendation}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
