import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingPromoCardProps {
  className?: string
}

export function FloatingPromoCard({ className }: FloatingPromoCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1rem] border-0 bg-gradient-to-br from-[#3b2b1e] to-[#2b1f15] p-6 shadow-lg",
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
              Need help with replays?
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Dry-run simulates a replay without mutating data. Execute runs the actual replay
              pipeline. All actions are logged in the audit trail.
            </p>
            <Link to="/admin/audit-logs" className="mt-3 inline-block">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-[#e07a4c] text-white hover:bg-[#e07a4c]/90"
                aria-label="Learn more about audit logs"
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
