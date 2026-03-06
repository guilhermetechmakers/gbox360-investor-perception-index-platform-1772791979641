/**
 * Data refresh & last sync status — compact card for User Profile page.
 * Links to Settings for full data refresh preferences.
 */

import { Link } from "react-router-dom"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Settings } from "lucide-react"
import { useSettings } from "@/hooks/useSettings"

export function DataRefreshStatusCard() {
  const { data, isLoading } = useSettings()
  const dataRefresh = data?.dataRefresh ?? null
  const lastRefresh = dataRefresh?.lastRefresh
  const cadenceMs = dataRefresh?.cadenceMs ?? 300000

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    )
  }

  const cadenceLabel =
    cadenceMs < 60_000
      ? "Every minute"
      : cadenceMs < 3600_000
        ? `Every ${Math.round(cadenceMs / 60_000)} min`
        : `Every ${Math.round(cadenceMs / 3600_000)} h`

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <RefreshCw className="h-5 w-5 text-primary" aria-hidden />
            Data refresh
          </CardTitle>
          <CardDescription>
            Auto-refresh: {cadenceLabel}. Last sync:{" "}
            {lastRefresh ? format(new Date(lastRefresh), "PPp") : "—"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-2 shrink-0">
          <Link to="/dashboard/settings?tab=data-refresh" aria-label="Open data refresh settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          Configure polling cadence and batch processing in Settings & Preferences.
        </p>
      </CardContent>
    </Card>
  )
}
