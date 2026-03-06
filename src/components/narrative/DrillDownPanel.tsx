/**
 * DrillDownPanel: drawer/modal showing events, raw payloads, and classification rationale.
 * Uses Dialog for accessibility; scrollable event list.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNarrativeEvents } from "@/hooks/useNarratives"
import { FileJson } from "lucide-react"
import { Link } from "react-router-dom"
import type { NarrativeWithDecay, NarrativeEventSummary, ClassificationRationale } from "@/types/narrative"
import { cn } from "@/lib/utils"

export interface DrillDownPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  narrative: NarrativeWithDecay | null
  companyId: string
  start?: string
  end?: string
}

function RationaleBlock({ rationale }: { rationale: ClassificationRationale | null | undefined }) {
  if (!rationale) return null
  const rule = rationale.rule_based
  const embed = rationale.embedding_proximity
  return (
    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
      {rule && (
        <p>
          <span className="font-medium text-foreground">Rules:</span>{" "}
          {rule.topic_name} ({(rule.confidence * 100).toFixed(0)}% confidence)
          {Array.isArray(rule.matched_keywords) && rule.matched_keywords.length > 0 && (
            <> · Matched: {rule.matched_keywords.join(", ")}</>
          )}
        </p>
      )}
      {embed && (
        <p>
          <span className="font-medium text-foreground">Embedding:</span> similarity{" "}
          {(embed.similarity * 100).toFixed(0)}%
        </p>
      )}
    </div>
  )
}

export function DrillDownPanel({
  open,
  onOpenChange,
  narrative,
  companyId: _companyId,
  start,
  end,
}: DrillDownPanelProps) {
  const narrativeId = narrative?.id ?? null
  const { data: eventsRaw, isLoading } = useNarrativeEvents(narrativeId, start, end, open && !!narrativeId)
  const events: NarrativeEventSummary[] = Array.isArray(eventsRaw) ? eventsRaw : (narrative?.topEvents ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] max-w-[900px] gap-4 sm:rounded-xl"
        aria-describedby="drill-down-description"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {narrative?.name ?? "Narrative"} — Why did this move?
          </DialogTitle>
          <DialogDescription id="drill-down-description">
            Underlying events, sources, and classification rationale for this narrative.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            No events in this window. Try a wider time range or check back after more data is ingested.
          </p>
        ) : (
          <ScrollArea className="h-[50vh] pr-4">
            <ul className="space-y-3" role="list">
              {(events ?? []).map((ev) => (
                <li key={ev.id}>
                  <Card className="border border-border transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <p className="line-clamp-3 text-sm text-foreground">
                        {ev.raw_text ?? "—"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{ev.source ?? ev.platform ?? "—"}</span>
                        <span>{ev.speaker_entity ?? "—"}</span>
                        <span>
                          {ev.created_at
                            ? new Date(ev.created_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                        {(ev.authority_weight != null || ev.credibility_proxy != null) && (
                          <span className={cn("font-medium text-primary")}>
                            Authority: {((ev.authority_weight ?? 0) * 100).toFixed(0)}% · Credibility:{" "}
                            {((ev.credibility_proxy ?? 0) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <RationaleBlock rationale={ev.classification_rationale} />
                      <Link
                        to={`/dashboard/payload/${ev.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <FileJson className="h-3 w-3" />
                        View raw payload
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
