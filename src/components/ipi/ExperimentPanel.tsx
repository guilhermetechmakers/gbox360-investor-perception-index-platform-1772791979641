/**
 * Inline experiment panel: adjust Narrative / Credibility / Risk weights and see hypothetical IPI.
 * Null-safe; uses drilldownApi.simulate or ipiApi.calculate for live feedback.
 */
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Beaker } from "lucide-react"
import { cn } from "@/lib/utils"
import { drilldownApi } from "@/api/drilldown"
import { ipiApi } from "@/api/ipi"

interface ExperimentPanelProps {
  companyId: string
  windowStart: string
  windowEnd: string
  className?: string
}

export function ExperimentPanel({
  companyId,
  windowStart,
  windowEnd,
  className,
}: ExperimentPanelProps) {
  const [weights, setWeights] = useState({ narrative: 40, credibility: 40, risk: 20 })
  const [hypotheticalIPI, setHypotheticalIPI] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const total = weights.narrative + weights.credibility + weights.risk
  const isValid = Math.abs(total - 100) < 2

  const runSimulate = useCallback(async () => {
    if (!companyId || !isValid) return
    const w = {
      narrative: weights.narrative / 100,
      credibility: weights.credibility / 100,
      risk: weights.risk / 100,
    }
    setIsLoading(true)
    try {
      const res = await drilldownApi.simulate({
        companyId,
        windowStart,
        windowEnd,
        weights: w,
      })
      setHypotheticalIPI(
        typeof res?.hypotheticalIPI === "number" ? res.hypotheticalIPI : null
      )
    } catch {
      try {
        const result = await ipiApi.calculate({
          companyId,
          timeWindowStart: windowStart,
          timeWindowEnd: windowEnd,
          weights: w,
        })
        setHypotheticalIPI(
          typeof result?.totalScore === "number" ? result.totalScore : null
        )
      } catch {
        setHypotheticalIPI(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [companyId, windowStart, windowEnd, weights, isValid])

  useEffect(() => {
    if (!isValid) {
      setHypotheticalIPI(null)
      return
    }
    const t = setTimeout(runSimulate, 400)
    return () => clearTimeout(t)
  }, [isValid, runSimulate])

  return (
    <Card className={cn("rounded-2xl shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Beaker className="h-5 w-5 text-primary" aria-hidden />
          Experiment: hypothetical IPI
        </CardTitle>
        <CardDescription>
          Adjust provisional weights to see how the IPI would change. Weights must sum to 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm">Narrative %</Label>
            <Slider
              value={[weights.narrative]}
              onValueChange={([v]) =>
                setWeights((w) => ({ ...w, narrative: v ?? 0 }))
              }
              max={100}
              step={5}
              aria-label="Narrative weight percent"
            />
            <p className="text-sm text-muted-foreground">{weights.narrative}%</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Credibility %</Label>
            <Slider
              value={[weights.credibility]}
              onValueChange={([v]) =>
                setWeights((w) => ({ ...w, credibility: v ?? 0 }))
              }
              max={100}
              step={5}
              aria-label="Credibility weight percent"
            />
            <p className="text-sm text-muted-foreground">{weights.credibility}%</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Risk %</Label>
            <Slider
              value={[weights.risk]}
              onValueChange={([v]) =>
                setWeights((w) => ({ ...w, risk: v ?? 0 }))
              }
              max={100}
              step={5}
              aria-label="Risk weight percent"
            />
            <p className="text-sm text-muted-foreground">{weights.risk}%</p>
          </div>
        </div>
        {!isValid && (
          <p className="text-sm text-amber-600" role="alert">
            Weights must sum to 100% (current: {total}%).
          </p>
        )}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            Hypothetical IPI
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : hypotheticalIPI !== null ? (
            <p className="mt-1 font-display text-2xl font-bold text-primary">
              {Number(hypotheticalIPI).toFixed(1)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust weights (sum to 100%) to see result.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
