import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AITradingStore {
  isAIEnabled: boolean
  aiTrades: AITrade[]
  toggleAI: () => void
  addAITrade: (trade: AITrade) => void
  clearAITrades: () => void
}

export interface AITrade {
  id: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
  reason: string
  timestamp: Date
  profit?: number
}

export const useAITradingStore = create<AITradingStore>()(
  persist(
    (set, get) => ({
      isAIEnabled: false,
      aiTrades: [],

      toggleAI: () => {
        set((state) => ({ isAIEnabled: !state.isAIEnabled }))
      },

      addAITrade: (trade: AITrade) => {
        set((state) => ({
          aiTrades: [trade, ...state.aiTrades].slice(0, 50),
        }))
      },

      clearAITrades: () => {
        set({ aiTrades: [] })
      },
    }),
    {
      name: "invest-ai-trading",
    },
  ),
)
