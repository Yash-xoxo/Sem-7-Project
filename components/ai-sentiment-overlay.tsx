"use client"

import { cn } from "@/lib/utils"
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AISentimentOverlayProps {
  sentiment: "positive" | "negative" | "neutral"
  score: number
  recommendation: string
}

export function AISentimentOverlay({ sentiment, score, recommendation }: AISentimentOverlayProps) {
  const getSentimentColor = () => {
    switch (sentiment) {
      case "positive":
        return "from-[#22c55e]/20 to-transparent border-[#22c55e]/30"
      case "negative":
        return "from-[#ef4444]/20 to-transparent border-[#ef4444]/30"
      default:
        return "from-yellow-500/20 to-transparent border-yellow-500/30"
    }
  }

  const getSentimentIcon = () => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-5 h-5 text-[#22c55e]" />
      case "negative":
        return <TrendingDown className="w-5 h-5 text-[#ef4444]" />
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />
    }
  }

  const getSentimentText = () => {
    switch (sentiment) {
      case "positive":
        return "text-[#22c55e]"
      case "negative":
        return "text-[#ef4444]"
      default:
        return "text-yellow-500"
    }
  }

  return (
    <div className={cn("p-4 rounded-lg bg-gradient-to-r border", getSentimentColor())}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-card/50">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">AI Sentiment</p>
            <div className="flex items-center gap-2">
              {getSentimentIcon()}
              <span className={cn("font-semibold capitalize", getSentimentText())}>{sentiment}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className={cn("text-xl font-bold", getSentimentText())}>{score}%</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Recommendation:</span> {recommendation}
        </p>
      </div>
    </div>
  )
}
