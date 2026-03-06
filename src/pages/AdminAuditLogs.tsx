import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatedPage } from "@/components/AnimatedPage"
import { FileText, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { useAdminAuditLogs, useAdminAuditLogPayload, useAdminTenants } from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"
import { format } from "date-fns"

const PAGE_SIZE_OPTIONS = [25, 50, 100]
const DEFAULT_PAGE_SIZE = 25

export default function AdminAuditLogs() {
  const [tenantId, setTenantId] = useState<string>("")
  const [eventType, setEventType] = useState<string>("")
  const [start, setStart] = useState<string>("")
  const [end, setEnd] = useState<string>("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [payloadId, setPayloadId] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      tenantId: tenantId || undefined,
      eventType: eventType || undefined,
      start: start || undefined,
      end: end || undefined,
      page,
      pageSize,
    }),
    [tenantId, eventType, start, end, page, pageSize]
  )

  const { data: auditRes, isLoading } = useAdminAuditLogs(params)
  const { data: tenants = [] } = useAdminTenants()
  const { data: payload, isLoading: payloadLoading } = useAdminAuditLogPayload(payloadId)

  const tenantsList = safeArray(tenants)
  const logs = auditRes?.data ?? []
  const count = auditRes?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Immutable event log. Filter by tenant, event type, and date range.
          </p>
        </div>

        {/* Filters */}
        <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Filters</CardTitle>
            <CardDescription>Narrow by tenant, event type, and date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
                <Select value={tenantId || "all"} onValueChange={(v) => setTenantId(v === "all" ? "" : v)}>
                  <SelectTrigger id="tenant">
                    <SelectValue placeholder="All tenants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tenants</SelectItem>
                    {tenantsList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event type</Label>
                <Select value={eventType || "all"} onValueChange={(v) => setEventType(v === "all" ? "" : v)}>
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="ingestion">Ingestion</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="weight_simulation">Weight simulation</SelectItem>
                    <SelectItem value="replay">Replay</SelectItem>
                    <SelectItem value="user_invite">User invite</SelectItem>
                    <SelectItem value="user_deactivate">User deactivate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTenantId("")
                  setEventType("")
                  setStart("")
                  setEnd("")
                  setPage(1)
                }}
              >
                Clear filters
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm text-muted-foreground">
                  Per page
                </Label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger id="pageSize" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <FileText className="h-5 w-5 text-primary" />
              Log entries
            </CardTitle>
            <CardDescription>
              {count} result(s). Click payload reference to view raw payload.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                No audit log entries match the current filters.
              </div>
            ) : (
              <>
                <ScrollArea className="w-full">
                  <div className="min-w-[640px]">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="p-3 text-left font-medium">Event type</th>
                          <th className="p-3 text-left font-medium">Source</th>
                          <th className="p-3 text-left font-medium">Actor</th>
                          <th className="p-3 text-left font-medium">Timestamp</th>
                          <th className="p-3 text-left font-medium">Payload</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(logs ?? []).map((log) => (
                          <tr
                            key={log.id}
                            className="border-b border-border transition-colors hover:bg-muted/30"
                          >
                            <td className="p-3">{log.eventType}</td>
                            <td className="p-3">{log.source}</td>
                            <td className="p-3">{log.actor}</td>
                            <td className="p-3 text-muted-foreground">
                              {log.timestamp ? format(new Date(log.timestamp), "PPp") : "—"}
                            </td>
                            <td className="p-3">
                              {log.payloadRef ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-primary"
                                  onClick={() => setPayloadId(log.id)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} · {count} total
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payload viewer modal */}
      <Dialog open={!!payloadId} onOpenChange={(open) => !open && setPayloadId(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Raw payload</DialogTitle>
          </DialogHeader>
          {payloadLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : payload?.data != null ? (
            <ScrollArea className="h-[50vh] w-full rounded-lg border border-border bg-muted/20 p-4">
              <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">
                {typeof payload.data === "string"
                  ? payload.data
                  : JSON.stringify(payload.data, null, 2)}
              </pre>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No payload data for this entry.</p>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
