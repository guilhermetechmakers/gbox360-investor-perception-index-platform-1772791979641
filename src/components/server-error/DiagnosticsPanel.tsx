/**
 * DiagnosticsPanel — Collapsible panel showing non-sensitive diagnostic info.
 * UTC timestamp, route, transient flag. Data guarded with null checks.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export interface DiagnosticsData {
  timestamp?: string
  route?: string
  transientFlag?: boolean
}

interface DiagnosticsPanelProps {
  data?: DiagnosticsData | null
  className?: string
}

function formatTimestamp(ts: string | undefined): string {
  if (!ts || typeof ts !== "string") return "—"
  try {
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? "—" : d.toISOString()
  } catch {
    return "—"
  }
}

export function DiagnosticsPanel({ data, className }: DiagnosticsPanelProps) {
  const safeData = data ?? {}
  const timestamp = formatTimestamp(safeData.timestamp)
  const route = safeData.route ?? (typeof window !== "undefined" ? window.location?.pathname ?? "—" : "—")
  const transientFlag = safeData.transientFlag ?? false

  return (
    <Accordion type="single" collapsible className={cn("w-full", className)}>
      <AccordionItem value="diagnostics" className="border-border">
        <AccordionTrigger
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle diagnostics details"
        >
          Technical details (for support)
        </AccordionTrigger>
        <AccordionContent>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Timestamp (UTC)</dt>
              <dd className="font-mono text-foreground">{timestamp}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Route</dt>
              <dd className="font-mono text-foreground break-all">{route}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Likely transient</dt>
              <dd className="font-mono text-foreground">
                {transientFlag ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
