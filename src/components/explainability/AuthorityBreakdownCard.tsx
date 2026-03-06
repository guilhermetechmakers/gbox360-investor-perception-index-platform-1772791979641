/**
 * Authority breakdown: stacked or segmented visualization.
 * Cards with 16–20px radius, soft shadows; neutral palette with teal/green accents.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Shield } from "lucide-react"
import type { AuthoritySource } from "@/types/explainability"

const COLORS = [
  "rgb(var(--primary))",
  "rgb(var(--secondary))",
  "rgb(var(--muted-foreground))",
]

export interface AuthorityBreakdownCardProps {
  sources: AuthoritySource[]
  isLoading?: boolean
  className?: string
}

export function AuthorityBreakdownCard({
  sources,
  isLoading = false,
  className,
}: AuthorityBreakdownCardProps) {
  const items = Array.isArray(sources) ? sources : []
  const chartData = items.map((s) => ({
    name: s?.name ?? "—",
    weight: typeof s?.weight === "number" ? s.weight : 0,
  }))

  return (
    <Card className={className ?? "rounded-[1.25rem] shadow-card"} aria-labelledby="authority-breakdown-title">
      <CardHeader>
        <CardTitle id="authority-breakdown-title" className="flex items-center gap-2 font-display text-lg">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          Authority source breakdown
        </CardTitle>
        <CardDescription>
          Static weights with dynamic context. Contributes to narrative and credibility scoring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" aria-busy="true" />
        ) : chartData.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No authority breakdown data for this window.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(v: number) => [`${Number(v).toFixed(1)}%`, "Weight"]} />
              <Bar dataKey="weight" name="Weight" radius={[0, 4, 4, 0]}>
                {(chartData ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
