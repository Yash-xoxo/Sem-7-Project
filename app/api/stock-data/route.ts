import { NextResponse } from "next/server"

const FINNHUB_API_KEY = "d4o3im9r01qtrbsikpagd4o3im9r01qtrbsikpb0"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")
  const symbols = searchParams.get("symbols")
  const type = searchParams.get("type") || "quote"

  try {
    if (symbols) {
      const symbolList = symbols.split(",")
      const quotes: Record<string, any> = {}

      const batchSize = 10
      for (let i = 0; i < symbolList.length; i += batchSize) {
        const batch = symbolList.slice(i, i + batchSize)
        const promises = batch.map(async (sym) => {
          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${sym.trim()}&token=${FINNHUB_API_KEY}`,
              { next: { revalidate: 10 } },
            )
            if (response.ok) {
              const data = await response.json()
              if (data && data.c > 0) {
                quotes[sym.trim()] = {
                  c: data.c,
                  d: data.d,
                  dp: data.dp,
                  h: data.h,
                  l: data.l,
                  o: data.o,
                  pc: data.pc,
                  t: data.t,
                }
              }
            }
          } catch (e) {
            console.error(`Error fetching ${sym}:`, e)
          }
        })
        await Promise.all(promises)
        // Small delay between batches to respect rate limits
        if (i + batchSize < symbolList.length) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      return NextResponse.json(quotes)
    }

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 })
    }

    let url = ""

    switch (type) {
      case "quote":
        url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        break
      case "candle":
        const to = Math.floor(Date.now() / 1000)
        const from = to - 30 * 24 * 60 * 60
        url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
        break
      case "profile":
        url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        break
      default:
        url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    }

    const response = await fetch(url, { next: { revalidate: 10 } })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Stock data error:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
