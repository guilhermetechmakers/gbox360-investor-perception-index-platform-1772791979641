import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingPromoCardProps {
  backdropColor?: string
  ctaLabel?: string
  onCTAClick?: () => void
  className?: string
}

export function FloatingPromoCard({
  backdropColor,
  ctaLabel = "Learn more",
  onCTAClick,
  className,
}: FloatingPromoCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1rem] border-0 p-6 shadow-lg",
        !backdropColor && "bg-gradient-to-br from-[rgb(59,43,30)] to-[rgb(43,31,21)]",
        className
      )}
      style={
        backdropColor
          ? { backgroundColor: backdropColor }
          : undefined
      }
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <HelpCircle className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Need help getting started?
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Review the onboarding checklist above or explore our documentation
              for detailed guidance.
            </p>
            <Button
              size="sm"
              className="mt-3 gap-2 bg-[rgb(224,122,76)] text-white hover:bg-[rgb(224,122,76)]/90"
              onClick={onCTAClick}
              aria-label="Learn more about getting help"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {ctaLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
