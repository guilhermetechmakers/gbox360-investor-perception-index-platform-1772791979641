import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"
import { DataAccessGuard } from "@/components/admin/DataAccessGuard"
import {
  TenantSelector,
  TimeWindowPicker,
  type TimeWindow,
  PreflightPanel,
  ReplayControls,
  DryRunLog,
  ReplayProgressBar,
  JobHistoryList,
  ResourceEstimator,
  AuditTrailLinkCard,
  AuditLogsPreviewCard,
  FloatingPromoCard,
} from "@/components/admin/data-replay"
import {
  useAdminTenants,
  useAdminDataReplayHealth,
  useAdminDataReplayPreflightMutation,
  useAdminDataReplayRun,
  useAdminDataReplayJobs,
  useAdminDataReplayJobProgress,
  useAdminDataReplayAuditLogs,
} from "@/hooks/useAdmin"
import type { PreflightResult, DryRunResult, ReplayJob } from "@/types/admin"
import { safeArray } from "@/lib/data-guard"
import { format, subDays } from "date-fns"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

function getDefaultTimeWindow(): TimeWindow {
  const end = new Date()
  const start = subDays(end, 7)
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  }
}

export default function AdminDataReplay() {
  const navigate = useNavigate()
  const defaultWindow = getDefaultTimeWindow()
  const [tenantId, setTenantId] = useState<string>("")
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(defaultWindow)
  const [dryRunResult, setDryRunResult] = useState<PreflightResult | DryRunResult | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const { data: tenants = [] } = useAdminTenants()
  const tenantsList = safeArray(tenants)
  const { data: health, isLoading: healthLoading } = useAdminDataReplayHealth(tenantId || null)
  const preflightMutation = useAdminDataReplayPreflightMutation()
  const runMutation = useAdminDataReplayRun()
  const { data: jobs = [], isLoading: jobsLoading } = useAdminDataReplayJobs({
    tenantId: tenantId || undefined,
    windowStart: timeWindow.start,
    windowEnd: timeWindow.end,
  })
  const { data: progressData } = useAdminDataReplayJobProgress(activeJobId)
  const { data: auditPreview = [] } = useAdminDataReplayAuditLogs({
    tenantId: tenantId || undefined,
  })

  useEffect(() => {
    if (!tenantId || !timeWindow.start || !timeWindow.end) return
    if (timeWindow.start > timeWindow.end) return
    preflightMutation.mutate({
      tenantId,
      windowStart: timeWindow.start,
      windowEnd: timeWindow.end,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- preflightMutation.mutate is stable
  }, [tenantId, timeWindow.start, timeWindow.end])

  const runDryRun = useCallback(() => {
    if (!tenantId || !timeWindow.start || !timeWindow.end) return
    if (timeWindow.start > timeWindow.end) return
    runMutation.mutate(
      {
        tenantId,
        windowStart: timeWindow.start,
        windowEnd: timeWindow.end,
        mode: "dry-run",
      },
      {
        onSuccess: (data) => {
          if (data && "estimatedEventCount" in data) {
            setDryRunResult({
              jobId: data.jobId,
              estimatedEventCount: data.estimatedEventCount ?? 0,
              estimatedResources: data.estimatedResources ?? {},
              batchEstimates: data.batchEstimates,
              summary: data.summary,
            })
          } else {
            setDryRunResult({
              jobId: data?.jobId ?? "",
              estimatedEventCount: 0,
              estimatedResources: {},
              summary: "Dry-run completed",
            })
          }
        },
      }
    )
  }, [tenantId, timeWindow, runMutation])

  const runExecute = useCallback(() => {
    if (!tenantId || !timeWindow.start || !timeWindow.end) return
    if (timeWindow.start > timeWindow.end) return
    runMutation.mutate(
      {
        tenantId,
        windowStart: timeWindow.start,
        windowEnd: timeWindow.end,
        mode: "execute",
      },
      {
        onSuccess: (data) => {
          if (data?.jobId && data.status !== "completed") {
            setActiveJobId(data.jobId)
          }
        },
      }
    )
  }, [tenantId, timeWindow, runMutation])

  useEffect(() => {
    const status = (progressData as { status?: string })?.status
    if (status === "completed" || status === "failed" || status === "cancelled") {
      setActiveJobId(null)
      setIsPaused(false)
    }
  }, [progressData])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    toast.info("Pause requested. Backend support for pause/resume can be added when available.")
  }, [])

  const handleResume = useCallback(() => {
    setIsPaused(false)
    toast.info("Resume requested. Backend support for pause/resume can be added when available.")
  }, [])

  const handleCancel = useCallback(() => {
    setActiveJobId(null)
    setIsPaused(false)
    toast.info("Cancel requested. Backend support for cancel can be added when available.")
  }, [])

  const handleViewJobDetails = useCallback(
    (job: ReplayJob) => {
      const params = new URLSearchParams()
      if (job.tenantId) params.set("tenantId", job.tenantId)
      if (job.id) params.set("relatedJobId", job.id)
      params.set("eventTypes", "REPLAY")
      navigate(`/admin/audit-logs?${params.toString()}`)
    },
    [navigate]
  )

  const progressPercent = (progressData as { progressPercent?: number })?.progressPercent ?? 0
  const progressStatus = (progressData as { status?: string })?.status ?? "idle"
  const etaSeconds = (progressData as { etaSeconds?: number })?.etaSeconds
  const currentBatch = (progressData as { currentBatch?: number })?.currentBatch

  const preflightData: PreflightResult | DryRunResult | null | undefined =
    preflightMutation.data ?? dryRunResult

  return (
    <DataAccessGuard permission="audit_logs">
      <AnimatedPage>
        <div className="mx-auto max-w-[1000px] space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Data Replay
            </h1>
            <p className="mt-1 text-muted-foreground">
              Replay append-only NarrativeEvent streams for tenant, company, and time window.
              Dry-run to simulate; execute to run the live replay.
            </p>
          </div>

          {/* Scope selection */}
          <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <RotateCcw className="h-5 w-5 text-primary" aria-hidden />
                Scope
              </CardTitle>
              <CardDescription>
                Select tenant and time window for the replay
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <TenantSelector
                tenants={tenantsList}
                value={tenantId}
                onValueChange={setTenantId}
                placeholder="Select tenant"
              />
              <TimeWindowPicker
                value={timeWindow}
                onChange={setTimeWindow}
              />
            </CardContent>
          </Card>

          {/* Preflight & Replay controls */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PreflightPanel
              health={health ?? null}
              preflight={preflightData}
              isLoading={healthLoading && !!tenantId}
              tenantId={tenantId || null}
            />
            <Card className="rounded-[1rem] border border-border bg-card shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Replay controls</CardTitle>
                <CardDescription>
                  Dry-run simulates; Execute runs the live replay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReplayControls
                  onDryRun={runDryRun}
                  onExecute={runExecute}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
                  isDryRunPending={runMutation.isPending}
                  isExecutePending={runMutation.isPending}
                  isPaused={isPaused}
                  isRunning={progressStatus === "running" || progressStatus === "queued"}
                  disabled={!tenantId || !timeWindow.start || !timeWindow.end || timeWindow.start > timeWindow.end}
                />
                <ReplayProgressBar
                  progressPercent={progressPercent}
                  status={progressStatus}
                  etaSeconds={etaSeconds}
                  currentBatch={currentBatch}
                />
              </CardContent>
            </Card>
          </div>

          {/* Dry-run results & Resource estimator */}
          {(preflightData || dryRunResult) && (
            <div className="grid gap-6 lg:grid-cols-2">
              <DryRunLog result={preflightData ?? dryRunResult} />
              <ResourceEstimator
                resources={
                  (preflightData as PreflightResult)?.estimatedResources ??
                  (dryRunResult as DryRunResult)?.estimatedResources
                }
              />
            </div>
          )}

          {/* Job history & Audit */}
          <div className="grid gap-6 lg:grid-cols-2">
            <JobHistoryList
              jobs={jobs}
              onViewDetails={handleViewJobDetails}
              isLoading={jobsLoading}
            />
            <div className="space-y-6">
              <AuditTrailLinkCard
                tenantId={tenantId || undefined}
                windowStart={timeWindow.start}
                windowEnd={timeWindow.end}
                jobId={activeJobId ?? undefined}
              />
              <AuditLogsPreviewCard
                auditLogs={auditPreview}
                tenantId={tenantId || undefined}
                relatedJobId={activeJobId ?? undefined}
              />
            </div>
          </div>

          {/* Floating promo */}
          <FloatingPromoCard />
        </div>
      </AnimatedPage>
    </DataAccessGuard>
  )
}
