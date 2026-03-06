import { useParams, Link, useSearchParams } from "react-router-dom"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useIPIEvents,
  useIPICalculateQuery,
  useNarrativesWithDecay,
} from "@/hooks/useIPI"
import {
  useAuthorityBreakdown,
  useCredibilityProxy,
} from "@/hooks/useExplainability"
import { useEvents } from "@/hooks/useEvents"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { SandboxModal, ExperimentPanel } from "@/components/ipi"
import { NarrativeCard, DecayGauge, NarrativeEventCard, ReplayPanel, NarrativeFilters } from "@/components/narrative"
import {
  AuthorityBreakdownCard,
  CredibilityProxyCard,
  RawPayloadPanel,
} from "@/components/explainability"
import { windowToDateRange } from "@/lib/date-utils"
import {
  exportNarrativesToCsv,
  exportEventsToCsv,
  exportToJson,
  downloadCsv,
  downloadJson,
} from "@/lib/export-utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Beaker, BarChart2, Download, FileJson } from "lucide-react"
import { ipiApi } from "@/api/ipi"
import type { NarrativeEvent } from "@/types/narrative"

export default function DrillDown() {
  const { companyId } = useParams<{ companyId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sandboxOpen, setSandboxOpen] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<string>("")
  const [platformFilter, setPlatformFilter] = useState<string>("")
  const id = companyId ?? ""
  const windowParam = searchParams.get("window") ?? "1W"
  const validWindow = ["1D", "1W", "2W", "30d", "90d", "1M"].includes(windowParam) ? windowParam : "1W"

  const { start, end } = useMemo(() => windowToDateRange(validWindow), [validWindow])
  const startIso = `${start}T00:00:00.000Z`
  const endIso = `${end}T23:59:59.999Z`

  const eventsParams = useMemo(
    () => ({
      company_id: id,
      companyId: id,
      start: startIso,
      end: endIso,
      limit: 50,
      source_id: sourceFilter || undefined,
      platform: platformFilter || undefined,
    }),
    [id, startIso, endIso, sourceFilter, platformFilter]
  )
  const { data: eventsResponse, isLoading: eventsLoading } = useEvents(eventsParams)
  const eventsFromApi = Array.isArray(eventsResponse) ? eventsResponse : []

  const { data: company } = useCompanyDetail(id)
  const { data: ipi, isLoading: ipiLoading } = useIPICurrent(id, validWindow)
  const { data: events } = useIPIEvents(id, validWindow)
  const { data: calculateResult } = useIPICalculateQuery(id, start, end)
  const { data: narrativesWithDecay } = useNarrativesWithDecay(
    id,
    `${start}T00:00:00.000Z`,
    `${end}T23:59:59.999Z`
  )
  const { sources: authoritySources, isLoading: authorityLoading } = useAuthorityBreakdown(
    id,
    start,
    end
  )
  const { proxies: credibilityProxies, isLoading: credibilityLoading } = useCredibilityProxy(
    id,
    start,
    end
  )
  const eventsList = Array.isArray(events) ? events : []
  const narrativesDecay = Array.isArray(narrativesWithDecay) ? narrativesWithDecay : []
  const displayEvents = eventsFromApi.length > 0 ? eventsFromApi : eventsList

  /** Unique payload refs for raw payload panel (event_id or source_payload_id) */
  const payloadRefs = useMemo(() => {
    const list = (displayEvents ?? []) as Array<{ event_id?: string; source_payload_id?: string; raw_text?: string }>
    const seen = new Set<string>()
    return list
      .map((ev) => {
        const refId = ev?.source_payload_id ?? ev?.event_id ?? ""
        if (!refId || seen.has(refId)) return null
        seen.add(refId)
        return {
          id: refId,
          eventId: ev?.event_id ?? refId,
          label: (ev?.raw_text ?? refId).toString().slice(0, 50),
        }
      })
      .filter((r): r is { id: string; eventId: string; label: string } => r != null)
  }, [displayEvents])

  const handleExportCsv = () => {
    const narrativeRows = narrativesDecay.map((n) => ({
      id: n.id,
      source: "",
      platform: "",
      rawText: n.name ?? "",
      timestamp: n.lastUpdated ?? "",
      weight: n.weight,
    }))
    const eventRows = (displayEvents ?? []).map((ev: NarrativeEvent) => ({
      id: ev.event_id ?? "",
      narrativeId: "",
      type: "narrative",
      timestamp: ev.published_at ?? ev.created_at ?? "",
      payloadRef: (ev as { source_payload_id?: string }).source_payload_id ?? "",
    }))
    downloadCsv(
      exportNarrativesToCsv(narrativeRows) + "\n\n" + exportEventsToCsv(eventRows),
      `drilldown-${id}-${start}-${end}`
    )
  }

  const handleExportJson = () => {
    const payload = {
      narratives: narrativesDecay,
      events: displayEvents ?? [],
      exportedAt: new Date().toISOString(),
    }
    downloadJson(exportToJson(payload), `drilldown-${id}-${start}-${end}`)
  }

  const handleSandboxRun = async (weights: {
    narrative: number
    credibility: number
    risk: number
  }) => {
    return ipiApi.sandbox({
      companyId: id,
      timeWindowStart: `${start}T00:00:00.000Z`,
      timeWindowEnd: `${end}T23:59:59.999Z`,
      provisionalWeights: weights,
      scenarioName: "Custom",
    })
  }

  const decompositionData = ipi
    ? [
        { name: "Narrative", value: calculateResult?.narrativeScore ?? ipi.narrative_component, fill: "rgb(var(--primary))" },
        { name: "Credibility", value: calculateResult?.credibilityScore ?? ipi.credibility_component, fill: "rgb(var(--secondary))" },
        { name: "Risk", value: calculateResult?.riskScore ?? ipi.risk_component, fill: "rgb(var(--muted-foreground))" },
      ]
    : []

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link to={`/dashboard/company/${id}?window=${validWindow}`}>
              <Button variant="ghost">← Back to company</Button>
            </Link>
            <h1 className="font-display text-2xl font-semibold">
              Why did this move? — {company?.name ?? "…"}
            </h1>
            <Button
              variant="outline"
              onClick={() => setSandboxOpen(true)}
              className="gap-2"
            >
              <Beaker className="h-4 w-4" />
              Sandbox
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportCsv}
                aria-label="Export to CSV"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportJson}
                aria-label="Export to JSON"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
          <NarrativeFilters
            timeWindow={validWindow}
            onTimeWindowChange={(v: string) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set("window", v)
                return next
              })
            }}
            dateStart={start}
            dateEnd={end}
            onDateStartChange={() => {}}
            onDateEndChange={() => {}}
            source={sourceFilter}
            onSourceChange={setSourceFilter}
            platform={platformFilter}
            onPlatformChange={setPlatformFilter}
          />
        </div>

        {/* Numeric decomposition */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>IPI decomposition</CardTitle>
            <CardDescription>
              Narrative, Credibility, and Risk components. Provisional weights: 40% / 40% / 20%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ipiLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : decompositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={decompositionData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Score" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No decomposition data.</p>
            )}
          </CardContent>
        </Card>

        {/* Authority & Credibility breakdowns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AuthorityBreakdownCard
            sources={authoritySources}
            isLoading={authorityLoading}
          />
          <CredibilityProxyCard
            proxies={credibilityProxies}
            isLoading={credibilityLoading}
          />
        </div>

        <ExperimentPanel
          companyId={id}
          windowStart={startIso}
          windowEnd={endIso}
        />

        {/* Narrative decay-weighted scores */}
        {narrativesDecay.length > 0 && (
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle>Narrative decay-weighted scores</CardTitle>
              <CardDescription>
                Per-narrative weights with exponential time decay. Click a card to view events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {narrativesDecay.slice(0, 6).map((n) => (
                  <div key={n.id} className="space-y-2">
                    <NarrativeCard narrative={n} onViewDetails={() => {}} />
                    <DecayGauge value={n.weight} max={10} label={n.name} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <ReplayPanel
          companyId={id}
          windowStart={start}
          windowEnd={end}
          eventCount={displayEvents.length}
        />

        {/* Narrative events table with immutable indicators, provenance links, and raw payload status */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Narrative events
            </CardTitle>
            <CardDescription>
              Underlying events with authority weight and credibility proxy. Immutable indicators, provenance links, and raw payload archiving status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : displayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                No narrative events in this window. Try a wider time range or different filters.
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {(displayEvents ?? []).map((ev: NarrativeEvent) => {
                  const eventId = ev.event_id ?? ""
                  const speakerEntity = ev.speaker?.entity ?? "—"
                  const eventForCard: NarrativeEvent = {
                    event_id: eventId,
                    company_id: ev.company_id ?? "",
                    source: ev.source ?? (ev as { source_platform?: string }).source_platform ?? "—",
                    platform: ev.platform,
                    speaker: { entity: speakerEntity },
                    raw_text: ev.raw_text ?? "",
                    published_at: ev.published_at ?? (ev as { created_at?: string }).created_at ?? "",
                    ingested_at: ev.ingested_at ?? (ev as { created_at?: string }).created_at ?? "",
                    created_at: (ev as { created_at?: string }).created_at ?? "",
                    authority_score: ev.authority_score ?? (ev as { authority_weight?: number }).authority_weight ?? 0,
                    credibility_proxy: (ev as { credibility_proxy?: number }).credibility_proxy ?? 0,
                    narrative_topic_ids: Array.isArray(ev.narrative_topic_ids) ? ev.narrative_topic_ids : [],
                  }
                  return (
                    <li key={eventId}>
                      <NarrativeEventCard
                        event={eventForCard}
                        eventId={eventId}
                        hasPayload={!!(ev as { source_payload_id?: string }).source_payload_id || true}
                        isImmutable
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Raw payload evidence */}
        <RawPayloadPanel companyId={id} payloadRefs={payloadRefs} />
      </div>

      <SandboxModal
        open={sandboxOpen}
        onOpenChange={setSandboxOpen}
        companyId={id}
        timeWindowStart={`${start}T00:00:00.000Z`}
        timeWindowEnd={`${end}T23:59:59.999Z`}
        onRun={handleSandboxRun}
      />
    </AnimatedPage>
  )
}
