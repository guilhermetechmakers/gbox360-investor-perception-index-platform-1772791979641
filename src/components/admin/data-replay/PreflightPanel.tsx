import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { ReplayHealth, PreflightResult, DryRunResult } from "@/types/admin"
import { cn } from "@/lib/utils"

interface PreflightPanelProps {
  health: ReplayHealth | null | undefined
  preflight: PreflightResult | DryRunResult | null | undefined
  isLoading?: boolean
  tenantId: string | null
}

const statusConfig = {
  healthy: { icon: CheckCircle2, color: "text-green-600", label: "Healthy" },
  degraded: { icon: AlertTriangle, color: "text-amber-600", label: "Degraded" },
  down: { icon: XCircle, color: "text-red-600", label: "Down" },
} as const

export function PreflightPanel({
  health,
  preflight,
  isLoading = false,
  tenantId,
}: PreflightPanelProps) {
  if (!tenantId) {
    return (
      <Card className="rounded-[1rem] border border-border bg-card shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Preflight checks</CardTitle>
          <CardDescription>
            Select a tenant and time window to run preflight checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            No tenant selected
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="rounded-[1rem] border border-border bg-card shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Preflight checks</CardTitle>
          <CardDescription>Data quality, idempotency, retry policy, backlog health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = (health?.status ?? "healthy") as keyof typeof statusConfig
  const cfg = statusConfig[status] ?? statusConfig.healthy
  const Icon = cfg.icon

  return (
    <Card className="rounded-[1rem] border border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg">Preflight checks</CardTitle>
        <CardDescription>
          Data quality, idempotency status, retry policy, and backlog health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Ingestion health</p>
            <p className={cn("flex items-center gap-2 font-semibold", cfg.color)}>
              <Icon className="h-5 w-5" aria-hidden />
              {cfg.label}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Backlog size</p>
            <p className="font-semibold">{health?.backlogSize ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Idempotency</p>
            <p className="font-semibold">
              {health?.idempotencyEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Retry policy</p>
            <p className="font-semibold">{health?.retryPolicy ?? "—"}</p>
          </div>
        </div>
        {preflight && (
          <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Estimated events</p>
            <p className="font-semibold">{preflight.estimatedEventCount ?? 0}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
