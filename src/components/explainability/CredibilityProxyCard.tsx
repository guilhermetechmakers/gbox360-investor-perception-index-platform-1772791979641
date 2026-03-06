/**
 * Credibility proxy breakdown: qualitative/quantitative indicators.
 * Cards with 16–20px radius, soft shadows; neutral palette.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { BarChart2 } from "lucide-react"
import type { CredibilityProxy } from "@/types/explainability"

export interface CredibilityProxyCardProps {
  proxies: CredibilityProxy[]
  isLoading?: boolean
  className?: string
}

export function CredibilityProxyCard({
  proxies,
  isLoading = false,
  className,
}: CredibilityProxyCardProps) {
  const items = Array.isArray(proxies) ? proxies : []

  return (
    <Card className={className ?? "rounded-[1.25rem] shadow-card"} aria-labelledby="credibility-proxy-title">
      <CardHeader>
        <CardTitle id="credibility-proxy-title" className="flex items-center gap-2 font-display text-lg">
          <BarChart2 className="h-5 w-5 text-secondary" aria-hidden />
          Credibility proxy breakdown
        </CardTitle>
        <CardDescription>
          Qualitative and quantitative indicators used in IPI credibility scoring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" aria-busy="true" />
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No credibility proxy data for this window.
          </p>
        ) : (
          <ul className="space-y-4" role="list">
            {items.map((p) => {
              const value = typeof p?.value === "number" ? Math.min(100, Math.max(0, p.value)) : 0
              const name = p?.name ?? "—"
              return (
                <li key={p?.id ?? name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{name}</span>
                    <span className="text-muted-foreground">{value.toFixed(1)}</span>
                  </div>
                  <Progress value={value} className="h-2" aria-label={`${name}: ${value}%`} />
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
