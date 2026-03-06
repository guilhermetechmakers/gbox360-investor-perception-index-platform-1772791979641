import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"
import { RotateCcw } from "lucide-react"

export default function AdminDataReplay() {
  return (
    <AnimatedPage>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Data Replay
          </h1>
          <p className="text-muted-foreground">
            Reprocess NarrativeEvent streams for tenant/company/time-window.
          </p>
        </div>
        <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <RotateCcw className="h-5 w-5 text-primary" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Data Replay will allow you to select tenant, company, and time window, run preflight checks,
              dry-run logs, and execute replays. This feature is planned for a future sprint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For now, use the Audit Logs page to view replay events and raw payload references.
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
