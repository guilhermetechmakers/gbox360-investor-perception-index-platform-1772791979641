import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProductOverviewCardProps {
  overviewText: string
  architectureSummary?: string
  className?: string
}

export function ProductOverviewCard({
  overviewText,
  architectureSummary,
  className,
}: ProductOverviewCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold text-foreground">
          Product Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
          {overviewText}
        </p>
        {architectureSummary && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 font-medium text-foreground">
              How it integrates
            </h4>
            <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
              {architectureSummary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
