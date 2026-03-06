import { useState, useMemo, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatedPage } from "@/components/AnimatedPage"
import { FileText, ChevronLeft, ChevronRight, ExternalLink, Archive, Inbox } from "lucide-react"
import { useAdminAuditLogs, useAdminAuditLogPayload, useAdminTenants, useAdminAuditLogExport, useAdminDashboardHealth } from "@/hooks/useAdmin"
import { useDlq, useRetryDlqItem } from "@/hooks/useIngestion"
import { useArchiveAuditLogs } from "@/hooks/useArchive"
import { safeArray } from "@/lib/data-guard"
import { format } from "date-fns"
import { subDays } from "date-fns"
import { Link } from "react-router-dom"
import { HealthRibbon } from "@/components/admin/HealthRibbon"
import { PayloadViewerModal } from "@/components/admin/PayloadViewerModal"
import { CSVExportButton, type ExportStatus } from "@/components/admin/CSVExportButton"
import { DataAccessGuard } from "@/components/admin/DataAccessGuard"
import type { AuditLog, AuditLogEventType } from "@/types/admin"
import type { ArchiveIndexEntry } from "@/types/archive"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [25, 50, 100]
const DEFAULT_PAGE_SIZE = 25
const EVENT_TYPES: AuditLogEventType[] = ["INGESTION", "EXPORT", "WEIGHT_SIM", "REPLAY"]
const DEBOUNCE_MS = 300

function getDefaultDateRange() {
  const end = new Date()
  const start = subDays(end, 7)
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  }
}

export default function AdminAuditLogs() {
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const [tenantId, setTenantId] = useState<string>("")
  const [eventTypes, setEventTypes] = useState<AuditLogEventType[]>([])
  const [actorSearch, setActorSearch] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const debouncedActor = useDebounce(actorSearch, DEBOUNCE_MS)
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS)
  const [start, setStart] = useState<string>(defaultRange.start)
  const [end, setEnd] = useState<string>(defaultRange.end)
  const [retentionStatus, setRetentionStatus] = useState<string>("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [payloadId, setPayloadId] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [archivePage, setArchivePage] = useState(1)
  const [archivePageSize] = useState(25)
  const [archiveEventIdFilter, setArchiveEventIdFilter] = useState("")
  const [archiveSourceFilter, setArchiveSourceFilter] = useState("")
  const [dlqSource, setDlqSource] = useState<string>("news")

  const params = useMemo(
    () => ({
      tenantId: tenantId || undefined,
      eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
      actor: debouncedActor || undefined,
      search: debouncedSearch || undefined,
      start: start || undefined,
      end: end || undefined,
      retentionStatus: retentionStatus || undefined,
      page,
      pageSize,
    }),
    [tenantId, eventTypes, debouncedActor, debouncedSearch, start, end, retentionStatus, page, pageSize]
  )

  const { data: auditRes, isLoading } = useAdminAuditLogs(params)
  const { data: tenants = [] } = useAdminTenants()
  const { data: payload, isLoading: payloadLoading } = useAdminAuditLogPayload(payloadId)
  const { data: healthData } = useAdminDashboardHealth()
  const exportMutation = useAdminAuditLogExport()
  const archiveParams = useMemo(
    () => ({
      eventId: archiveEventIdFilter.trim() || undefined,
      source: archiveSourceFilter.trim() || undefined,
      start: start || undefined,
      end: end || undefined,
      page: archivePage,
      pageSize: archivePageSize,
    }),
    [archiveEventIdFilter, archiveSourceFilter, start, end, archivePage, archivePageSize]
  )
  const { data: archiveRes, isLoading: archiveLoading } = useArchiveAuditLogs(archiveParams)
  const { data: dlqData, isLoading: dlqLoading } = useDlq(dlqSource)
  const retryDlqMutation = useRetryDlqItem(dlqSource)
  const archiveItems = Array.isArray(archiveRes?.items) ? archiveRes.items : (archiveRes?.data ?? [])
  const archiveCount = archiveRes?.count ?? 0
  const archiveTotalPages = Math.max(1, Math.ceil(archiveCount / archivePageSize))

  const tenantsList = safeArray(tenants)
  const logs: AuditLog[] = Array.isArray(auditRes?.data) ? auditRes.data : (auditRes?.items ?? [])
  const count = auditRes?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const exportStatus: ExportStatus = exportMutation.isPending ? "in_progress" : exportMutation.isError ? "failed" : exportMutation.isSuccess ? "complete" : "idle"

  const exportParams = useMemo(
    () => ({
      startDate: start || undefined,
      endDate: end || undefined,
      eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
      tenantId: tenantId || undefined,
      actor: debouncedActor || undefined,
      search: debouncedSearch || undefined,
      format: exportFormat,
    }),
    [start, end, eventTypes, tenantId, debouncedActor, debouncedSearch, exportFormat]
  )

  const toggleEventType = (type: AuditLogEventType) => {
    setEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setPage(1)
  }

  const handleExport = useCallback(
    (p: import("@/types/admin").AuditLogExportParams) => {
      exportMutation.mutate(p)
    },
    [exportMutation]
  )

  const clearFilters = useCallback(() => {
    setTenantId("")
    setEventTypes([])
    setActorSearch("")
    setSearch("")
    setStart(defaultRange.start)
    setEnd(defaultRange.end)
    setRetentionStatus("")
    setPage(1)
  }, [defaultRange])

  const health = healthData?.health
  const payloadContent = payload?.data ?? null

  return (
    <DataAccessGuard permission="audit_logs">
      <AnimatedPage>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Health Ribbon */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Admin — Audit Logs
            </h1>
            <p className="text-muted-foreground">
              Immutable audit trail. Ingestion events, exports, weight simulations, and replays with
              raw payload references.
            </p>
          </div>
          <HealthRibbon
            status={health?.workerStatus}
            queueLength={health?.ingestionQueueLength ?? 0}
            lastJobAt={health?.lastSuccessfulJobAt ?? null}
          />
        </div>

        {/* Filters */}
        <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Filters</CardTitle>
            <CardDescription>Narrow by tenant, event type, actor, and date range</CardDescription>
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
                <Label>Event types</Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Event type filters">
                  {EVENT_TYPES.map((type) => {
                    const selected = eventTypes.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEventType(type)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                        aria-pressed={selected}
                        aria-label={`Filter by ${type}`}
                      >
                        {type.replace("_", " ")}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actor">Actor / Email</Label>
                <Input
                  id="actor"
                  type="text"
                  placeholder="Search by actor..."
                  value={actorSearch}
                  onChange={(e) => setActorSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
              <div className="space-y-2">
                <Label htmlFor="retention">Retention</Label>
                <Select value={retentionStatus || "all"} onValueChange={(v) => setRetentionStatus(v === "all" ? "" : v)}>
                  <SelectTrigger id="retention">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="RETAINED">Retained</SelectItem>
                    <SelectItem value="EVICTED">Evicted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
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
        <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-display">
                <FileText className="h-5 w-5 text-primary" />
                Log entries
              </CardTitle>
              <CardDescription>
                {count} result(s). Click payload reference to view raw payload.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as "csv" | "json")}
                aria-label="Export format"
              >
                <SelectTrigger className="w-28" id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <CSVExportButton
                onExport={handleExport}
                status={exportStatus}
                params={exportParams}
                disabled={logs.length === 0}
              />
            </div>
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
                  <div className="min-w-[800px]">
                    <table
                      className="w-full border-collapse text-sm"
                      role="table"
                      aria-label="Audit log entries"
                    >
                      <thead>
                        <tr className="sticky top-0 z-10 border-b border-border bg-muted/30">
                          <th className="p-3 text-left font-medium" scope="col">Date / Time</th>
                          <th className="p-3 text-left font-medium" scope="col">Event type</th>
                          <th className="p-3 text-left font-medium" scope="col">Actor</th>
                          <th className="p-3 text-left font-medium" scope="col">Tenant</th>
                          <th className="p-3 text-left font-medium" scope="col">Event ID</th>
                          <th className="p-3 text-left font-medium" scope="col">Payload ID</th>
                          <th className="p-3 text-left font-medium" scope="col">Payload hash</th>
                          <th className="p-3 text-left font-medium" scope="col">Description</th>
                          <th className="p-3 text-left font-medium" scope="col">Retention</th>
                          <th className="p-3 text-left font-medium" scope="col">Payload</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <AuditLogRow
                            key={log.id}
                            log={log}
                            onViewPayload={() => setPayloadId(log.id)}
                          />
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
                    <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        aria-label="Next page"
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

        {/* Archival index: event_id -> s3_key with provenance, checksum */}
        <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Archive className="h-5 w-5 text-primary" />
              Archival index
            </CardTitle>
            <CardDescription>
              Archived payloads with event_id, s3_key, checksum, and archive timestamp. Click event ID to drill down.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-4">
              <Input
                placeholder="Filter by event ID"
                value={archiveEventIdFilter}
                onChange={(e) => { setArchiveEventIdFilter(e.target.value); setArchivePage(1); }}
                className="max-w-xs"
              />
              <Input
                placeholder="Filter by source"
                value={archiveSourceFilter}
                onChange={(e) => { setArchiveSourceFilter(e.target.value); setArchivePage(1); }}
                className="max-w-xs"
              />
            </div>
            {archiveLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : archiveItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                No archival index entries. Archive payloads to see entries here.
              </div>
            ) : (
              <>
                <ScrollArea className="w-full">
                  <div className="min-w-[700px]">
                    <table className="w-full border-collapse text-sm" role="table" aria-label="Archival index">
                      <thead>
                        <tr className="sticky top-0 z-10 border-b border-border bg-muted/30">
                          <th className="p-3 text-left font-medium" scope="col">Event ID</th>
                          <th className="p-3 text-left font-medium" scope="col">S3 key</th>
                          <th className="p-3 text-left font-medium" scope="col">Archive timestamp</th>
                          <th className="p-3 text-left font-medium" scope="col">Checksum</th>
                          <th className="p-3 text-left font-medium" scope="col">Tenant</th>
                          <th className="p-3 text-left font-medium" scope="col">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archiveItems.map((row: ArchiveIndexEntry) => (
                          <tr key={row.event_id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-3 font-mono text-xs" role="cell">
                              <Link
                                to={`/admin/drilldown/${row.event_id}`}
                                className="text-primary hover:underline"
                              >
                                {row.event_id}
                              </Link>
                            </td>
                            <td className="max-w-[200px] truncate p-3 font-mono text-xs" title={row.s3_key}>
                              {row.s3_key}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {row.archive_timestamp ? format(new Date(row.archive_timestamp), "PPp") : "—"}
                            </td>
                            <td className="max-w-[120px] truncate p-3 font-mono text-xs" title={row.checksum}>
                              {row.checksum}
                            </td>
                            <td className="p-3">{row.tenant_id}</td>
                            <td className="p-3">{row.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
                {archiveTotalPages > 1 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {archivePage} of {archiveTotalPages} · {archiveCount} total
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArchivePage((p) => Math.max(1, p - 1))}
                        disabled={archivePage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArchivePage((p) => Math.min(archiveTotalPages, p + 1))}
                        disabled={archivePage >= archiveTotalPages}
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

        {/* Dead-letter queue (DLQ): failed ingestion items by source */}
        <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Inbox className="h-5 w-5 text-primary" />
              Dead-letter queue
            </CardTitle>
            <CardDescription>
              Failed ingestion items by source. Retry to re-queue for processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <Label htmlFor="dlq-source">Source</Label>
              <Select value={dlqSource} onValueChange={setDlqSource}>
                <SelectTrigger id="dlq-source" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="earnings_transcripts">Earnings transcripts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dlqLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (dlqData?.items ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                No DLQ entries for this source.
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <table className="w-full border-collapse text-sm" role="table" aria-label="DLQ entries">
                    <thead>
                      <tr className="sticky top-0 z-10 border-b border-border bg-muted/30">
                        <th className="p-3 text-left font-medium" scope="col">Idempotency key</th>
                        <th className="p-3 text-left font-medium" scope="col">Error</th>
                        <th className="p-3 text-left font-medium" scope="col">Retries</th>
                        <th className="p-3 text-left font-medium" scope="col">Last attempted</th>
                        <th className="p-3 text-left font-medium" scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dlqData?.items ?? []).map((row) => (
                        <tr key={row.id} className="border-b border-border hover:bg-muted/30">
                          <td className="max-w-[200px] truncate p-3 font-mono text-xs" title={row.idempotencyKey}>
                            {row.idempotencyKey}
                          </td>
                          <td className="max-w-[240px] truncate p-3 text-muted-foreground" title={row.errorMessage ?? undefined}>
                            {row.errorMessage ?? "—"}
                          </td>
                          <td className="p-3">{row.retryCount}</td>
                          <td className="p-3 text-muted-foreground">
                            {row.lastAttemptedAt ? format(new Date(row.lastAttemptedAt), "PPp") : "—"}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-primary hover:bg-primary/10"
                              onClick={() => retryDlqMutation.mutate(row.idempotencyKey)}
                              disabled={retryDlqMutation.isPending}
                              aria-label={`Retry ${row.idempotencyKey}`}
                            >
                              Retry
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <PayloadViewerModal
        open={!!payloadId}
        onOpenChange={(open) => !open && setPayloadId(null)}
        payload={payloadContent}
        isLoading={payloadLoading}
      />
      </AnimatedPage>
    </DataAccessGuard>
  )
}

interface AuditLogRowProps {
  log: AuditLog
  onViewPayload: () => void
}

function AuditLogRow({ log, onViewPayload }: AuditLogRowProps) {
  const eventType = log.event_type ?? log.eventType ?? ""
  const actor = log.actor_email ?? log.actor ?? "—"
  const tenant = log.tenant_name ?? log.tenantId ?? "—"
  const eventId = log.event_id ?? "—"
  const payloadId = log.payload_id ?? log.payloadRef ?? "—"
  const payloadHash = log.payloadHash ?? "—"
  const description = log.description ?? "—"
  const retention = log.retention_status ?? "—"
  const hasPayload = log.raw_payload_present ?? !!log.payloadRef

  const descTruncated = String(description).length > 60
  const descDisplay = descTruncated ? `${String(description).slice(0, 60)}…` : description

  return (
    <tr
      className="border-b border-border transition-colors hover:bg-muted/30"
      role="row"
    >
      <td className="p-3 text-muted-foreground" role="cell">
        {log.timestamp ? format(new Date(log.timestamp), "PPp") : "—"}
      </td>
      <td className="p-3" role="cell">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {eventType || "—"}
        </span>
      </td>
      <td className="p-3" role="cell">{actor}</td>
      <td className="p-3" role="cell">{tenant}</td>
      <td className="p-3 font-mono text-xs" role="cell">
        {eventId && eventId !== "—" ? (
          <Link to={`/admin/drilldown/${eventId}`} className="text-primary hover:underline">
            {eventId}
          </Link>
        ) : (
          eventId
        )}
      </td>
      <td className="p-3 font-mono text-xs" role="cell">{payloadId}</td>
      <td className="max-w-[120px] truncate p-3 font-mono text-xs" role="cell" title={payloadHash !== "—" ? payloadHash : undefined}>
        {payloadHash}
      </td>
      <td className="max-w-[200px] p-3" role="cell">
        <span title={descTruncated ? String(description) : undefined}>
          {descDisplay}
        </span>
      </td>
      <td className="p-3" role="cell">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium",
            retention === "RETAINED" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
          )}
        >
          {retention}
        </span>
      </td>
      <td className="p-3" role="cell">
        {hasPayload ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-primary hover:bg-primary/10"
            onClick={onViewPayload}
            aria-label={`View raw payload for ${log.id}`}
          >
            <ExternalLink className="h-4 w-4" />
            View
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}
