import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
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
import { cn } from "@/lib/utils"
import type { IPISandboxResult } from "@/types/ipi"
import { Beaker } from "lucide-react"

interface SandboxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  timeWindowStart: string
  timeWindowEnd: string
  onRun: (weights: { narrative: number; credibility: number; risk: number }) => Promise<IPISandboxResult[]>
}

export function SandboxModal({
  open,
  onOpenChange,
  companyId,
  timeWindowStart: _timeWindowStart,
  timeWindowEnd: _timeWindowEnd,
  onRun,
}: SandboxModalProps) {
  void _timeWindowStart
  void _timeWindowEnd
  const [weights, setWeights] = useState({ narrative: 40, credibility: 40, risk: 20 })
  const [results, setResults] = useState<IPISandboxResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRun = async () => {
    if (!companyId) return
    setIsLoading(true)
    try {
      const w = {
        narrative: weights.narrative / 100,
        credibility: weights.credibility / 100,
        risk: weights.risk / 100,
      }
      const res = await onRun(w)
      setResults(Array.isArray(res) ? res : [])
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = results.map((r) => ({
    name: r.scenarioName,
    score: r.totalScore,
    narrative: r.narrativeScore,
    credibility: r.credibilityScore,
    risk: r.riskScore,
  }))

  const total = weights.narrative + weights.credibility + weights.risk
  const isValid = Math.abs(total - 100) < 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            IPI Sandbox
          </DialogTitle>
          <DialogDescription>
            Adjust provisional weights and run simulations. Results are for comparison only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          <Button
            onClick={handleRun}
            disabled={isLoading || !isValid}
            className="w-full"
          >
            {isLoading ? "Running simulations…" : "Run simulations"}
          </Button>

          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : results.length > 0 ? (
            <>
              <div className="space-y-2">
                <h4 className="font-medium">Comparison</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Total" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Scenarios</h4>
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li
                      key={r.scenarioName}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-border p-3",
                        "transition-shadow hover:shadow-md"
                      )}
                    >
                      <span className="font-medium">{r.scenarioName}</span>
                      <span className="text-primary font-semibold">{r.totalScore.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
