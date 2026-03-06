import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { CompanyViewLink } from "./CompanyViewLink"
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react"
import type { IPIChange } from "@/types/dashboard"

interface IPIChangesPanelProps {
  recentIpiChanges: IPIChange[]
  isLoading?: boolean
}

export function IPIChangesPanel({
  recentIpiChanges,
  isLoading = false,
}: IPIChangesPanelProps) {
  const items = Array.isArray(recentIpiChanges) ? recentIpiChanges : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent IPI changes
        </CardTitle>
        <CardDescription>
          Significant IPI movements with directional indicators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-2">
            {items.map((change) => {
              const isUp = change.ipiDelta >= 0
              const Icon = isUp ? ArrowUpRight : ArrowDownRight
              const colorClass = isUp ? "text-green-600" : "text-red-600"

              return (
                <div
                  key={change.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {change.companyName ?? "Company"} ({change.companyTicker ?? "—"})
                    </p>
                    {change.narrativeSummary && (
                      <p className="truncate text-sm text-muted-foreground">
                        {change.narrativeSummary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 font-medium", colorClass)}>
                      <Icon className="h-4 w-4" aria-hidden />
                      {change.ipiDelta >= 0 ? "+" : ""}
                      {change.ipiDelta}
                    </span>
                    <CompanyViewLink
                      companyId={change.companyId}
                      variant="ghost"
                      size="sm"
                    >
                      View
                    </CompanyViewLink>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            No recent IPI changes. Alerts will appear when IPI moves beyond thresholds.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
