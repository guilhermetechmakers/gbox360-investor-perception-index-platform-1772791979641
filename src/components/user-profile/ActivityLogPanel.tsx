import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Download, ChevronDown, ChevronRight } from "lucide-react"
import { useUserActivity, useUserActivityExport } from "@/hooks/useUserProfile"
import type { ActivityItem } from "@/types/user-profile"
import { cn } from "@/lib/utils"

export interface ActivityLogPanelProps {
  /** When true, show CSV export button (admin-only) */
  showExport?: boolean
}

export function ActivityLogPanel({ showExport = false }: ActivityLogPanelProps) {
  const { data: activities = [], isLoading } = useUserActivity()
  const exportMutation = useUserActivityExport()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const list = Array.isArray(activities) ? activities : (activities as ActivityItem[])

  const handleExport = () => {
    exportMutation.mutate()
  }

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display">
            <Activity className="h-5 w-5 text-primary" aria-hidden />
            Recent activity
          </CardTitle>
          <CardDescription>
            Logins, exports, and other actions. Click a row to see details.
          </CardDescription>
        </div>
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2"
            aria-label="Download activity as CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center"
            role="status"
            aria-label="No activity yet"
          >
            <Activity className="h-10 w-10 text-muted-foreground" aria-hidden />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No activity yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your recent actions will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Activity list">
            {list.map((item) => (
              <ActivityLogItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityLogItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: ActivityItem
  isExpanded: boolean
  onToggle: () => void
}) {
  const timestamp = item.timestamp ? format(new Date(item.timestamp), "PPp") : "—"
  const metadata = item.metadata ?? {}

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isExpanded && "bg-muted/50"
        )}
        aria-expanded={isExpanded}
        aria-controls={`activity-detail-${item.id}`}
        id={`activity-${item.id}`}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{item.description}</p>
          <p className="text-sm text-muted-foreground">{timestamp}</p>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
          {item.action_type}
        </span>
      </button>
      {isExpanded && (
        <div
          id={`activity-detail-${item.id}`}
          role="region"
          aria-labelledby={`activity-${item.id}`}
          className="rounded-b-lg border border-t-0 border-border bg-muted/20 px-4 py-3"
        >
          <p className="text-xs font-medium text-muted-foreground">Details</p>
          <pre className="mt-1 overflow-auto rounded bg-background p-3 text-xs text-foreground">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      )}
    </li>
  )
}
