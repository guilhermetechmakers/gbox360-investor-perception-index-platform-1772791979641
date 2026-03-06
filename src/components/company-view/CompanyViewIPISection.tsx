/**
 * CompanyViewIPISection — IPI Card, delta indicator, sparkline.
 * Guards all arrays with (data ?? []) and Array.isArray checks.
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useIPICurrent, useIPITimeseries, useIPICalculateQuery } from "@/hooks/useIPI"
import { windowToDateRange } from "@/lib/date-utils"
import { IPIBadge } from "@/components/ipi"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { IPIResult, SparklinePoint } from "@/types/company-view"

export interface CompanyViewIPISectionProps {
  companyId: string
  timeWindow: string
}

const VALID_WINDOWS = ["1D", "1W", "2W", "30d", "90d", "1M"]
function normalizeWindow(w: string): string {
  return VALID_WINDOWS.includes(w) ? w : "1W"
}

export function CompanyViewIPISection({
  companyId,
  timeWindow,
}: CompanyViewIPISectionProps) {
  const windowNorm = normalizeWindow(timeWindow)
  const { start, end } = useMemo(
    () => windowToDateRange(windowNorm),
    [windowNorm]
  )

  const { data: ipiData, isLoading: ipiLoading } = useIPICurrent(
    companyId,
    windowNorm
  )
  const { data: timeseriesData } = useIPITimeseries(companyId, windowNorm)
  const { data: calculateData } = useIPICalculateQuery(
    companyId,
    start,
    end
  )

  const currentIpi: IPIResult | null = useMemo(() => {
    if (!ipiData) return null
    const score =
      calculateData?.totalScore ?? ipiData.score ?? 0
    const delta = ipiData.delta ?? 0
    const direction: "up" | "down" | "flat" =
      delta > 0 ? "up" : delta < 0 ? "down" : "flat"
    return {
      score,
      delta,
      direction,
      window: windowNorm,
      timestamp: ipiData.computed_at ?? ipiData.window_end,
    }
  }, [ipiData, calculateData, windowNorm])

  const sparklinePoints: SparklinePoint[] = useMemo(() => {
    const raw = timeseriesData ?? []
    if (!Array.isArray(raw)) return []
    return (raw as Array<{ timestamp?: string; score?: number }>).map(
      (p) => ({
        timestamp: p?.timestamp ?? "",
        score: Number(p?.score ?? 0),
      })
    )
  }, [timeseriesData])

  if (ipiLoading) {
    return (
      <Card className="rounded-[18px] shadow-card">
        <CardHeader>
          <CardTitle>Investor Perception Index</CardTitle>
          <CardDescription>0–100 scale.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[18px] shadow-card">
      <CardHeader>
        <CardTitle>Investor Perception Index</CardTitle>
        <CardDescription>
          0–100 scale. Provisional weights: Narrative 40%, Credibility 40%, Risk 20%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentIpi ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <IPIBadge
                score={currentIpi.score}
                delta={currentIpi.delta}
                maxScore={100}
                size="lg"
                showDelta
              />
              <div className="text-sm text-muted-foreground">
                Narrative {(calculateData?.narrativeScore ?? ipiData?.narrative_component)?.toFixed(1) ?? "—"} · Credibility{" "}
                {(calculateData?.credibilityScore ?? ipiData?.credibility_component)?.toFixed(1) ?? "—"} · Risk{" "}
                {(calculateData?.riskScore ?? ipiData?.risk_component)?.toFixed(1) ?? "—"}
              </div>
            </div>
            {Array.isArray(sparklinePoints) && sparklinePoints.length > 0 && (
              <div className="h-16 w-full min-w-[200px] max-w-[280px] sm:h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sparklinePoints}
                    margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="ipiSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="timestamp"
                      hide
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      content={({ payload }) =>
                        payload?.[0] ? (
                          <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card">
                            {new Date(
                              (payload[0].payload as SparklinePoint).timestamp
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            : {(payload[0].value as number)?.toFixed(1)} IPI
                          </div>
                        ) : null
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="rgb(var(--primary))"
                      strokeWidth={2}
                      fill="url(#ipiSparklineGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No IPI data for this window.</p>
        )}
      </CardContent>
    </Card>
  )
}
