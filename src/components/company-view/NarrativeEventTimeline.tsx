/**
 * NarrativeEventTimeline — Scrollable feed of NarrativeEvent cards with View Raw Payload and Why Included.
 * Safety: (events ?? []).map(...) and Array.isArray checks.
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { NarrativeEventCardView } from "./NarrativeEventCardView"
import { cn } from "@/lib/utils"
import type { NarrativeEventView } from "@/types/company-view"

export interface NarrativeEventTimelineProps {
  events: NarrativeEventView[] | null | undefined
  isLoading?: boolean
  companyId?: string
  className?: string
}

const safeEvents = (e: NarrativeEventView[] | null | undefined): NarrativeEventView[] =>
  Array.isArray(e) ? e : []

export function NarrativeEventTimeline({
  events,
  isLoading = false,
  companyId,
  className,
}: NarrativeEventTimelineProps) {
  const list = useMemo(() => safeEvents(events), [events])

  return (
    <Card className={cn("rounded-[18px] shadow-card", className)}>
      <CardHeader>
        <CardTitle>Event timeline</CardTitle>
        <CardDescription>
          NarrativeEvents with provenance. View raw payload for audit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No events in this window.
          </p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {list.map((event) => (
              <NarrativeEventCardView
                key={event.id}
                event={event}
                companyId={companyId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
