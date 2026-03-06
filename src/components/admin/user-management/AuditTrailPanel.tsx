import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { UserAuditEvent } from "@/types/admin"
import { safeArray } from "@/lib/data-guard"

interface AuditTrailPanelProps {
  events?: UserAuditEvent[] | null
  isLoading?: boolean
}

export function AuditTrailPanel({ events = [], isLoading = false }: AuditTrailPanelProps) {
  const items = safeArray(events)

  return (
    <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg">Recent activity</CardTitle>
        <CardDescription>
          Audit trail for user management actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {items.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{evt.action?.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {evt.timestamp ? format(new Date(evt.timestamp), "PPp") : "—"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {evt.actor_email ?? evt.actor_id} · {evt.target_type} {evt.target_id}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
