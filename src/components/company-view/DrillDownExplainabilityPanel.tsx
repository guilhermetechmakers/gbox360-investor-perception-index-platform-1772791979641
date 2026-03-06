/**
 * DrillDownExplainabilityPanel — Compact panel with CTA to full Drill-down page.
 * Shows top narratives summary, authority/credibility hint, and replay/weight-adjustment CTA.
 */

import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Beaker, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DrillDownExplainabilityPanelProps {
  companyId: string
  timeWindow: string
  className?: string
}

export function DrillDownExplainabilityPanel({
  companyId,
  timeWindow,
  className,
}: DrillDownExplainabilityPanelProps) {
  const drilldownHref = `/dashboard/company/${companyId}/drill-down?window=${encodeURIComponent(timeWindow)}`

  return (
    <Card className={cn("rounded-[18px] shadow-card border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" aria-hidden />
          Why did this move?
        </CardTitle>
        <CardDescription>
          Deep-dive into narrative persistence, authority sources, credibility proxy breakdown, and raw payload evidence. Replay events and run weight experiments.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link to={drilldownHref}>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-md"
            aria-label="Open drill-down explainability view"
          >
            Open Drill-down
          </Button>
        </Link>
        <Link to={drilldownHref}>
          <Button
            variant="outline"
            className="gap-2 border-secondary/50 hover:bg-secondary/10"
            aria-label="Run sandbox experiments"
          >
            <Beaker className="h-4 w-4" aria-hidden />
            Sandbox
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
