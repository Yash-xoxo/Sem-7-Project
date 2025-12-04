"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAITradingStore, type AITrade } from "@/lib/ai-trading-store"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { getAllStocks } from "@/lib/stock-data"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import { Bot, Power, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AITradingToggle() {
  const { isAIEnabled, toggleAI, aiTrades, addAITrade } = useAITradingStore()
  const { portfolio, buyStock, sellStock } = usePortfolioStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastAction, setLastAction] = useState<string>("")

  // AI trading logic
  useEffect(() => {
    if (!isAIEnabled) return

    const executeAITrade = async () => {
      setIsProcessing(true)

      try {
        const stocks = getAllStocks()

        const response = await fetch("/api/ai-trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio,
            stocks,
            action: "analyze",
          }),
        })

        if (response.ok) {
          const recommendation = await response.json()

          if (recommendation.action && recommendation.symbol) {
            const stock = stocks.find((s) => s.symbol === recommendation.symbol)

            if (stock) {
              let success = false

              if (recommendation.action === "buy") {
                const maxQuantity = Math.floor((portfolio.cash * 0.1) / stock.price)
                const quantity = Math.min(recommendation.quantity || 1, maxQuantity)

                if (quantity > 0) {
                  success = buyStock(stock.symbol, quantity)
                  if (success) {
                    const trade: AITrade = {
                      id: Date.now().toString(),
                      symbol: stock.symbol,
                      type: "buy",
                      quantity,
                      price: stock.price,
                      reason: recommendation.reason,
                      timestamp: new Date(),
                    }
                    addAITrade(trade)
                    setLastAction(`Bought ${quantity} ${stock.symbol}`)
                  }
                }
              } else if (recommendation.action === "sell") {
                const holding = portfolio.holdings.find((h) => h.symbol === stock.symbol)
                if (holding) {
                  const quantity = Math.min(recommendation.quantity || 1, holding.quantity)
                  success = sellStock(stock.symbol, quantity)
                  if (success) {
                    const trade: AITrade = {
                      id: Date.now().toString(),
                      symbol: stock.symbol,
                      type: "sell",
                      quantity,
                      price: stock.price,
                      reason: recommendation.reason,
                      timestamp: new Date(),
                      profit: (stock.price - holding.avgPrice) * quantity,
                    }
                    addAITrade(trade)
                    setLastAction(`Sold ${quantity} ${stock.symbol}`)
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("AI trading error:", error)
      } finally {
        setIsProcessing(false)
      }
    }

    // Execute trade every 30 seconds when AI is enabled
    const interval = setInterval(executeAITrade, 30000)
    executeAITrade() // Execute immediately on enable

    return () => clearInterval(interval)
  }, [isAIEnabled, portfolio, buyStock, sellStock, addAITrade])

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-3 rounded-xl transition-all",
              isAIEnabled ? "bg-primary text-primary-foreground animate-pulse" : "bg-secondary text-muted-foreground",
            )}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Auto-Trading</h3>
            <p className="text-sm text-muted-foreground">
              {isAIEnabled ? "AI is actively trading" : "Enable AI to trade automatically"}
            </p>
          </div>
        </div>

        <Button
          variant={isAIEnabled ? "destructive" : "default"}
          size="lg"
          onClick={toggleAI}
          className={cn("gap-2", isAIEnabled && "bg-[#ef4444] hover:bg-[#ef4444]/90")}
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Power className="w-5 h-5" />}
          {isAIEnabled ? "Stop AI" : "Switch to AI"}
        </Button>
      </div>

      {isAIEnabled && (
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 text-primary">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing market...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span className="text-sm">{lastAction || "Waiting for opportunity..."}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent AI Trades */}
      {aiTrades.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Recent AI Trades</p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {aiTrades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  {trade.type === "buy" ? (
                    <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {trade.type === "buy" ? "Bought" : "Sold"} {trade.quantity} {trade.symbol}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatINR(trade.price * trade.quantity * USD_TO_INR)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
