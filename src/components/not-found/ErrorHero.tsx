/**
 * ErrorHero — Large serif display heading and subheading for 404 page.
 * Aligns with Gbox360 fintech aesthetic: premium, calm, editorial feel.
 */
import { cn } from "@/lib/utils"

interface ErrorHeroProps {
  headline?: string
  subheading?: string
  className?: string
}

export function ErrorHero({
  headline = "We can't find that page",
  subheading = "The page you're looking for isn't available. Use the options below to navigate back or search for a company to continue exploring.",
  className,
}: ErrorHeroProps) {
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
