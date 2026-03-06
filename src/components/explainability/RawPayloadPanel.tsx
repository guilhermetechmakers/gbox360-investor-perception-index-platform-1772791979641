/**
 * Raw payload evidence panel: presigned URL viewer, download, search.
 * Design: 16–20px radius, soft shadow; teal/green focus rings.
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { FileJson, Download, ExternalLink, Search } from "lucide-react"
import { fetchPayloadDownloadUrl } from "@/hooks/useExplainability"
import { usePayloadSearch } from "@/hooks/useExplainability"
import { cn } from "@/lib/utils"

export interface RawPayloadPanelProps {
  companyId: string
  payloadRefs: Array<{ id: string; eventId?: string; label?: string }>
  className?: string
}

export function RawPayloadPanel({
  companyId,
  payloadRefs,
  className,
}: RawPayloadPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEnabled, setSearchEnabled] = useState(false)
  const refs = Array.isArray(payloadRefs) ? payloadRefs : []

  const { payloads: searchPayloads, isLoading: searchLoading } = usePayloadSearch(
    searchQuery,
    companyId,
    searchEnabled
  )

  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleView = async (payloadId: string) => {
    setLoadingId(payloadId)
    try {
      const url = await fetchPayloadDownloadUrl(payloadId)
      if (url) window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setLoadingId(null)
    }
  }

  const handleDownload = async (payloadId: string) => {
    setLoadingId(payloadId)
    try {
      const url = await fetchPayloadDownloadUrl(payloadId)
      if (url) {
        const a = document.createElement("a")
        a.href = url
        a.download = `payload-${payloadId}.json`
        a.click()
      }
    } finally {
      setLoadingId(null)
    }
  }

  const displayRefs = searchQuery.trim() && searchEnabled && searchPayloads.length > 0
    ? searchPayloads.map((p) => ({ id: p.id, eventId: p.payloadRef, label: p.s3Key ?? p.payloadRef }))
    : refs

  return (
    <Card className={cn("rounded-[1.25rem] shadow-card", className)} aria-labelledby="raw-payload-title">
      <CardHeader>
        <CardTitle id="raw-payload-title" className="flex items-center gap-2 font-display text-lg">
          <FileJson className="h-5 w-5 text-primary" aria-hidden />
          Raw payload evidence
        </CardTitle>
        <CardDescription>
          Presigned URL access for audit. View or download raw payloads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search within payloads…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchEnabled(true)}
              className="pl-9 focus-visible:ring-primary"
              aria-label="Search payloads"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchEnabled(true)}
            className="gap-1"
          >
            Search
          </Button>
        </div>

        {searchEnabled && searchQuery.trim() && searchLoading && (
          <Skeleton className="h-20 w-full" />
        )}

        {refs.length === 0 && !searchEnabled ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No payload references in this window. Underlying events may not have raw payloads stored.
          </p>
        ) : displayRefs.length === 0 && (searchQuery.trim() || searchEnabled) ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No payloads match your search.
          </p>
        ) : (
          <ul className="space-y-2" role="list">
            {(displayRefs ?? []).map((ref) => {
              const id = ref?.id ?? ref?.eventId ?? ""
              const label = ref?.label ?? id
              const loading = loadingId === id
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3 transition-shadow hover:shadow-md"
                >
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground" title={label}>
                    {label}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary hover:bg-primary/10"
                      onClick={() => handleView(id)}
                      disabled={loading}
                      aria-label={`View payload ${id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary hover:bg-primary/10"
                      onClick={() => handleDownload(id)}
                      disabled={loading}
                      aria-label={`Download payload ${id}`}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
