/**
 * NarrativeCard: white card with rounded corners, subtle shadow, primary action (view details).
 * Design: 16–20px radius, hover lift, primary green CTA.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DecayGauge } from "@/components/narrative/DecayGauge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import type { NarrativeWithDecay } from "@/types/narrative"

export interface NarrativeCardProps {
  narrative: NarrativeWithDecay
  onViewDetails: () => void
  className?: string
}

export function NarrativeCard({ narrative, onViewDetails, className }: NarrativeCardProps) {
  const events = narrative.topEvents ?? []
  const eventCount = narrative.event_count ?? events.length

  return (
    <Card
      className={cn(
        "rounded-[1rem] border-l-4 border-l-primary shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      aria-labelledby={`narrative-${narrative.id}-title`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <h3
            id={`narrative-${narrative.id}-title`}
            className="font-display text-lg font-semibold leading-tight"
          >
            {narrative.name ?? "Unnamed narrative"}
          </h3>
          <Button
            variant="default"
            size="sm"
            className="shrink-0 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onViewDetails}
            aria-label={`View details for ${narrative.name ?? "narrative"}`}
          >
            View details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <DecayGauge
          value={narrative.weight}
          max={1}
          label="Decay-weighted score"
          aria-label={`Decay-weighted score ${(Number(narrative.weight) * 100).toFixed(0)}%`}
        />
        <p className="text-xs text-muted-foreground">
          {eventCount} event{eventCount !== 1 ? "s" : ""} · Updated{" "}
          {narrative.lastUpdated
            ? new Date(narrative.lastUpdated).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </p>
      </CardContent>
    </Card>
  )
}
