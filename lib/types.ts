export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  sector: string
  prediction: "bullish" | "bearish" | "neutral"
  aiScore: number
  targetPrice: number
  recommendation: string
  open?: number
  high?: number
  low?: number
  close?: number
  sentiment?: "positive" | "negative" | "neutral"
  sentimentScore?: number
}

export interface Trade {
  id: string
  symbol: string
  name: string
  type: "buy" | "sell"
  quantity: number
  price: number
  total: number
  timestamp: Date
  status: "completed" | "pending"
}

export interface Portfolio {
  cash: number
  holdings: Holding[]
  totalValue: number
  totalInvested: number
  profitLoss: number
  profitLossPercent: number
}

export interface Holding {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  value: number
  profitLoss: number
  profitLossPercent: number
}

export interface AIAnalysis {
  summary: string
  sentiment: "positive" | "negative" | "neutral"
  keyInsights: string[]
  riskLevel: "low" | "medium" | "high"
  recommendation: string
}

export interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface FinnhubQuote {
  c: number // Current price
  d: number // Change
  dp: number // Percent change
  h: number // High
  l: number // Low
  o: number // Open
  pc: number // Previous close
  t: number // Timestamp
}
