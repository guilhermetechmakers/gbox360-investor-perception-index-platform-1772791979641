import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IPICalculateResult } from "@/types/ipi"
import { BarChart2, Shield, TrendingUp } from "lucide-react"

interface IPIBreakdownPanelProps {
  result: IPICalculateResult | null
  isLoading?: boolean
  className?: string
}

export function IPIBreakdownPanel({ result, isLoading, className }: IPIBreakdownPanelProps) {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-32 rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!result) return null

  const { breakdown, weightsUsed, explainability } = result

  const items = [
    {
      label: "Narrative",
      score: breakdown.narrative.score,
      contribution: breakdown.narrative.contribution,
      explanation: breakdown.narrative.explanation,
      icon: BarChart2,
      color: "text-primary",
    },
    {
      label: "Credibility",
      score: breakdown.credibility.score,
      contribution: breakdown.credibility.contribution,
      explanation: breakdown.credibility.explanation,
      icon: Shield,
      color: "text-secondary",
    },
    {
      label: "Risk",
      score: breakdown.risk.score,
      contribution: breakdown.risk.contribution,
      explanation: breakdown.risk.explanation,
      icon: TrendingUp,
      color: "text-muted-foreground",
    },
  ]

  return (
    <Card className={cn("shadow-card rounded-2xl", className)}>
      <CardHeader>
        <CardTitle>IPI breakdown</CardTitle>
        <CardDescription>
          Narrative {(weightsUsed.narrative * 100).toFixed(0)}% · Credibility{" "}
          {(weightsUsed.credibility * 100).toFixed(0)}% · Risk{" "}
          {(weightsUsed.risk * 100).toFixed(0)}%. Weights are provisional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-muted/30 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", item.color)} />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  Score: {item.score.toFixed(1)} · Contribution: {item.contribution.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.explanation}</p>
            </div>
          )
        })}
        {Array.isArray(explainability) && explainability.length > 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">Explainability</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {explainability.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
