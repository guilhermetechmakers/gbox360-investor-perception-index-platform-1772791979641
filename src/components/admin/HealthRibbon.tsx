import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkerStatus } from "@/types/admin"

interface HealthRibbonProps {
  status?: WorkerStatus
  queueLength?: number
  lastJobAt?: string | null
  className?: string
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  HEALTHY: { icon: CheckCircle2, color: "text-green-600", label: "Healthy" },
  DEGRADED: { icon: AlertTriangle, color: "text-amber-600", label: "Degraded" },
  DOWN: { icon: XCircle, color: "text-red-600", label: "Down" },
}

export function HealthRibbon({ status = "HEALTHY", queueLength = 0, lastJobAt, className }: HealthRibbonProps) {
  const cfg = statusConfig[status] ?? statusConfig.HEALTHY
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm",
        className
      )}
      role="status"
      aria-label={`Ingestion health: ${cfg.label}`}
    >
      <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
      <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">
        Queue: {queueLength}
        {lastJobAt && ` · Last job: ${new Date(lastJobAt).toLocaleDateString()}`}
      </span>
    </div>
  )
}
