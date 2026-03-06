/**
 * StatusBadge — Optional status indicator when /api/status is available.
 * Gracefully hidden when status API is unreachable.
 */

import { cn } from "@/lib/utils"

export type StatusValue = "ok" | "degraded" | "down"

interface StatusBadgeProps {
  status?: StatusValue | null
  lastUpdated?: string | null
  className?: string
}

const STATUS_LABELS: Record<StatusValue, string> = {
  ok: "All systems operational",
  degraded: "Degraded performance",
  down: "Service disruption",
}

const STATUS_STYLES: Record<StatusValue, string> = {
  ok: "bg-primary/10 text-primary border-primary/30",
  degraded: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
  down: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400",
}

export function StatusBadge({
  status,
  lastUpdated,
  className,
}: StatusBadgeProps) {
  if (!status || !["ok", "degraded", "down"].includes(status)) {
    return null
  }

  const label = STATUS_LABELS[status] ?? status
  const styleClass = STATUS_STYLES[status] ?? STATUS_STYLES.ok

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm",
        styleClass,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="font-medium">{label}</span>
      {lastUpdated && (
        <span className="text-xs opacity-80">
          Updated: {lastUpdated}
        </span>
      )}
    </div>
  )
}
