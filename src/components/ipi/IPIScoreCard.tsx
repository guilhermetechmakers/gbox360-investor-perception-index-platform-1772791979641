/**
 * IPI Score Card: current IPI value, delta, timestamp, and provisional weights badge.
 * Used on global dashboard and company view.
 */

import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IPIBadge } from "./IPIBadge"
import { useIPICurrent } from "@/hooks/useIPI"
import { Beaker, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IPIScoreCardProps {
  companyId: string
  companyName?: string
  companyTicker?: string
  window?: string
  /** Show link to company view and sandbox */
  showActions?: boolean
  className?: string
}

export function IPIScoreCard({
  companyId,
  companyName,
  companyTicker,
  window = "1W",
  showActions = true,
  className,
}: IPIScoreCardProps) {
  const { data: ipi, isLoading } = useIPICurrent(companyId, window)

  if (isLoading) {
    return (
      <Card className={cn("rounded-[1rem] shadow-card", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
            IPI overview
          </CardTitle>
          <CardDescription>Current Investor Perception Index</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  const score = ipi?.score ?? 0
  const delta = ipi?.delta ?? 0
  const computedAt = ipi?.computed_at
    ? new Date(ipi.computed_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border shadow-card transition-shadow duration-200 hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
            IPI overview
          </CardTitle>
          <CardDescription>
            {companyName ?? "Company"} {companyTicker ? `(${companyTicker})` : ""} · Provisional weights: Narrative 40%, Credibility 40%, Risk 20%
          </CardDescription>
        </div>
        <span
          className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          title="Weights are provisional and may be updated"
        >
          Provisional
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <IPIBadge
            score={score}
            delta={delta}
            maxScore={100}
            size="lg"
            showDelta
            showProvisionalBadge={false}
          />
          <p className="text-sm text-muted-foreground">Updated {computedAt}</p>
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/company/${companyId}?window=${window}`}>
              <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                View company
              </Button>
            </Link>
            <Link to={`/dashboard/company/${companyId}/drill-down?window=${window}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Beaker className="h-4 w-4" />
                Why did this move?
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
