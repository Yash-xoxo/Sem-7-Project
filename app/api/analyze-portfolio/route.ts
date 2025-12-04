import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { portfolio, trades } = await req.json()

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash", {
        apiKey: "AIzaSyDQ69bUwxtvSwZDPvoBbr2JdM-L4SXy6E0",
      }),
      prompt: `Analyze this investment portfolio and provide insights:

Portfolio Summary:
- Total Value: ₹${(portfolio.totalValue * 83.5).toFixed(2)}
- Cash: ₹${(portfolio.cash * 83.5).toFixed(2)}
- Total Invested: ₹${(portfolio.totalInvested * 83.5).toFixed(2)}
- Profit/Loss: ₹${(portfolio.profitLoss * 83.5).toFixed(2)} (${portfolio.profitLossPercent.toFixed(2)}%)

Holdings:
${JSON.stringify(portfolio.holdings, null, 2)}

Recent Trades:
${JSON.stringify(trades.slice(0, 10), null, 2)}

Provide a comprehensive analysis in JSON format:
{
  "overallHealth": "excellent" | "good" | "fair" | "poor",
  "riskScore": number 1-10,
  "diversificationScore": number 1-10,
  "summary": "2-3 sentence summary",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "predictedReturn": {
    "oneMonth": number (percentage),
    "threeMonths": number (percentage),
    "oneYear": number (percentage)
  }
}

Respond ONLY with valid JSON.`,
    })

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const analysis = JSON.parse(cleanedText)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Portfolio analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze portfolio" }, { status: 500 })
  }
}
