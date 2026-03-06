/**
 * Decay Gauge: simple visualization of current decay-weighted narrative score.
 * Uses flat bar with teal/green accent; 0–100 scale.
 */

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export interface DecayGaugeProps {
  /** Current weight (0–1 or 0–100; will normalize to 0–100 for display) */
  value: number
  /** Optional label (e.g. "Narrative weight") */
  label?: string
  /** Optional max for normalization (default 1) */
  max?: number
  className?: string
  /** Accessible label */
  "aria-label"?: string
}

export function DecayGauge({
  value,
  label,
  max = 1,
  className,
  "aria-label": ariaLabel,
}: DecayGaugeProps) {
  const normalized = max > 1 ? Math.min(100, Math.max(0, value)) : Math.min(100, Math.max(0, value * 100))
  return (
    <div className={cn("space-y-2", className)} role="img" aria-label={ariaLabel ?? label ?? "Decay-weighted score"}>
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <Progress value={normalized} className="h-2" />
      <span className="sr-only">
        {normalized.toFixed(0)}% decay-weighted score
      </span>
    </div>
  )
}
