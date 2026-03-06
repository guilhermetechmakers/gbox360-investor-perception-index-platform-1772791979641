/**
 * ErrorHero500 — Serif heading and subheading for 500 Server Error page.
 * Calm, professional apology with actionable guidance.
 */

import { cn } from "@/lib/utils"

interface ErrorHero500Props {
  headline?: string
  subheading?: string
  className?: string
}

export function ErrorHero500({
  headline = "Something went wrong",
  subheading = "We're sorry — an internal error occurred. Please try again, or contact support if the issue persists. Our team has been notified.",
  className,
}: ErrorHero500Props) {
  return (
    <div className={cn("text-center", className)}>
      <h1
        className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
        aria-live="polite"
      >
        {headline}
      </h1>
      <p className="mx-auto mt-6 max-w-[600px] text-lg text-muted-foreground leading-relaxed">
        {subheading}
      </p>
    </div>
  )
}
