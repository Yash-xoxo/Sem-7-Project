"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CandlestickChart } from "@/components/candlestick-chart"
import { AISentimentOverlay } from "@/components/ai-sentiment-overlay"
import { Chatbot } from "@/components/chatbot"
import { stocksData, updateStockPrice } from "@/lib/stock-data"
import { usePortfolioStore } from "@/lib/portfolio-store"
import { formatINR, USD_TO_INR } from "@/lib/finnhub"
import type { Stock } from "@/lib/types"
import { Search, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Minus, Plus, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function TradePage() {
  const searchParams = useSearchParams()
  const symbolParam = searchParams.get("symbol")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [stocks, setStocks] = useState<Stock[]>(stocksData)
  const [loading, setLoading] = useState(true)

  const { portfolio, buyStock, sellStock } = usePortfolioStore()

  const fetchLiveData = async () => {
    try {
      const symbols = stocksData.map((s) => s.symbol).join(",")
      const response = await fetch(`/api/stock-data?symbols=${symbols}`)

      if (response.ok) {
        const liveData = await response.json()
        setStocks((prev) => {
          const updated = prev.map((stock) => {
            const live = liveData[stock.symbol]
            if (live && live.c > 0) {
              return updateStockPrice(stock, live)
            }
            return stock
          })
          // Update selected stock if it exists
          if (selectedStock) {
            const updatedSelected = updated.find((s) => s.symbol === selectedStock.symbol)
            if (updatedSelected) {
              setSelectedStock(updatedSelected)
            }
          }
          return updated
        })
      }
    } catch (error) {
      console.error("Error fetching live data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (symbolParam) {
      const stock = stocks.find((s) => s.symbol === symbolParam)
      if (stock) {
        setSelectedStock(stock)
      }
    }
  }, [symbolParam, stocks])

  const filteredStocks = stocks
    .filter(
      (stock: Stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 8)

  const handleTrade = () => {
    if (!selectedStock || quantity <= 0) return

    const total = selectedStock.price * quantity

    if (tradeType === "buy") {
      if (total > portfolio.cash) {
        setMessage({ type: "error", text: "Insufficient funds for this purchase" })
        return
      }
      const success = buyStock(selectedStock.symbol, quantity)
      if (success) {
        setMessage({ type: "success", text: `Successfully bought ${quantity} shares of ${selectedStock.symbol}` })
        setQuantity(1)
      }
    } else {
      const holding = portfolio.holdings.find((h) => h.symbol === selectedStock.symbol)
      if (!holding || holding.quantity < quantity) {
        setMessage({ type: "error", text: `You don't own enough shares of ${selectedStock.symbol}` })
        return
      }
      const success = sellStock(selectedStock.symbol, quantity)
      if (success) {
        setMessage({ type: "success", text: `Successfully sold ${quantity} shares of ${selectedStock.symbol}` })
        setQuantity(1)
      }
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const getHolding = (symbol: string) => {
    return portfolio.holdings.find((h) => h.symbol === symbol)
  }

  const virtualCashUSD = 100000

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Virtual Trading</h1>
              <p className="text-muted-foreground">
                Practice trading with ${virtualCashUSD.toLocaleString()} ({formatINR(virtualCashUSD * USD_TO_INR)})
                virtual cash
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating prices...</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={cn(
              "mb-6 p-4 rounded-lg border",
              message.type === "success"
                ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]",
            )}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Search and List */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Stock</h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStocks.map((stock: Stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all border",
                      selectedStock?.symbol === stock.symbol
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary border-transparent hover:border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${stock.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(stock.price * USD_TO_INR)}</p>
                        <p
                          className={cn(
                            "text-xs",
                            stock.changePercent > 0
                              ? "text-[#22c55e]"
                              : stock.changePercent < 0
                                ? "text-[#ef4444]"
                                : "text-muted-foreground",
                          )}
                        >
                          {stock.changePercent > 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-2">
            {selectedStock ? (
              <div className="space-y-6">
                {/* Stock Info */}
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-foreground">{selectedStock.symbol}</h2>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            selectedStock.prediction === "bullish"
                              ? "bg-[#22c55e]/20 text-[#22c55e]"
                              : "bg-[#ef4444]/20 text-[#ef4444]",
                          )}
                        >
                          {selectedStock.prediction === "bullish" ? "AI Recommends" : "AI Warns"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{selectedStock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-foreground">${selectedStock.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatINR(selectedStock.price * USD_TO_INR)}
                      </p>
                      <p
                        className={cn(
                          "flex items-center justify-end gap-1 font-medium",
                          selectedStock.changePercent > 0 ? "text-[#22c55e]" : "text-[#ef4444]",
                        )}
                      >
                        {selectedStock.changePercent > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {selectedStock.changePercent > 0 ? "+" : ""}${Math.abs(selectedStock.change).toFixed(2)} (
                        {selectedStock.changePercent > 0 ? "+" : ""}
                        {selectedStock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>

                  <AISentimentOverlay
                    sentiment={selectedStock.prediction === "bullish" ? "positive" : "negative"}
                    score={selectedStock.aiScore}
                    recommendation={`${selectedStock.recommendation} - Target: $${selectedStock.targetPrice} (${formatINR(selectedStock.targetPrice * USD_TO_INR)})`}
                  />

                  <div className="mt-4">
                    <CandlestickChart symbol={selectedStock.symbol} basePrice={selectedStock.price} />
                  </div>
                </div>

                {/* Trade Form */}
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Place Order</h3>

                  {/* Trade Type Toggle */}
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={tradeType === "buy" ? "default" : "secondary"}
                      className={cn("flex-1", tradeType === "buy" && "bg-[#22c55e] hover:bg-[#22c55e]/90 text-white")}
                      onClick={() => setTradeType("buy")}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy
                    </Button>
                    <Button
                      variant={tradeType === "sell" ? "default" : "secondary"}
                      className={cn("flex-1", tradeType === "sell" && "bg-[#ef4444] hover:bg-[#ef4444]/90 text-white")}
                      onClick={() => setTradeType("sell")}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sell
                    </Button>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="text-sm text-muted-foreground mb-2 block">Quantity</label>
                    <div className="flex items-center gap-4">
                      <Button variant="secondary" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="w-24 text-center bg-secondary border-border"
                      />
                      <Button variant="secondary" size="icon" onClick={() => setQuantity(quantity + 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Order Summary - Show both USD and INR */}
                  <div className="p-4 rounded-lg bg-secondary mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Price per share</span>
                      <div className="text-right">
                        <span className="text-foreground">${selectedStock.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatINR(selectedStock.price * USD_TO_INR)})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="text-foreground">{quantity}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">
                          ${(selectedStock.price * quantity).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatINR(selectedStock.price * quantity * USD_TO_INR)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="flex justify-between text-sm mb-6">
                    <span className="text-muted-foreground">Available Cash</span>
                    <div>
                      <span className="font-semibold text-[#22c55e]">${portfolio.cash.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({formatINR(portfolio.cash * USD_TO_INR)})
                      </span>
                    </div>
                  </div>

                  {getHolding(selectedStock.symbol) && (
                    <div className="flex justify-between text-sm mb-6">
                      <span className="text-muted-foreground">Owned Shares</span>
                      <span className="font-semibold text-foreground">
                        {getHolding(selectedStock.symbol)?.quantity}
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    className={cn(
                      "w-full py-6 text-lg font-semibold",
                      tradeType === "buy"
                        ? "bg-[#22c55e] hover:bg-[#22c55e]/90 text-white"
                        : "bg-[#ef4444] hover:bg-[#ef4444]/90 text-white",
                    )}
                    onClick={handleTrade}
                  >
                    {tradeType === "buy" ? "Buy" : "Sell"} {selectedStock.symbol}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-xl bg-card border border-border text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Select a Stock</h3>
                <p className="text-muted-foreground">Search and select a stock from the list to start trading</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
