/**
 * IPIBadge: shows IPI score with directional arrow.
 * Design: gradient accent, scale on hover, clear delta indicator.
 */

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IPIBadgeProps {
  score: number
  delta?: number
  maxScore?: number
  size?: "sm" | "md" | "lg"
  showDelta?: boolean
  className?: string
}

export function IPIBadge({
  score,
  delta = 0,
  maxScore = 100,
  size = "md",
  showDelta = true,
  className,
}: IPIBadgeProps) {
  const normalizedScore = Math.min(maxScore, Math.max(0, Number(score)))
  const deltaNum = Number(delta) ?? 0
  const isUp = deltaNum > 0
  const isDown = deltaNum < 0

  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  }

  const DeltaIcon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus
  const deltaColorClass = isUp
    ? "text-green-600"
    : isDown
      ? "text-red-600"
      : "text-muted-foreground"

  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-card transition-transform duration-200 hover:scale-[1.02]",
        className
      )}
      role="img"
      aria-label={`IPI score ${normalizedScore.toFixed(1)} out of ${maxScore}${showDelta ? `, ${isUp ? "up" : isDown ? "down" : "unchanged"} ${Math.abs(deltaNum).toFixed(1)}` : ""}`}
    >
      <span
        className={cn(
          "font-display font-bold text-foreground",
          sizeClasses[size]
        )}
      >
        {normalizedScore.toFixed(1)}
      </span>
      <span className="text-muted-foreground">/ {maxScore}</span>
      {showDelta && (
        <span className={cn("flex items-center gap-0.5 text-lg", deltaColorClass)}>
          <DeltaIcon className="h-5 w-5" aria-hidden />
          <span className="font-medium">
            {isUp ? "+" : ""}
            {deltaNum.toFixed(1)}
          </span>
        </span>
      )}
    </div>
  )
}
