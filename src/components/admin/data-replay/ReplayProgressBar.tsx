import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ReplayProgressBarProps {
  progressPercent: number
  status?: string
  etaSeconds?: number
  currentBatch?: number
  className?: string
}

export function ReplayProgressBar({
  progressPercent,
  status = "idle",
  etaSeconds,
  currentBatch,
  className,
}: ReplayProgressBarProps) {
  const value = Math.min(100, Math.max(0, progressPercent ?? 0))
  const etaStr = etaSeconds != null ? `ETA: ~${Math.ceil(etaSeconds / 60)} min` : null

  return (
    <Card className={cn("rounded-[1rem] border border-border bg-card shadow-card", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Progress</CardTitle>
        <CardDescription>
          {status === "running" || status === "queued"
            ? "Replay in progress"
            : status === "completed"
              ? "Replay completed"
              : "No active replay"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={value} className="h-3" />
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium">{value}%</span>
          {currentBatch != null && (
            <span className="text-muted-foreground">Batch {currentBatch}</span>
          )}
          {etaStr && (
            <span className="text-muted-foreground">{etaStr}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
