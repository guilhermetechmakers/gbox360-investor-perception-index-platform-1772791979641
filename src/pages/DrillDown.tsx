import { useParams, Link, useSearchParams } from "react-router-dom"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useIPIEvents,
  useIPICalculateQuery,
  useNarrativesByRange,
} from "@/hooks/useIPI"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { SandboxModal } from "@/components/ipi"
import { windowToDateRange } from "@/lib/date-utils"
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
import { Play, Pause, SkipForward, Beaker, FileJson, BarChart2 } from "lucide-react"
import { useState } from "react"
import { ipiApi } from "@/api/ipi"

export default function DrillDown() {
  const { companyId } = useParams<{ companyId: string }>()
  const [searchParams] = useSearchParams()
  const [sandboxOpen, setSandboxOpen] = useState(false)
  const id = companyId ?? ""
  const windowParam = searchParams.get("window") ?? "1W"
  const validWindow = ["1D", "1W", "2W", "1M"].includes(windowParam) ? windowParam : "1W"

  const { start, end } = useMemo(() => windowToDateRange(validWindow), [validWindow])

  const { data: company } = useCompanyDetail(id)
  const { data: ipi, isLoading: ipiLoading } = useIPICurrent(id, validWindow)
  const { data: events } = useIPIEvents(id, validWindow)
  const { data: calculateResult } = useIPICalculateQuery(id, start, end)
  const { data: narrativesByRange } = useNarrativesByRange(id, start, end)
  const eventsList = Array.isArray(events) ? events : []
  const narrativesList = Array.isArray(narrativesByRange) ? narrativesByRange : []
  const explanationEvents = narrativesList.length > 0
    ? narrativesList.map((n) => ({
        event_id: "event_id" in n ? (n as { event_id: string }).event_id : (n as { id?: string }).id ?? "",
        raw_text: "raw_text" in n ? (n as { raw_text: string }).raw_text : "",
        source: "source_platform" in n ? (n as { source_platform: string }).source_platform : (n as { source?: string }).source ?? "—",
        speaker: "speaker_entity" in n ? (n as { speaker_entity: string }).speaker_entity : (n as { speaker?: { entity?: string } }).speaker?.entity ?? "—",
        published_at: "created_at" in n ? (n as { created_at: string }).created_at : (n as { published_at?: string }).published_at ?? "",
        authority_weight: "authority_weight" in n ? Number((n as { authority_weight: number }).authority_weight) : 0,
        credibility_proxy: "credibility_proxy" in n ? Number((n as { credibility_proxy: number }).credibility_proxy) : 0,
      }))
    : eventsList.map((ev) => ({
        event_id: ev.event_id,
        raw_text: ev.raw_text ?? "",
        source: ev.source ?? "—",
        speaker: ev.speaker?.entity ?? "—",
        published_at: ev.published_at ?? ev.created_at ?? "",
        authority_weight: Number(ev.authority_weight ?? ev.authority_score ?? 0),
        credibility_proxy: Number(ev.credibility_proxy ?? 0),
      }))

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

        {/* Replay controls */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Replay controls</CardTitle>
            <CardDescription>
              Step through events (play / pause / step). Dry-run and execute from Admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" title="Play">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Pause">
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Step">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {explanationEvents.length} events in window. Replay is available from Admin → Data Replay.
            </p>
          </CardContent>
        </Card>

        {/* Explanation panel: how each narrative contributed to authority_weight and credibility_proxy */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Narrative contribution to IPI
            </CardTitle>
            <CardDescription>
              Underlying events with authority weight and credibility proxy. Links to full narrative payload for audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {explanationEvents.length === 0 ? (
              <p className="text-muted-foreground">No narrative events in this window.</p>
            ) : (
              <ul className="space-y-3">
                {explanationEvents.slice(0, 15).map((ev) => (
                  <li key={ev.event_id}>
                    <Card className="border border-border transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <p className="line-clamp-2 text-sm text-foreground">{ev.raw_text || "—"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{ev.source}</span>
                          <span>{ev.speaker}</span>
                          <span>{ev.published_at ? new Date(ev.published_at).toLocaleDateString() : "—"}</span>
                          <span className="font-medium text-primary">
                            Authority: {(ev.authority_weight * 100).toFixed(0)}%
                          </span>
                          <span className="font-medium text-secondary">
                            Credibility: {(ev.credibility_proxy * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Link
                          to={`/dashboard/payload/${ev.event_id}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileJson className="h-3 w-3" />
                          View full narrative
                        </Link>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
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
