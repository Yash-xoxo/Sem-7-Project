import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { symbol, price, holdings, portfolio } = await request.json()

    const prompt = `You are a professional financial advisor AI. Analyze the following stock/portfolio data and provide insights:

Stock Symbol: ${symbol || "Portfolio Analysis"}
Current Price: $${price || "N/A"}
Holdings: ${JSON.stringify(holdings || [])}
Portfolio Value: $${portfolio?.totalValue || "N/A"}
Profit/Loss: $${portfolio?.profitLoss || "N/A"}

Provide:
1. A brief market sentiment analysis
2. Risk assessment (low/medium/high)
3. Key insights (2-3 bullet points)
4. A specific recommendation

Keep your response concise and actionable.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("AI Analysis error:", error)
    return Response.json({
      analysis: "Unable to generate AI analysis at this time. Please try again later.",
      error: true,
    })
  }
}
