import { useParams, Link, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useTopNarratives,
  useIPIEvents,
} from "@/hooks/useIPI"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { CompanyTimeWindowSelect } from "@/components/dashboard/CompanyTimeWindowSelect"
import { useModals } from "@/components/modals"
import { ipiApi } from "@/api/ipi"
import { ArrowDownRight, ArrowUpRight, Download, Flag, FileJson } from "lucide-react"

export default function CompanyView() {
  const { companyId } = useParams<{ companyId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const modals = useModals()
  const id = companyId ?? ""
  const windowParam = searchParams.get("window") ?? "1W"
  const validWindow = ["1D", "1W", "2W", "1M"].includes(windowParam) ? windowParam : "1W"

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

  const narratives = Array.isArray(narrativesData) ? narrativesData : []
  const events = Array.isArray(eventsData) ? eventsData : []

  const handleWindowChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("window", value)
      return next
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
            <div className="mt-1 flex items-center gap-2">
              <CompanyTimeWindowSelect
                value={validWindow}
                onChange={handleWindowChange}
              />
              <span className="text-sm text-muted-foreground">time window</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/company/${id}/drill-down?window=${validWindow}`}>
              <Button variant="outline">Why did this move?</Button>
            </Link>
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
        <Card>
          <CardHeader>
            <CardTitle>Investor Perception Index</CardTitle>
            <CardDescription>0–100 scale. Provisional weights: Narrative 40%, Credibility 40%, Risk 20%.</CardDescription>
          </CardHeader>
          <CardContent>
            {ipiLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : ipi ? (
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-foreground">{ipi.score}</span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                <div className="flex items-center gap-1 text-lg">
                  {ipi.delta >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                  <span className={ipi.delta >= 0 ? "text-green-600" : "text-red-600"}>
                    {ipi.delta >= 0 ? "+" : ""}{ipi.delta}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Narrative {ipi.narrative_component?.toFixed(1)} · Credibility {ipi.credibility_component?.toFixed(1)} · Risk {ipi.risk_component?.toFixed(1)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No IPI data for this window.</p>
            )}
          </CardContent>
        </Card>

        {/* Top 3 narratives */}
        <Card>
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
                    <Card className="border-l-4 border-l-primary">
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
        <Card>
          <CardHeader>
            <CardTitle>Event timeline</CardTitle>
            <CardDescription>NarrativeEvents with provenance. View raw payload for audit.</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : events.length > 0 ? (
              <div className="space-y-2">
                {events.slice(0, 10).map((ev) => (
                  <Card key={ev.event_id} className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{ev.raw_text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ev.source} · {ev.speaker?.entity} · {new Date(ev.published_at).toLocaleDateString()}
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
    </AnimatedPage>
  )
}
