import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CompanyViewLink } from "./CompanyViewLink"
import { TrendingUp, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IPIChange } from "@/types/dashboard"

interface TimelinePreviewProps {
  changes: IPIChange[]
  companyId?: string
  window?: string
  isLoading?: boolean
  maxItems?: number
}

export function TimelinePreview({
  changes,
  companyId,
  window = "1W",
  isLoading = false,
  maxItems = 5,
}: TimelinePreviewProps) {
  const items = Array.isArray(changes) ? changes.slice(0, maxItems) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          IPI timeline
        </CardTitle>
        <CardDescription>
          Recent IPI movements. Click to drill down.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-2">
            {items.map((change) => {
              const isUp = change.ipiDelta >= 0
              const colorClass = isUp ? "text-green-600" : "text-red-600"
              const cid = companyId ?? change.companyId

              return (
                <div
                  key={change.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">
                      {change.companyName ?? "Company"} ({change.companyTicker ?? "—"})
                    </p>
                    {change.narrativeSummary && (
                      <p className="truncate text-xs text-muted-foreground">
                        {change.narrativeSummary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", colorClass)}>
                      {change.ipiDelta >= 0 ? "+" : ""}
                      {change.ipiDelta}
                    </span>
                    <CompanyViewLink companyId={cid} window={window} variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4" aria-label="Why did this move?" />
                    </CompanyViewLink>
                  </div>
                </div>
              )
            })}
            {companyId && (
              <Link to={`/dashboard/company/${companyId}/drill-down`} className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Why did this move?
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No timeline data. Select a company to view IPI history.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
