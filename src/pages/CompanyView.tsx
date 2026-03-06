import { useParams, Link, useSearchParams } from "react-router-dom"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useTopNarratives,
  useIPIEvents,
  useIPICalculateQuery,
  useNarrativesByRange,
} from "@/hooks/useIPI"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { CompanyTimeWindowSelect } from "@/components/dashboard/CompanyTimeWindowSelect"
import { DateRangePicker, IPIBreakdownPanel, SandboxModal } from "@/components/ipi"
import { useModals } from "@/components/modals"
import { ipiApi } from "@/api/ipi"
import { windowToDateRange } from "@/lib/date-utils"
import type { NarrativeEvent } from "@/types/narrative"
import { ArrowDownRight, ArrowUpRight, Download, Flag, FileJson, Beaker } from "lucide-react"

export default function CompanyView() {
  const { companyId } = useParams<{ companyId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const modals = useModals()
  const id = companyId ?? ""
  const windowParam = searchParams.get("window") ?? "1W"
  const validWindow = ["1D", "1W", "2W", "1M"].includes(windowParam) ? windowParam : "1W"

  const { start: defaultStart, end: defaultEnd } = useMemo(
    () => windowToDateRange(validWindow),
    [validWindow]
  )
  const [dateStart, setDateStart] = useState(defaultStart)
  const [dateEnd, setDateEnd] = useState(defaultEnd)
  const [sandboxOpen, setSandboxOpen] = useState(false)

  const handleExport = async () => {
    modals.showLoading({ title: "Exporting…", subtitle: "Preparing your export." })
    try {
      const result = await ipiApi.requestExport(id, validWindow, "csv")
      modals.hideLoading()
      const exportUrl = (result?.url ?? "").trim()
      const hasDownloadUrl = exportUrl && exportUrl !== "#"
      modals.showSuccess({
        title: "Export complete",
        message: "Your IPI data has been exported successfully.",
        primaryAction: hasDownloadUrl
          ? {
              label: "Download",
              onClick: () => {
                window.open(exportUrl, "_blank")
                modals.hideSuccess()
              },
            }
          : {
              label: "Dismiss",
              onClick: modals.hideSuccess,
            },
        secondaryAction: hasDownloadUrl
          ? { label: "Dismiss", onClick: modals.hideSuccess }
          : undefined,
        showViewResults: false,
        resultsHref: undefined,
      })
    } catch (err) {
      modals.hideLoading()
      modals.showError({
        title: "Export failed",
        errorMessage: err instanceof Error ? err.message : "Could not complete export.",
        retryAction: {
          label: "Retry",
          onClick: () => {
            modals.hideError()
            handleExport()
          },
        },
        supportLink: "/about-help",
      })
    }
  }

  const { data: company, isLoading: companyLoading } = useCompanyDetail(id)
  const { data: ipi, isLoading: ipiLoading } = useIPICurrent(id, validWindow)
  const { data: narrativesData, isLoading: narrativesLoading } = useTopNarratives(id, validWindow, 3)
  const { data: eventsData, isLoading: eventsLoading } = useIPIEvents(id, validWindow)
  const { data: narrativesByRangeData } = useNarrativesByRange(id, dateStart, dateEnd)
  const narrativesByRange = Array.isArray(narrativesByRangeData) ? narrativesByRangeData : []

  const { data: calculateQueryData, isLoading: calculateQueryLoading } = useIPICalculateQuery(
    id,
    dateStart,
    dateEnd
  )
  const calculateResult = calculateQueryData ?? null
  const calculateLoading = calculateQueryLoading

  const narratives = Array.isArray(narrativesData) ? narrativesData : []
  const events: NarrativeEvent[] =
    narrativesByRange.length > 0
      ? narrativesByRange.map((n: unknown) => {
          const x = n as Record<string, unknown>
          return {
            event_id: String(x?.event_id ?? x?.id ?? ""),
            company_id: String(x?.company_id ?? ""),
            source: String(x?.source ?? x?.source_platform ?? "—"),
            platform: x?.platform as string | undefined,
            speaker: {
              entity: String(x?.speaker_entity ?? (x?.speaker as { entity?: string })?.entity ?? "—"),
              inferred_role: (x?.speaker_role ?? (x?.speaker as { inferred_role?: string })?.inferred_role) as string | undefined,
            },
            raw_text: String(x?.raw_text ?? ""),
            published_at: String(x?.published_at ?? x?.created_at ?? new Date().toISOString()),
            ingested_at: String(x?.ingested_at ?? x?.created_at ?? new Date().toISOString()),
            created_at: String(x?.created_at ?? new Date().toISOString()),
            authority_score: Number(x?.authority_weight ?? x?.authority_score ?? 0),
            authority_weight: Number(x?.authority_weight ?? 0),
            credibility_proxy: Number(x?.credibility_proxy ?? 0),
            narrative_topic_ids: Array.isArray(x?.narrative_topic_ids) ? (x.narrative_topic_ids as string[]) : [],
          } as NarrativeEvent
        })
      : Array.isArray(eventsData) ? eventsData : []

  const handleWindowChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("window", value)
      return next
    })
    const { start, end } = windowToDateRange(value)
    setDateStart(start)
    setDateEnd(end)
  }

  const handleSandboxRun = async (weights: {
    narrative: number
    credibility: number
    risk: number
  }) => {
    return ipiApi.sandbox({
      companyId: id,
      timeWindowStart: `${dateStart}T00:00:00.000Z`,
      timeWindowEnd: `${dateEnd}T23:59:59.999Z`,
      provisionalWeights: weights,
      scenarioName: "Custom",
    })
  }

  if (companyLoading || !company) {
    return (
      <AnimatedPage>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {company.name} ({company.ticker})
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <CompanyTimeWindowSelect
                value={validWindow}
                onChange={handleWindowChange}
              />
              <DateRangePicker
                start={dateStart}
                end={dateEnd}
                onStartChange={setDateStart}
                onEndChange={setDateEnd}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/company/${id}/drill-down?window=${validWindow}`}>
              <Button variant="outline">Why did this move?</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setSandboxOpen(true)}
              className="gap-2"
            >
              <Beaker className="h-4 w-4" />
              Sandbox
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Export"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Flag">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* IPI card */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Investor Perception Index</CardTitle>
            <CardDescription>
              0–100 scale. Provisional weights: Narrative 40%, Credibility 40%, Risk 20%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ipiLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : ipi ? (
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {calculateResult?.totalScore ?? ipi.score}
                  </span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                <div className="flex items-center gap-1 text-lg">
                  {(ipi.delta ?? 0) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                  <span className={(ipi.delta ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                    {(ipi.delta ?? 0) >= 0 ? "+" : ""}
                    {ipi.delta ?? 0}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Narrative {(calculateResult?.narrativeScore ?? ipi.narrative_component)?.toFixed(1)} · Credibility{" "}
                  {(calculateResult?.credibilityScore ?? ipi.credibility_component)?.toFixed(1)} · Risk{" "}
                  {(calculateResult?.riskScore ?? ipi.risk_component)?.toFixed(1)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No IPI data for this window.</p>
            )}
          </CardContent>
        </Card>

        {/* Breakdown panel */}
        <IPIBreakdownPanel
          result={calculateResult ?? null}
          isLoading={calculateLoading}
        />

        {/* Top 3 narratives */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Top contributing narratives</CardTitle>
            <CardDescription>Summaries with authority and credibility.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : narratives.length > 0 ? (
              <ul className="space-y-4">
                {narratives.map((n) => (
                  <li key={n.topic_id}>
                    <Card className="border-l-4 border-l-primary transition-shadow hover:shadow-md">
                      <CardContent className="py-4">
                        <p className="font-medium">{n.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Authority: {(n.authority_weight * 100).toFixed(0)}%</span>
                          <span>Credibility: {(n.credibility_proxy * 100).toFixed(0)}%</span>
                          <span>{n.event_count} events</span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No narratives for this window.</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline / Events */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Event timeline</CardTitle>
            <CardDescription>
              NarrativeEvents with provenance. View raw payload for audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : events.length > 0 ? (
              <div className="space-y-2">
                {events.slice(0, 10).map((ev) => (
                  <Card
                    key={ev.event_id}
                    className="flex items-center justify-between p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{ev.raw_text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ev.source} · {ev.speaker?.entity ?? "—"} ·{" "}
                        {new Date(ev.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/dashboard/payload/${ev.event_id}`}>
                      <Button variant="ghost" size="sm">
                        <FileJson className="h-4 w-4" />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No events in this window.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <SandboxModal
        open={sandboxOpen}
        onOpenChange={setSandboxOpen}
        companyId={id}
        timeWindowStart={`${dateStart}T00:00:00.000Z`}
        timeWindowEnd={`${dateEnd}T23:59:59.999Z`}
        onRun={handleSandboxRun}
      />
    </AnimatedPage>
  )
}
