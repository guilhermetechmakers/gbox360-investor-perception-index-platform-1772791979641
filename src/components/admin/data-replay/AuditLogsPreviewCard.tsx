import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import type { AuditLogPreview } from "@/types/admin"
import { cn } from "@/lib/utils"

interface AuditLogsPreviewCardProps {
  auditLogs: AuditLogPreview[]
  tenantId?: string
  relatedJobId?: string
  className?: string
}

export function AuditLogsPreviewCard({
  auditLogs,
  tenantId,
  relatedJobId,
  className,
}: AuditLogsPreviewCardProps) {
  const list = Array.isArray(auditLogs) ? auditLogs : []
  const params = new URLSearchParams()
  if (tenantId) params.set("tenantId", tenantId)
  if (relatedJobId) params.set("relatedJobId", relatedJobId)

  const to = `/admin/audit-logs${params.toString() ? `?${params.toString()}` : ""}`

  return (
    <Card className={cn("rounded-[1rem] border border-border bg-card shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          Recent replay events
        </CardTitle>
        <CardDescription>
          Recent audit events tied to replays; links to raw payloads
        </CardDescription>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-muted-foreground">
            No replay events yet
          </div>
        ) : (
          <ul className="space-y-2">
            {list.slice(0, 5).map((log) => (
              <li
                key={log.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{log.actionType ?? "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.description ?? "—"}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {log.timestamp ? format(new Date(log.timestamp), "PPp") : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link to={to} className="mt-4 block">
          <Button variant="ghost" size="sm" className="gap-2" aria-label="View all audit logs">
            <ExternalLink className="h-4 w-4" aria-hidden />
            View all
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
