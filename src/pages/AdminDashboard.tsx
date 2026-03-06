import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  Activity,
  Building2,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useAdminDashboardHealth } from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"
import { formatDistanceToNow } from "date-fns"

const workerStatusConfig = {
  HEALTHY: { icon: CheckCircle2, color: "text-green-600", label: "Healthy" },
  DEGRADED: { icon: AlertTriangle, color: "text-amber-600", label: "Degraded" },
  DOWN: { icon: XCircle, color: "text-red-600", label: "Down" },
} as const

const billingBadge = {
  PAID: "bg-green-100 text-green-800",
  DUE: "bg-amber-100 text-amber-800",
  OVERDUE: "bg-red-100 text-red-800",
} as const

const alertSeverityConfig = {
  INFO: { icon: Activity, color: "text-primary" },
  WARNING: { icon: AlertTriangle, color: "text-amber-600" },
  ERROR: { icon: XCircle, color: "text-red-600" },
  CRITICAL: { icon: XCircle, color: "text-red-700" },
} as const

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboardHealth()
  const health = data?.health
  const tenants = safeArray(data?.tenants)
  const alerts = safeArray(data?.alerts)

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System health, tenant overview, and operational alerts.
          </p>
        </div>

        {/* System health panel */}
        <Card className="rounded-[1.25rem] shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Health
            </CardTitle>
            <CardDescription>
              Ingestion queue, worker status, and last successful job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
            ) : health ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Queue length</p>
                  <p className="font-display text-2xl font-semibold">
                    {health.ingestionQueueLength}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Worker status</p>
                  {(() => {
                    const status = String(health.workerStatus).toUpperCase() as keyof typeof workerStatusConfig
                    const cfg = workerStatusConfig[status] ?? workerStatusConfig.HEALTHY
                    const Icon = cfg.icon
                    return (
                      <p className={`flex items-center gap-2 font-semibold ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                        {cfg.label}
                      </p>
                    )
                  })()}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Last successful job</p>
                  <p className="font-medium">
                    {health.lastSuccessfulJobAt
                      ? formatDistanceToNow(new Date(health.lastSuccessfulJobAt), {
                          addSuffix: true,
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No health data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick navigation */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/audit-logs">
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Audit Logs</p>
                  <p className="text-sm text-muted-foreground">
                    Immutable audit trail with payload drill-down
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/user-management">
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-sm text-muted-foreground">
                    Invite users, assign roles, deactivate
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tenant summary */}
        <Card className="rounded-[1.25rem] shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Tenant Summary
            </CardTitle>
            <CardDescription>
              Usage metrics and billing status per tenant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : tenants.length > 0 ? (
              <div className="space-y-3">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.usage?.transactions ?? 0} transactions ·{" "}
                        {t.usage?.storageGB ?? 0} GB storage
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          billingBadge[t.billingStatus] ?? billingBadge.PAID
                        }`}
                      >
                        {t.billingStatus}
                      </span>
                      <span className="text-sm text-muted-foreground">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                No tenants found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts / incident feed */}
        <Card className="rounded-[1.25rem] shadow-card">
          <CardHeader>
            <CardTitle>Alerts & Incidents</CardTitle>
            <CardDescription>
              Operational awareness and escalation hints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((a) => {
                  const severity = String(a.severity).toUpperCase() as keyof typeof alertSeverityConfig
                  const cfg = alertSeverityConfig[severity] ?? alertSeverityConfig.INFO
                  const Icon = cfg.icon
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                          {a.source && ` · ${a.source}`}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                No active alerts.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
