// Finnhub API integration for live stock data
const FINNHUB_API_KEY = "d4o3im9r01qtrbsikpagd4o3im9r01qtrbsikpb0"
const BASE_URL = "https://finnhub.io/api/v1"

// USD to INR conversion rate (approximate)
export const USD_TO_INR = 83.5

export function convertToINR(usd: number): number {
  return usd * USD_TO_INR
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount)
}

export async function getBatchQuotes(symbols: string[]): Promise<Map<string, QuoteData>> {
  const quotes = new Map<string, QuoteData>()

  const batchSize = 10
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    const promises = batch.map(async (symbol) => {
      try {
        const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.c > 0) {
            quotes.set(symbol, {
              currentPrice: data.c,
              change: data.d,
              changePercent: data.dp,
              high: data.h,
              low: data.l,
              open: data.o,
              previousClose: data.pc,
              timestamp: data.t,
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error)
      }
    })
    await Promise.all(promises)
    if (i + batchSize < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return quotes
}

export interface QuoteData {
  currentPrice: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: number
}

export async function getQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch quote")
    const data = await response.json()

    if (!data || data.c === 0) return null

    return {
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
    }
  } catch (error) {
    console.error("Error fetching quote:", error)
    return null
  }
}

export async function getCandles(symbol: string, resolution = "D", from: number, to: number) {
  try {
    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
    )
    if (!response.ok) throw new Error("Failed to fetch candles")
    return await response.json()
  } catch (error) {
    console.error("Error fetching candles:", error)
    return null
  }
}

export async function getCompanyNews(symbol: string) {
  const to = new Date().toISOString().split("T")[0]
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  try {
    const response = await fetch(
      `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
    )
    if (!response.ok) throw new Error("Failed to fetch news")
    return await response.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export async function getMarketStatus() {
  try {
    const response = await fetch(`${BASE_URL}/stock/market-status?exchange=US&token=${FINNHUB_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch market status")
    return await response.json()
  } catch (error) {
    console.error("Error fetching market status:", error)
    return null
  }
}

export const TRACKED_SYMBOLS = [
  // Tech Giants
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "AMD",
  "INTC",
  "NFLX",
  // Finance
  "JPM",
  "V",
  "MA",
  "BAC",
  "GS",
  "MS",
  "WFC",
  "C",
  // Healthcare
  "UNH",
  "JNJ",
  "PFE",
  "ABBV",
  "MRK",
  "LLY",
  // Consumer
  "WMT",
  "PG",
  "KO",
  "PEP",
  "MCD",
  "NKE",
  "SBUX",
  "DIS",
  // Energy & Industrial
  "XOM",
  "CVX",
  "CAT",
  "BA",
  "GE",
  "HON",
  // Communication
  "VZ",
  "T",
  "CMCSA",
  "TMUS",
]
