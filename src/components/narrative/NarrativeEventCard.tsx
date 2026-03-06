/**
 * NarrativeEventCard: compact rendering of event with source, speaker, timestamp, and excerpt.
 * Design: 16–20px corners, hover lift, provenance link to raw payload.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { FileJson, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NarrativeEvent, NarrativeEventSummary, NarrativeEventSpec } from "@/types/narrative"

const EXCERPT_LENGTH = 120

export interface NarrativeEventCardProps {
  event: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec
  eventId?: string
  hasPayload?: boolean
  isImmutable?: boolean
  className?: string
}

function getEventId(ev: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec): string {
  return (ev as NarrativeEvent).event_id ?? (ev as NarrativeEventSpec).event_id ?? (ev as NarrativeEventSummary).id ?? ""
}

function getExcerpt(text: string | null | undefined): string {
  const t = String(text ?? "").trim()
  if (!t) return "—"
  if (t.length <= EXCERPT_LENGTH) return t
  return `${t.slice(0, EXCERPT_LENGTH)}…`
}

function getSource(ev: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec): string {
  const spec = ev as NarrativeEventSpec
  if (spec.source_id) return spec.source_id
  return (ev as NarrativeEvent).source ?? (ev as NarrativeEventSummary).source ?? "—"
}

function getPlatform(ev: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec): string | undefined {
  return (ev as NarrativeEvent).platform ?? (ev as NarrativeEventSummary).platform ?? (ev as NarrativeEventSpec).platform
}

function getSpeaker(ev: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec): string {
  const spec = ev as NarrativeEventSpec
  if (spec.speaker_entity) return spec.speaker_entity
  const n = ev as NarrativeEvent
  if (n.speaker?.entity) return n.speaker.entity
  return (ev as NarrativeEventSummary).speaker_entity ?? "—"
}

function getTimestamp(ev: NarrativeEvent | NarrativeEventSummary | NarrativeEventSpec): string {
  const n = ev as NarrativeEvent
  const spec = ev as NarrativeEventSpec
  const ts = n.published_at ?? n.ingested_at ?? n.created_at ?? spec.published_at ?? spec.ingested_at ?? spec.created_at
  const s = (ev as NarrativeEventSummary).created_at ?? ts ?? ""
  if (!s) return "—"
  return new Date(s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function NarrativeEventCard({
  event,
  eventId: propEventId,
  hasPayload = true,
  isImmutable = true,
  className,
}: NarrativeEventCardProps) {
  const id = propEventId ?? getEventId(event)
  const source = getSource(event)
  const platform = getPlatform(event)
  const speaker = getSpeaker(event)
  const timestamp = getTimestamp(event)
  const excerpt = getExcerpt(
    (event as NarrativeEvent).raw_text ??
    (event as NarrativeEventSpec).raw_text ??
    (event as NarrativeEventSummary).raw_text
  )
  const authorityWeight =
    (event as NarrativeEventSummary).authority_weight ??
    (event as NarrativeEvent).authority_score ??
    (event as NarrativeEventSpec).authority_score ??
    0
  const credibilityProxy =
    (event as NarrativeEventSummary).credibility_proxy ??
    (event as NarrativeEvent).credibility_proxy ??
    0

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      aria-labelledby={id ? `event-${id}-excerpt` : undefined}
    >
      <CardContent className="p-4">
        <p
          id={id ? `event-${id}-excerpt` : undefined}
          className="line-clamp-3 text-sm text-foreground"
        >
          {excerpt}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{source}</span>
          {platform && <span>{platform}</span>}
          <span>{speaker}</span>
          <span>{timestamp}</span>
          {(authorityWeight > 0 || credibilityProxy > 0) && (
            <span className="font-medium text-primary">
              Authority: {(authorityWeight * 100).toFixed(0)}% · Credibility:{" "}
              {(credibilityProxy * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {isImmutable && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              title="Append-only, immutable"
              aria-label="Immutable event"
            >
              <Lock className="h-3 w-3" />
              Immutable
            </span>
          )}
          {id && (
            <Link to={`/dashboard/payload/${id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-primary hover:bg-primary/10"
                aria-label={`View raw payload for event ${id}`}
              >
                <FileJson className="h-4 w-4" />
                {hasPayload ? "View payload" : "Payload"}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
