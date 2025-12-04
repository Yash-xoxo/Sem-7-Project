import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { portfolio, stocks, action } = await req.json()

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001", {
        apiKey: "AIzaSyCffOjfPkw5wo2ryhI7pvEdSnfLnP7QLT8",
      }),
      prompt: `You are an AI trading bot analyzing a portfolio for optimal trades.

Current Portfolio:
${JSON.stringify(portfolio, null, 2)}

Available Stocks:
${JSON.stringify(stocks, null, 2)}

Action requested: ${action}

Analyze the portfolio and provide a JSON response with trading recommendations.
Format your response as valid JSON with this structure:
{
  "action": "buy" or "sell",
  "symbol": "STOCK_SYMBOL",
  "quantity": number,
  "reason": "Brief explanation",
  "confidence": number between 0-100,
  "expectedProfit": number (percentage)
}

Consider:
1. AI scores of stocks (higher is better for buying)
2. Current holdings and diversification
3. Risk management (don't put all eggs in one basket)
4. Take profits on highly profitable positions
5. Cut losses on losing positions

Respond ONLY with valid JSON, no other text.`,
    })

    // Parse the AI response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const recommendation = JSON.parse(cleanedText)

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error("AI Trading error:", error)
    return NextResponse.json({ error: "Failed to generate trading recommendation" }, { status: 500 })
  }
}
