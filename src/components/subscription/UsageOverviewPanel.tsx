import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Building2, Cpu } from "lucide-react"
import type { UsageMetrics } from "@/types/subscription"
import { safeNumber } from "@/lib/data-guard"

interface UsageOverviewPanelProps {
  usageMetrics?: UsageMetrics | null
  isLoading?: boolean
}

export function UsageOverviewPanel({
  usageMetrics,
  isLoading,
}: UsageOverviewPanelProps) {
  const monitored = safeNumber(usageMetrics?.monitoredCompanies, 0)
  const apiUsed = safeNumber(usageMetrics?.apiCallsUsed, 0)
  const apiQuota = safeNumber(usageMetrics?.apiCallQuota, 1)
  const apiPct = apiQuota > 0 ? Math.min(100, Math.round((apiUsed / apiQuota) * 100)) : 0
  const isNearLimit = apiQuota > 0 && apiPct >= 80

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1rem]">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BarChart3 className="h-5 w-5" />
          Usage overview
        </CardTitle>
        <CardDescription>
          Current usage against your plan limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{monitored}</p>
              <p className="text-sm text-muted-foreground">Companies monitored</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Cpu className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {apiUsed} <span className="text-muted-foreground">/ {apiQuota}</span>
              </p>
              <p className="text-sm text-muted-foreground">API calls</p>
            </div>
          </div>
        </div>
        {apiQuota > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">API usage</span>
              <span className={isNearLimit ? "font-medium text-accent" : ""}>
                {apiPct}%
              </span>
            </div>
            <Progress value={apiPct} className="h-2" />
            {isNearLimit && (
              <p className="text-sm text-accent">
                You are near your API call limit. Consider upgrading for more quota.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
