import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ExternalLink, FileText } from "lucide-react"
import type { ReplayJob } from "@/types/admin"
import { cn } from "@/lib/utils"

const statusConfig = {
  queued: { color: "bg-slate-100 text-slate-800", label: "Queued" },
  running: { color: "bg-blue-100 text-blue-800", label: "Running" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  failed: { color: "bg-red-100 text-red-800", label: "Failed" },
  cancelled: { color: "bg-amber-100 text-amber-800", label: "Cancelled" },
  paused: { color: "bg-amber-100 text-amber-800", label: "Paused" },
} as const

interface JobHistoryListProps {
  jobs: ReplayJob[]
  onViewDetails?: (job: ReplayJob) => void
  isLoading?: boolean
  className?: string
}

export function JobHistoryList({
  jobs,
  onViewDetails,
  isLoading = false,
  className,
}: JobHistoryListProps) {
  const list = Array.isArray(jobs) ? jobs : []

  return (
    <Card className={cn("rounded-[1rem] border border-border bg-card shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          Job history
        </CardTitle>
        <CardDescription>
          Recent replay jobs with status and timestamps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            No replay jobs yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <ul className="space-y-2 pr-4">
              {list.map((job) => (
                <JobItem
                  key={job.id}
                  job={job}
                  onViewDetails={onViewDetails}
                />
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

interface JobItemProps {
  job: ReplayJob
  onViewDetails?: (job: ReplayJob) => void
}

function JobItem({ job, onViewDetails }: JobItemProps) {
  const status = (job.status ?? "queued") as keyof typeof statusConfig
  const cfg = statusConfig[status] ?? statusConfig.queued

  return (
    <li
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
      role="listitem"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {job.tenantName ?? job.tenantId} · {job.mode === "dry-run" ? "Dry-run" : "Execute"}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(job.startedAt), "PPp")}
          {job.endedAt && ` – ${format(new Date(job.endedAt), "PPp")}`}
        </p>
        {job.summary && (
          <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.color)}>
          {cfg.label}
        </span>
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() => onViewDetails(job)}
            aria-label={`View details for job ${job.id}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View
          </Button>
        )}
      </div>
    </li>
  )
}
