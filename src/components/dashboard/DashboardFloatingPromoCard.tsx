import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardFloatingPromoCardProps {
  className?: string
}

export function DashboardFloatingPromoCard({ className }: DashboardFloatingPromoCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1rem] border-0 bg-gradient-to-br from-[rgb(59,43,30)] to-[rgb(43,31,21)] p-6 shadow-lg",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <HelpCircle className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Understand IPI drivers
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Use the drill-down view to see narrative decomposition, authority scores, and raw payload provenance.
            </p>
            <Link to="/dashboard/companies" className="mt-3 inline-block">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-[rgb(224,122,76)] text-white hover:bg-[rgb(224,122,76)]/90"
                aria-label="Learn more about IPI"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
