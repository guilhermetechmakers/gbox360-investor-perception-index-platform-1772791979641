/**
 * ReplayPanel: trigger replay for a selected payload or time window.
 * Links to Admin Data Replay for full controls.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { RotateCcw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ReplayPanelProps {
  companyId?: string
  payloadId?: string
  windowStart?: string
  windowEnd?: string
  eventCount?: number
  onTriggerReplay?: () => void
  isReplayPending?: boolean
  className?: string
}

export function ReplayPanel({
  companyId,
  payloadId,
  windowStart,
  windowEnd,
  eventCount = 0,
  onTriggerReplay,
  isReplayPending = false,
  className,
}: ReplayPanelProps) {
  const hasScope = (companyId && windowStart && windowEnd) || payloadId
  const params = new URLSearchParams()
  if (companyId) params.set("tenantId", companyId)
  if (windowStart) params.set("windowStart", windowStart)
  if (windowEnd) params.set("windowEnd", windowEnd)
  if (payloadId) params.set("payloadId", payloadId)
  const adminReplayUrl = `/admin/data-replay${params.toString() ? `?${params.toString()}` : ""}`

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border shadow-card transition-shadow hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <RotateCcw className="h-5 w-5 text-primary" aria-hidden />
          Replay controls
        </CardTitle>
        <CardDescription>
          Re-run ingestion pipelines for a time window or payload. Idempotent; no duplicates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {eventCount} event{eventCount !== 1 ? "s" : ""} in window.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Link to={adminReplayUrl}>
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Open Admin Data Replay"
            >
              <ExternalLink className="h-4 w-4" />
              Open Admin Replay
            </Button>
          </Link>
          {onTriggerReplay && hasScope && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onTriggerReplay}
              disabled={isReplayPending}
              aria-label={isReplayPending ? "Replay in progress" : "Trigger replay"}
            >
              <RotateCcw className="h-4 w-4" />
              {isReplayPending ? "Replaying…" : "Trigger replay"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Dry-run and execute from Admin → Data Replay. Replay is idempotent; duplicate payloads are
          skipped.
        </p>
      </CardContent>
    </Card>
  )
}
