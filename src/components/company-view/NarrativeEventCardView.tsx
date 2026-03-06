/**
 * NarrativeEventCardView — Event card with View Raw Payload button and Why Included section.
 * Spec-aligned NarrativeEventView; guards optional fields.
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link } from "react-router-dom"
import { FileJson, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NarrativeEventView, SpeakerView } from "@/types/company-view"

export interface NarrativeEventCardViewProps {
  event: NarrativeEventView
  companyId?: string
  className?: string
}

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

function speakerLabel(speaker: SpeakerView): string {
  if (typeof speaker === "string") return speaker
  const name = speaker?.name ?? ""
  const role = speaker?.role ?? ""
  if (name && role) return `${name} (${role})`
  return name || role || "—"
}

const EXCERPT_LEN = 120
function excerpt(text: string | undefined): string {
  const t = String(text ?? "").trim()
  if (!t) return "—"
  if (t.length <= EXCERPT_LEN) return t
  return `${t.slice(0, EXCERPT_LEN)}…`
}

export function NarrativeEventCardView({
  event,
  className,
}: NarrativeEventCardViewProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const id = event?.id ?? ""
  const source = event?.source ?? "—"
  const platform = event?.platform
  const speaker = speakerLabel(event?.speaker ?? "—")
  const timestamp = formatTimestamp(event?.timestamp)
  const text = excerpt(event?.text)
  const amplitude = event?.amplitude
  const whyIncluded = event?.whyIncluded ?? "This event was included based on narrative relevance and authority/credibility weighting."
  const payloadHref = id ? `/dashboard/payload/${id}` : "#"

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      aria-labelledby={id ? `event-${id}-excerpt` : undefined}
    >
      <CardContent className="p-4">
        <p
          id={id ? `event-${id}-excerpt` : undefined}
          className="line-clamp-3 text-sm text-foreground"
        >
          {text}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{source}</span>
          {platform && <span>{platform}</span>}
          <span>{speaker}</span>
          <span>{timestamp}</span>
          {typeof amplitude === "number" && (
            <span className="font-medium text-primary">
              Amplitude: {amplitude.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {id && (
            <Link to={payloadHref}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-primary hover:bg-primary/10 transition-transform hover:scale-[1.02]"
                aria-label={`View raw payload for event ${id}`}
              >
                <FileJson className="h-4 w-4" aria-hidden />
                View raw payload
              </Button>
            </Link>
          )}
          <Dialog open={whyOpen} onOpenChange={setWhyOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-secondary hover:bg-secondary/10"
                aria-label="Why was this event included?"
              >
                <HelpCircle className="h-4 w-4" aria-hidden />
                Why included
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[18px] shadow-card">
              <DialogHeader>
                <DialogTitle>Why included</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {whyIncluded}
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
