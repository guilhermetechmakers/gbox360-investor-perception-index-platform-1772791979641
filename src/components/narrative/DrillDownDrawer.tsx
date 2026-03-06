import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileJson } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { NarrativeTopicWithDecay, NarrativeEventDetail } from "@/types/narrative"

interface DrillDownDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  narrative: NarrativeTopicWithDecay | null
  events: NarrativeEventDetail[]
  isLoading: boolean
  companyId?: string
}

export function DrillDownDrawer({
  open,
  onOpenChange,
  narrative,
  events,
  isLoading,
}: DrillDownDrawerProps) {
  const eventList = Array.isArray(events) ? events : []
  const topEvents = narrative?.topEvents ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[18px] shadow-card"
        aria-label="Narrative drill-down"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Why did this move? — {narrative?.name ?? "Narrative"}
          </DialogTitle>
          <DialogDescription>
            Underlying events with classification rationale. View raw payloads for audit.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {narrative && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">Classification rationale</p>
                <p className="mt-1 text-muted-foreground">
                  Rule-based topic: {narrative.name}. Decay weight: {narrative.weight.toFixed(2)}.
                </p>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Events ({eventList.length || topEvents.length})</h4>
              <ul className="space-y-2">
                {(eventList.length > 0 ? eventList : topEvents).map((ev) => {
                  const id = "id" in ev ? String(ev.id) : ""
                  const rawText = "raw_text" in ev ? String(ev.raw_text ?? "") : ""
                  const source = "source" in ev ? String(ev.source ?? "—") : ""
                  const speaker = "speaker_entity" in ev ? String(ev.speaker_entity ?? "—") : ""
                  const createdAt = "created_at" in ev ? String(ev.created_at ?? "") : ""
                  const authority = "authority_weight" in ev ? Number(ev.authority_weight ?? 0) : 0
                  const credibility = "credibility_proxy" in ev ? Number(ev.credibility_proxy ?? 0) : 0

                  return (
                    <li key={id || `ev-${rawText.slice(0, 20)}`}>
                      <Card
                        className={cn(
                          "border border-border transition-shadow hover:shadow-md"
                        )}
                      >
                        <CardContent className="p-4">
                          <p className="line-clamp-2 text-sm text-foreground">{rawText || "—"}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{source}</span>
                            <span>{speaker}</span>
                            <span>{createdAt ? new Date(createdAt).toLocaleDateString() : "—"}</span>
                            <span className="font-medium text-primary">
                              Authority: {(authority * 100).toFixed(0)}%
                            </span>
                            <span className="font-medium text-secondary">
                              Credibility: {(credibility * 100).toFixed(0)}%
                            </span>
                          </div>
                          {id && (
                            <Link
                              to={`/dashboard/payload/${id}`}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <FileJson className="h-3 w-3" />
                              View full payload
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </div>

            {eventList.length === 0 && topEvents.length === 0 && !isLoading && (
              <p className="text-center text-sm text-muted-foreground">
                No events found for this narrative.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
