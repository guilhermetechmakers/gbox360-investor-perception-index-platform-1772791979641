import { useParams, Link, useSearchParams } from "react-router-dom"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useTopNarratives,
  useIPIEvents,
  useIPICalculateQuery,
  useNarrativesByRange,
} from "@/hooks/useIPI"
import { useNarrativesWithDecay } from "@/hooks/useNarratives"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  CompanyViewIPISection,
  TopNarrativesList,
  NarrativeEventTimeline,
  DrillDownExplainabilityPanel,
  ExportButton,
  AuditBadge,
  SearchBar,
} from "@/components/company-view"
import { CompanyTimeWindowSelect } from "@/components/dashboard/CompanyTimeWindowSelect"
import { DateRangePicker, IPIBreakdownPanel, SandboxModal } from "@/components/ipi"
import { NarrativeCard, DecayGauge, DrillDownPanel } from "@/components/narrative"
import { windowToDateRange } from "@/lib/date-utils"
import { mapEventsToViewList, mapNarrativesToViewList } from "@/lib/company-view-mappers"
import { ipiApi } from "@/api/ipi"
import type { NarrativeEventView, NarrativeSummaryView } from "@/types/company-view"
import type { NarrativeWithDecay } from "@/types/narrative"
import { Beaker } from "lucide-react"

const VALID_WINDOWS = ["1D", "1W", "2W", "30d", "90d", "1M", "3M"]
function normalizeWindow(w: string): string {
  return VALID_WINDOWS.includes(w) ? w : "1W"
}

export default function CompanyView() {
  const { companyId } = useParams<{ companyId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const id = companyId ?? ""
  const windowParam = searchParams.get("window") ?? "1W"
  const validWindow = normalizeWindow(windowParam)

  const { start: defaultStart, end: defaultEnd } = useMemo(
    () => windowToDateRange(validWindow),
    [validWindow]
  )
  const [dateStart, setDateStart] = useState(defaultStart)
  const [dateEnd, setDateEnd] = useState(defaultEnd)
  const [sandboxOpen, setSandboxOpen] = useState(false)
  const [drillDownNarrative, setDrillDownNarrative] = useState<NarrativeWithDecay | null>(null)

  const { data: company, isLoading: companyLoading } = useCompanyDetail(id)
  const { data: narrativesData, isLoading: narrativesLoading } = useTopNarratives(id, validWindow, 3)
  const { data: narrativesWithDecayData, isLoading: narrativesWithDecayLoading } = useNarrativesWithDecay(
    id,
    dateStart,
    dateEnd
  )
  const { data: eventsData, isLoading: eventsLoading } = useIPIEvents(id, validWindow)
  const { data: narrativesByRangeData } = useNarrativesByRange(id, dateStart, dateEnd)
  const narrativesByRange = Array.isArray(narrativesByRangeData) ? narrativesByRangeData : []

  const { data: calculateQueryData, isLoading: calculateQueryLoading } = useIPICalculateQuery(
    id,
    dateStart,
    dateEnd
  )
  const calculateResult = calculateQueryData ?? null

  const narrativesWithDecayList: NarrativeWithDecay[] = Array.isArray(narrativesWithDecayData)
    ? narrativesWithDecayData
    : []

  const narratives = Array.isArray(narrativesData) ? narrativesData : []
  const topNarrativesDecay = narrativesWithDecayList.slice(0, 3)

  const narrativeSummariesForView: NarrativeSummaryView[] = useMemo(() => {
    if (narrativesWithDecayList.length > 0) return mapNarrativesToViewList(narrativesWithDecayList)
    return mapNarrativesToViewList(narratives)
  }, [narrativesWithDecayList, narratives])

  const eventsForTimeline: NarrativeEventView[] = useMemo(() => {
    if (narrativesByRange.length > 0) {
      return narrativesByRange.map((n: unknown) => {
        const x = n as Record<string, unknown>
        return {
          id: String(x?.event_id ?? x?.id ?? ""),
          companyId: String(x?.company_id ?? ""),
          source: String(x?.source ?? x?.source_platform ?? "—"),
          platform: x?.platform as string | undefined,
          speaker: {
            name: String(x?.speaker_entity ?? (x?.speaker as { entity?: string })?.entity ?? "—"),
            role: String((x?.speaker_role ?? (x?.speaker as { inferred_role?: string })?.inferred_role) ?? ""),
          },
          text: String(x?.raw_text ?? ""),
          timestamp: String(x?.published_at ?? x?.created_at ?? new Date().toISOString()),
          amplitude: Number(x?.authority_weight ?? x?.authority_score ?? 0) || Number(x?.credibility_proxy ?? 0) || undefined,
          whyIncluded: "Included based on narrative relevance and authority/credibility weighting.",
        } as NarrativeEventView
      })
    }
    return mapEventsToViewList(eventsData ?? [])
  }, [narrativesByRange, eventsData])

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold">
                {company.name} ({company.ticker})
              </h1>
              <SearchBar
                placeholder="Switch company…"
                navigateOnSelect={true}
              />
            </div>
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
              <AuditBadge
                lastIngestionTime={(company as { lastIngestAt?: string }).lastIngestAt}
                hasRawPayload
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/company/${id}/drill-down?window=${validWindow}`}>
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                Why did this move?
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setSandboxOpen(true)}
              className="gap-2"
            >
              <Beaker className="h-4 w-4" />
              Sandbox
            </Button>
            <ExportButton companyId={id} timeWindow={validWindow} />
          </div>
        </div>

        <CompanyViewIPISection companyId={id} timeWindow={validWindow} />

        <IPIBreakdownPanel
          result={calculateResult ?? null}
          isLoading={calculateQueryLoading}
        />

        <DrillDownExplainabilityPanel companyId={id} timeWindow={validWindow} />

        {/* Decay-weighted narrative score */}
        {topNarrativesDecay.length > 0 && (
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle>Narrative decay-weighted score</CardTitle>
              <CardDescription>
                Current narrative presence with time decay. Higher = more recent/stronger signal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DecayGauge
                value={topNarrativesDecay.reduce((a, n) => a + (Number(n.weight) ?? 0), 0) / Math.max(1, topNarrativesDecay.length)}
                max={1}
                label="Aggregate narrative weight"
              />
            </CardContent>
          </Card>
        )}

        {/* Top 3 contributing narratives */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Top contributing narratives</CardTitle>
            <CardDescription>
              Why did this move? Click to drill down into underlying events and classification rationale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(narrativesLoading || narrativesWithDecayLoading) ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <TopNarrativesList narratives={narrativeSummariesForView} />
                {narrativeSummariesForView.length === 0 && topNarrativesDecay.length > 0 && (
                  <ul className="space-y-4 mt-4">
                    {topNarrativesDecay.map((n) => (
                      <li key={n.id}>
                        <NarrativeCard
                          narrative={n}
                          onViewDetails={() => setDrillDownNarrative(n)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline / Events */}
        <NarrativeEventTimeline
          events={eventsForTimeline}
          isLoading={eventsLoading}
          companyId={id}
        />
      </div>

      <SandboxModal
        open={sandboxOpen}
        onOpenChange={setSandboxOpen}
        companyId={id}
        timeWindowStart={`${dateStart}T00:00:00.000Z`}
        timeWindowEnd={`${dateEnd}T23:59:59.999Z`}
        onRun={handleSandboxRun}
      />

      <DrillDownPanel
        open={!!drillDownNarrative}
        onOpenChange={(open) => !open && setDrillDownNarrative(null)}
        narrative={drillDownNarrative}
        companyId={id}
        start={dateStart}
        end={dateEnd}
      />
    </AnimatedPage>
  )
}
