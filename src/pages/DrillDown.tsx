import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useIPICurrent,
  useIPISimulate,
  useIPIEvents,
} from "@/hooks/useIPI"
import { useCompany as useCompanyDetail } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
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
import { Play, Pause, SkipForward } from "lucide-react"

const WINDOW = "1W"

export default function DrillDown() {
  const { companyId } = useParams<{ companyId: string }>()
  const id = companyId ?? ""

  const { data: company } = useCompanyDetail(id)
  const { data: ipi, isLoading: ipiLoading } = useIPICurrent(id, WINDOW)
  const { data: events } = useIPIEvents(id, WINDOW)
  const simulate = useIPISimulate()

  const [weights, setWeights] = useState({
    narrative: 40,
    credibility: 40,
    risk: 20,
  })
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null)

  const handleSimulate = () => {
    if (!id) return
    simulate.mutate(
      {
        company_id: id,
        window_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        window_end: new Date().toISOString(),
        weights: {
          narrative: weights.narrative / 100,
          credibility: weights.credibility / 100,
          risk: weights.risk / 100,
        },
      },
      {
        onSuccess: (data) => setSimulatedScore(data.score),
      }
    )
  }

  const decompositionData = ipi
    ? [
        { name: "Narrative", value: ipi.narrative_component, fill: "rgb(var(--primary))" },
        { name: "Credibility", value: ipi.credibility_component, fill: "rgb(var(--secondary))" },
        { name: "Risk", value: ipi.risk_component, fill: "rgb(var(--muted-foreground))" },
      ]
    : []

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/company/${id}`}>
            <Button variant="ghost">← Back to company</Button>
          </Link>
          <h1 className="font-display text-2xl font-semibold">
            Why did this move? — {company?.name ?? "…"}
          </h1>
        </div>

        {/* Numeric decomposition */}
        <Card>
          <CardHeader>
            <CardTitle>IPI decomposition</CardTitle>
            <CardDescription>Narrative, Credibility, and Risk components.</CardDescription>
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

        {/* Weights sandbox */}
        <Card>
          <CardHeader>
            <CardTitle>Weights sandbox</CardTitle>
            <CardDescription>Adjust provisional weights and simulate IPI. Changes are logged for audit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Narrative %</Label>
                <Slider
                  value={[weights.narrative]}
                  onValueChange={([v]) => setWeights((w) => ({ ...w, narrative: v }))}
                  max={100}
                  step={5}
                />
                <p className="text-sm text-muted-foreground">{weights.narrative}%</p>
              </div>
              <div className="space-y-2">
                <Label>Credibility %</Label>
                <Slider
                  value={[weights.credibility]}
                  onValueChange={([v]) => setWeights((w) => ({ ...w, credibility: v }))}
                  max={100}
                  step={5}
                />
                <p className="text-sm text-muted-foreground">{weights.credibility}%</p>
              </div>
              <div className="space-y-2">
                <Label>Risk %</Label>
                <Slider
                  value={[weights.risk]}
                  onValueChange={([v]) => setWeights((w) => ({ ...w, risk: v }))}
                  max={100}
                  step={5}
                />
                <p className="text-sm text-muted-foreground">{weights.risk}%</p>
              </div>
            </div>
            <Button onClick={handleSimulate} disabled={simulate.isPending}>
              {simulate.isPending ? "Simulating…" : "Simulate IPI"}
            </Button>
            {simulatedScore !== null && (
              <p className="text-sm text-muted-foreground">
                Simulated IPI with custom weights: <strong>{simulatedScore.toFixed(1)}</strong>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Replay controls */}
        <Card>
          <CardHeader>
            <CardTitle>Replay controls</CardTitle>
            <CardDescription>Step through events (play / pause / step). Dry-run and execute from Admin.</CardDescription>
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
              {events?.length ?? 0} events in window. Replay is available from Admin → Data Replay.
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
