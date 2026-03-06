import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedPage } from "@/components/AnimatedPage"
import { useNarrativeById } from "@/hooks/useIPI"
import { fetchPayloadDownloadUrl } from "@/hooks/useExplainability"
import { Download, ArrowLeft, BarChart2, Shield } from "lucide-react"

export default function PayloadViewer() {
  const { eventId } = useParams<{ eventId: string }>()
  const id = eventId ?? null
  const { data: narrative, isLoading, error } = useNarrativeById(id)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!id) return
    setDownloading(true)
    try {
      const url = await fetchPayloadDownloadUrl(id)
      if (url) {
        const a = document.createElement("a")
        a.href = url
        a.download = `payload-${id}.json`
        a.click()
      } else if (narrative?.raw_payload != null) {
        const blob = new Blob([JSON.stringify(narrative.raw_payload, null, 2)], {
          type: "application/json",
        })
        const u = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = u
        a.download = `payload-${id}.json`
        a.click()
        URL.revokeObjectURL(u)
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/companies">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-semibold">
            Narrative event {id ? `: ${id}` : ""}
          </h1>
        </div>

        {isLoading && (
          <Card className="rounded-2xl shadow-card">
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="rounded-2xl border-destructive/50 shadow-card">
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load narrative.</p>
            </CardContent>
          </Card>
        )}

        {!id && !isLoading && (
          <Card className="rounded-2xl shadow-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground">No event ID provided.</p>
            </CardContent>
          </Card>
        )}

        {narrative && id && (
          <>
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle>Computed fields (explainability)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Authority weight and credibility proxy used in IPI calculation.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Authority weight</p>
                    <p className="text-xl font-semibold text-primary">
                      {((narrative.authority_weight ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Credibility proxy</p>
                    <p className="text-xl font-semibold text-secondary">
                      {((narrative.credibility_proxy ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle>Event details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Source, speaker, and timestamps. Raw payload preserved for audit.
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Source:</span>{" "}
                  {narrative.source_platform ?? "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Speaker:</span>{" "}
                  {narrative.speaker_entity ?? "—"}
                  {narrative.speaker_role ? ` (${narrative.speaker_role})` : ""}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">Created:</span>{" "}
                  {narrative.created_at
                    ? new Date(narrative.created_at).toLocaleString()
                    : "—"}
                </p>
                {narrative.raw_text && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground">Raw text</p>
                    <p className="mt-1 text-sm">{narrative.raw_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {narrative.classification_rationale && (
              <Card className="rounded-2xl shadow-card">
                <CardHeader>
                  <CardTitle>Classification rationale</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Why this event was assigned to its narrative topic (rules and/or embedding proximity).
                  </p>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
                    {JSON.stringify(narrative.classification_rationale, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle>Raw payload (audit)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Archived payload JSON. No destructive transforms applied.
                </p>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
                  {JSON.stringify(
                    narrative.raw_payload ?? {
                      id: narrative.id,
                      source_platform: narrative.source_platform,
                      speaker_entity: narrative.speaker_entity,
                      authority_weight: narrative.authority_weight,
                      credibility_proxy: narrative.credibility_proxy,
                      created_at: narrative.created_at,
                      message: "Full raw_payload not stored.",
                    },
                    null,
                    2
                  )}
                </pre>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={handleDownload}
                  disabled={downloading}
                  aria-label="Download raw payload"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "Preparing…" : "Download"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AnimatedPage>
  )
}
