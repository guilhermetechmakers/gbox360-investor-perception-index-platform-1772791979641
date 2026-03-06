import { useParams, Link, useSearchParams } from "react-router-dom"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useIPIEvents,
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
import { Play, Pause, SkipForward, Beaker } from "lucide-react"
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
        { name: "Narrative", value: ipi.narrative_component, fill: "rgb(var(--primary))" },
        { name: "Credibility", value: ipi.credibility_component, fill: "rgb(var(--secondary))" },
        { name: "Risk", value: ipi.risk_component, fill: "rgb(var(--muted-foreground))" },
      ]
    : []

  const eventsList = Array.isArray(events) ? events : []

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
              {eventsList.length} events in window. Replay is available from Admin → Data Replay.
            </p>
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
