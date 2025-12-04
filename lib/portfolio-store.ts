import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Portfolio, Trade, Holding } from "./types"
import { getStockBySymbol } from "./stock-data"

interface PortfolioStore {
  portfolio: Portfolio
  trades: Trade[]
  buyStock: (symbol: string, quantity: number) => boolean
  sellStock: (symbol: string, quantity: number) => boolean
  updatePrices: () => void
  resetPortfolio: () => void
}

const INITIAL_CASH = 100000 // $100,000 virtual cash

const initialPortfolio: Portfolio = {
  cash: INITIAL_CASH,
  holdings: [],
  totalValue: INITIAL_CASH,
  totalInvested: 0,
  profitLoss: 0,
  profitLossPercent: 0,
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      portfolio: initialPortfolio,
      trades: [],

      buyStock: (symbol: string, quantity: number) => {
        const stock = getStockBySymbol(symbol)
        if (!stock) return false

        const total = stock.price * quantity
        const { portfolio, trades } = get()

        if (total > portfolio.cash) return false

        const existingHolding = portfolio.holdings.find((h) => h.symbol === symbol)
        let newHoldings: Holding[]

        if (existingHolding) {
          const newQuantity = existingHolding.quantity + quantity
          const newAvgPrice = (existingHolding.avgPrice * existingHolding.quantity + total) / newQuantity
          newHoldings = portfolio.holdings.map((h) =>
            h.symbol === symbol
              ? {
                  ...h,
                  quantity: newQuantity,
                  avgPrice: newAvgPrice,
                  value: newQuantity * stock.price,
                  profitLoss: (stock.price - newAvgPrice) * newQuantity,
                  profitLossPercent: ((stock.price - newAvgPrice) / newAvgPrice) * 100,
                }
              : h,
          )
        } else {
          newHoldings = [
            ...portfolio.holdings,
            {
              symbol: stock.symbol,
              name: stock.name,
              quantity,
              avgPrice: stock.price,
              currentPrice: stock.price,
              value: total,
              profitLoss: 0,
              profitLossPercent: 0,
            },
          ]
        }

        const newCash = portfolio.cash - total
        const totalInvested = newHoldings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0)
        const holdingsValue = newHoldings.reduce((sum, h) => sum + h.value, 0)
        const totalValue = newCash + holdingsValue
        const profitLoss = holdingsValue - totalInvested

        const newTrade: Trade = {
          id: Date.now().toString(),
          symbol: stock.symbol,
          name: stock.name,
          type: "buy",
          quantity,
          price: stock.price,
          total,
          timestamp: new Date(),
          status: "completed",
        }

        set({
          portfolio: {
            cash: newCash,
            holdings: newHoldings,
            totalValue,
            totalInvested,
            profitLoss,
            profitLossPercent: totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0,
          },
          trades: [newTrade, ...trades],
        })

        return true
      },

      sellStock: (symbol: string, quantity: number) => {
        const stock = getStockBySymbol(symbol)
        if (!stock) return false

        const { portfolio, trades } = get()
        const holding = portfolio.holdings.find((h) => h.symbol === symbol)

        if (!holding || holding.quantity < quantity) return false

        const total = stock.price * quantity
        const newQuantity = holding.quantity - quantity

        let newHoldings: Holding[]
        if (newQuantity === 0) {
          newHoldings = portfolio.holdings.filter((h) => h.symbol !== symbol)
        } else {
          newHoldings = portfolio.holdings.map((h) =>
            h.symbol === symbol
              ? {
                  ...h,
                  quantity: newQuantity,
                  value: newQuantity * stock.price,
                  profitLoss: (stock.price - h.avgPrice) * newQuantity,
                  profitLossPercent: ((stock.price - h.avgPrice) / h.avgPrice) * 100,
                }
              : h,
          )
        }

        const newCash = portfolio.cash + total
        const totalInvested = newHoldings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0)
        const holdingsValue = newHoldings.reduce((sum, h) => sum + h.value, 0)
        const totalValue = newCash + holdingsValue
        const profitLoss = holdingsValue - totalInvested

        const newTrade: Trade = {
          id: Date.now().toString(),
          symbol: stock.symbol,
          name: stock.name,
          type: "sell",
          quantity,
          price: stock.price,
          total,
          timestamp: new Date(),
          status: "completed",
        }

        set({
          portfolio: {
            cash: newCash,
            holdings: newHoldings,
            totalValue,
            totalInvested,
            profitLoss,
            profitLossPercent: totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0,
          },
          trades: [newTrade, ...trades],
        })

        return true
      },

      updatePrices: () => {
        const { portfolio } = get()

        const newHoldings = portfolio.holdings.map((h) => {
          const stock = getStockBySymbol(h.symbol)
          if (!stock) return h

          return {
            ...h,
            currentPrice: stock.price,
            value: h.quantity * stock.price,
            profitLoss: (stock.price - h.avgPrice) * h.quantity,
            profitLossPercent: ((stock.price - h.avgPrice) / h.avgPrice) * 100,
          }
        })

        const holdingsValue = newHoldings.reduce((sum, h) => sum + h.value, 0)
        const totalInvested = newHoldings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0)
        const totalValue = portfolio.cash + holdingsValue
        const profitLoss = holdingsValue - totalInvested

        set({
          portfolio: {
            ...portfolio,
            holdings: newHoldings,
            totalValue,
            profitLoss,
            profitLossPercent: totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0,
          },
        })
      },

      resetPortfolio: () => {
        set({
          portfolio: initialPortfolio,
          trades: [],
        })
      },
    }),
    {
      name: "invest-ai-portfolio",
    },
  ),
)
