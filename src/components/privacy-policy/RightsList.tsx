import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DataRight } from "@/content/privacy-policy"

interface RightsListProps {
  title?: string
  rights?: DataRight[]
  className?: string
}

export function RightsList({
  title = "Your Data Rights",
  rights = [],
  className,
}: RightsListProps) {
  const items = Array.isArray(rights) ? rights : []

  return (
    <section className={cn(className)} aria-labelledby="rights-heading">
      <h2
        id="rights-heading"
        className="mb-6 font-display text-2xl font-semibold text-foreground"
      >
        {title}
      </h2>
      <ul className="space-y-6" role="list">
        {items.map((right, index) => (
          <li key={right.id ?? right.title ?? index}>
            <Card className="rounded-[18px] border-border shadow-card transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {right.title ?? ""}
                </h3>
                <p className="mt-2 text-muted-foreground">{right.description ?? ""}</p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  How to exercise: {right.actionInstructions ?? ""}
                </p>
                {right.timeline && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Expected timeline: {right.timeline}
                  </p>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
