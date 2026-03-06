/**
 * AuditBadge — Last ingestion time and raw payload preservation indicator.
 */

import { Clock, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AuditBadgeProps {
  lastIngestionTime?: string | null
  hasRawPayload?: boolean
  className?: string
}

function formatTime(ts: string | undefined | null): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

export function AuditBadge({
  lastIngestionTime,
  hasRawPayload = true,
  className,
}: AuditBadgeProps) {
  const label = formatTime(lastIngestionTime ?? undefined)

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
        className
      )}
      role="status"
      aria-label={`Last ingestion: ${label}. Raw payload ${hasRawPayload ? "preserved" : "not preserved"}.`}
    >
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Last ingest: {label}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FileCheck
          className={cn("h-3.5 w-3.5", hasRawPayload ? "text-primary" : "text-muted-foreground/60")}
          aria-hidden
        />
        {hasRawPayload ? "Payload preserved" : "No payload"}
      </span>
    </div>
  )
}
