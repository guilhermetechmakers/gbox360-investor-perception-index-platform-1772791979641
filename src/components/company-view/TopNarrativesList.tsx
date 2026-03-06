/**
 * TopNarrativesList — Top 3 narratives with title, summary, authority and credibility badges.
 * Safety: ensure narratives is an array; guard mapping.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NarrativeSummaryView } from "@/types/company-view"

export interface TopNarrativesListProps {
  narratives: NarrativeSummaryView[]
  className?: string
}

const safeList = (n: unknown): NarrativeSummaryView[] =>
  Array.isArray(n) ? (n as NarrativeSummaryView[]) : []

export function TopNarrativesList({
  narratives,
  className,
}: TopNarrativesListProps) {
  const list = safeList(narratives).slice(0, 3)

  if (list.length === 0) {
    return (
      <p className={cn("text-muted-foreground text-sm", className)}>
        No narratives for this window.
      </p>
    )
  }

  return (
    <ul className={cn("space-y-4", className)} role="list">
      {list.map((n) => (
        <li key={n.id}>
          <Card className="border-l-4 border-l-primary rounded-[1rem] shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="py-4">
              <p className="font-display font-semibold text-foreground">
                {n.title ?? "Untitled narrative"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {n.summary ?? ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {typeof n.authorityScore === "number" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-primary/10 text-primary border-primary/20"
                    aria-label={`Authority score ${(n.authorityScore * 100).toFixed(0)}%`}
                  >
                    <Award className="h-3 w-3" aria-hidden />
                    Authority {(n.authorityScore * 100).toFixed(0)}%
                  </Badge>
                )}
                {typeof n.credibilityProxy === "number" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-secondary/10 text-secondary-foreground border-secondary/20"
                    aria-label={`Credibility proxy ${(n.credibilityProxy * 100).toFixed(0)}%`}
                  >
                    <Shield className="h-3 w-3" aria-hidden />
                    Credibility {(n.credibilityProxy * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
