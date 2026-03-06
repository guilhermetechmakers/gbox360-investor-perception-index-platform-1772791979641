import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PreflightResult, DryRunResult } from "@/types/admin"

interface DryRunLogProps {
  result: PreflightResult | DryRunResult | null | undefined
  className?: string
}

export function DryRunLog({ result, className }: DryRunLogProps) {
  if (!result) return null

  const batches = (result as PreflightResult).batchEstimates ?? []
  const eventCount = (result as PreflightResult).estimatedEventCount ?? (result as DryRunResult).estimatedEventCount ?? 0
  const summary = (result as DryRunResult).summary
  const res = (result as PreflightResult).estimatedResources ?? (result as DryRunResult).estimatedResources

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Dry-run results</CardTitle>
        <CardDescription>
          Estimated events, resources, and per-batch breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Estimated events</p>
          <p className="font-display text-2xl font-semibold">{eventCount.toLocaleString()}</p>
        </div>
        {res && (
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">CPU</p>
              <p className="font-semibold">{res.cpuCores ?? 0} cores</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Memory</p>
              <p className="font-semibold">{res.memoryMB ?? 0} MB</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Network I/O</p>
              <p className="font-semibold">{res.networkIoMB ?? 0} MB</p>
            </div>
          </div>
        )}
        {summary && (
          <p className="text-sm text-muted-foreground">{summary}</p>
        )}
        {Array.isArray(batches) && batches.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Per-batch estimates</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="grid" aria-label="Batch estimates">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left font-medium">Batch</th>
                    <th className="p-2 text-right font-medium">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {(batches ?? []).map((b) => (
                    <tr key={b.batchIndex} className="border-b border-border">
                      <td className="p-2">{b.batchIndex + 1}</td>
                      <td className="p-2 text-right">{b.eventCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
