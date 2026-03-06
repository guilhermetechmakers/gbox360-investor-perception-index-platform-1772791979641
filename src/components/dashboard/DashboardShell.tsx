import { useMemo } from "react"
import { WatchlistPanel } from "./WatchlistPanel"
import { IPIChangesPanel } from "./IPIChangesPanel"
import { AlertsPanel } from "./AlertsPanel"
import { TimelinePreview } from "./TimelinePreview"
import { DataVisualizationStub } from "./DataVisualizationStub"
import { DashboardFloatingPromoCard } from "./DashboardFloatingPromoCard"
import { QuickActionsCard } from "./QuickActionsCard"
import { RecommendedCompaniesCard } from "./RecommendedCompaniesCard"
import { IPIScoreCard } from "@/components/ipi"
import { useDashboard } from "@/hooks/useDashboard"
import { AnimatedPage } from "@/components/AnimatedPage"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  className?: string
}

export function DashboardShell({ className }: DashboardShellProps) {
  const { data, isLoading, error } = useDashboard()

  const watched = useMemo(() => {
    const w = data?.watched
    return Array.isArray(w) ? w : []
  }, [data?.watched])

  const ipiChanges = useMemo(() => {
    const c = data?.ipiChanges
    return Array.isArray(c) ? c : []
  }, [data?.ipiChanges])

  const alerts = useMemo(() => {
    const a = data?.alerts
    return Array.isArray(a) ? a : []
  }, [data?.alerts])

  const recommendedCompanies = useMemo(() => {
    const c = data?.companies
    return Array.isArray(c) ? c.slice(0, 6) : []
  }, [data?.companies])

  return (
    <AnimatedPage className={cn("mx-auto max-w-[1000px] space-y-8", className)}>
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your watchlist and recent IPI shifts.
        </p>
      </div>

      {/* Quick actions */}
      <QuickActionsCard watchedCompanies={watched} />

      {/* IPI Score Card: current IPI for first watched company */}
      {watched.length > 0 && (
        <IPIScoreCard
          companyId={watched[0].id}
          companyName={watched[0].name}
          companyTicker={watched[0].ticker}
          window="1W"
          showActions
        />
      )}

      {/* Main grid: Watchlist + IPI Changes + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WatchlistPanel
            watchedCompanies={watched}
            isLoading={isLoading}
          />
        </div>
        <div>
          <AlertsPanel alerts={alerts} isLoading={isLoading} />
        </div>
      </div>

      {/* Recommended company cards */}
      {recommendedCompanies.length > 0 && (
        <RecommendedCompaniesCard companies={recommendedCompanies} />
      )}

      {/* IPI Changes + Timeline + Promo */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <IPIChangesPanel
            recentIpiChanges={ipiChanges}
            isLoading={isLoading}
          />
        </div>
        <div>
          <TimelinePreview changes={ipiChanges} isLoading={isLoading} />
        </div>
        <div className="hidden lg:block">
          <DashboardFloatingPromoCard />
        </div>
      </div>

      {/* Data viz stub */}
      <DataVisualizationStub
        title="IPI overview"
        description="Aggregate IPI trends across your watchlist."
      />

      {error && (
        <p className="text-sm text-destructive">
          Unable to load dashboard data. Showing cached or mock data.
        </p>
      )}
    </AnimatedPage>
  )
}
