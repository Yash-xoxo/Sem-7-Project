"use client"

import { Navbar } from "@/components/navbar"
import { Chatbot } from "@/components/chatbot"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { useAITradingStore } from "@/lib/ai-trading-store"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { History, TrendingUp, TrendingDown, Clock, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { trades } = usePortfolioStore()
  const { aiTrades } = useAITradingStore()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trade History</h1>
          <p className="text-muted-foreground">View all your past trades and transactions</p>
        </div>

        {aiTrades.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">AI Auto-Trades</h2>
            </div>
            <div className="space-y-3">
              {aiTrades.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    trade.type === "buy" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-[#ef4444]/5 border-[#ef4444]/20",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          trade.type === "buy" ? "bg-[#22c55e]/20" : "bg-[#ef4444]/20",
                        )}
                      >
                        {trade.type === "buy" ? (
                          <TrendingUp className="w-5 h-5 text-[#22c55e]" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-[#ef4444]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{trade.symbol}</span>
                          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">AI Trade</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{trade.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", trade.type === "buy" ? "text-[#22c55e]" : "text-[#ef4444]")}>
                        {trade.type === "buy" ? "-" : "+"}
                        {formatINR(trade.price * trade.quantity * USD_TO_INR)}
                      </p>
                      <p className="text-xs text-muted-foreground">{trade.quantity} shares</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manual Trades */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Manual Trades</h2>

          {trades.length > 0 ? (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={cn(
                    "p-5 rounded-xl border transition-all",
                    trade.type === "buy" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-[#ef4444]/5 border-[#ef4444]/20",
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          trade.type === "buy" ? "bg-[#22c55e]/20" : "bg-[#ef4444]/20",
                        )}
                      >
                        {trade.type === "buy" ? (
                          <TrendingUp className="w-6 h-6 text-[#22c55e]" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-[#ef4444]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                              trade.type === "buy"
                                ? "bg-[#22c55e]/20 text-[#22c55e]"
                                : "bg-[#ef4444]/20 text-[#ef4444]",
                            )}
                          >
                            {trade.type}
                          </span>
                          <span className="font-bold text-foreground">{trade.symbol}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{trade.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-foreground">{trade.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold text-foreground">{formatINR(trade.price * USD_TO_INR)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className={cn("font-bold", trade.type === "buy" ? "text-[#22c55e]" : "text-[#ef4444]")}>
                            {trade.type === "buy" ? "-" : "+"}
                            {formatINR(trade.total * USD_TO_INR)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(trade.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-card border border-border text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Trade History</h3>
              <p className="text-muted-foreground">Your trading history will appear here once you start trading</p>
            </div>
          )}
        </section>
      </main>

      <Chatbot />
    </div>
  )
}
