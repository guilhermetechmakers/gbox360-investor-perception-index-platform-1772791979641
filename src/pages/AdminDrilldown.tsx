import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedPage } from "@/components/AnimatedPage"
import { DataAccessGuard } from "@/components/admin/DataAccessGuard"
import { useDrilldown, usePresignedUrl } from "@/hooks/useArchive"
import { ArrowLeft, FileText, Link2, Shield, Copy, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { PresignedUrlPanel } from "@/components/admin/PresignedUrlPanel"
import { useState } from "react"

export default function AdminDrilldown() {
  const { eventId } = useParams<{ eventId: string }>()
  const id = eventId ?? ""
  const { data, isLoading, error } = useDrilldown(id)
  const presignedMutation = usePresignedUrl()
  const [presignedPanelOpen, setPresignedPanelOpen] = useState(false)
  const [presignedS3Key, setPresignedS3Key] = useState<string | null>(null)
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null)
  const [presignedExpiresAt, setPresignedExpiresAt] = useState<string | null>(null)

  const event = data?.event ?? null
  const archiveIndex = data?.archiveIndex ?? null
  const snippet = data?.rawPayloadSnippet ?? null

  const handleGetPresignedUrl = () => {
    const s3Key = archiveIndex?.s3_key ?? event?.id
    if (!s3Key) return
    setPresignedS3Key(s3Key)
    presignedMutation.mutate(
      { s3Key, expiresSeconds: 3600 },
      {
        onSuccess: (res) => {
          if (res?.url) {
            setPresignedUrl(res.url)
            setPresignedExpiresAt(res.expiresAt ?? null)
            setPresignedPanelOpen(true)
          }
        },
      }
    )
  }

  return (
    <DataAccessGuard permission="audit_logs">
      <AnimatedPage>
        <div className="mx-auto max-w-[1000px] space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Audit Logs
              </Button>
            </Link>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Event drill-down
            </h1>
          </div>

          {!id && (
            <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
              <CardContent className="p-6">
                <p className="text-muted-foreground">No event ID provided.</p>
              </CardContent>
            </Card>
          )}

          {isLoading && id && (
            <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          )}

          {error && id && (
            <Card className="rounded-[1.25rem] border border-destructive/50 shadow-card">
              <CardContent className="p-6">
                <p className="text-destructive">Failed to load event.</p>
              </CardContent>
            </Card>
          )}

          {event && id && !isLoading && (
            <>
              <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <FileText className="h-5 w-5 text-primary" />
                    Narrative event
                  </CardTitle>
                  <CardDescription>
                    Immutable event with source, speaker, audience, and provenance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Event ID</p>
                    <p className="font-mono text-sm break-all">{event.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Source</p>
                    <p className="text-sm">{event.source ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Platform</p>
                    <p className="text-sm">{event.platform ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Speaker</p>
                    <p className="text-sm">{event.speaker_entity ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Speaker role (heuristic)</p>
                    <p className="text-sm">{event.speaker_role_heuristic ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Audience class</p>
                    <p className="text-sm">{event.audience_class ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {event.created_at ? format(new Date(event.created_at), "PPp") : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Archived at</p>
                    <p className="text-sm">
                      {event.archived_at ? format(new Date(event.archived_at), "PPp") : "—"}
                    </p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Checksum</p>
                    <p className="font-mono text-xs break-all text-muted-foreground">
                      {event.checksum || "—"}
                    </p>
                  </div>
                  {event.raw_text && (
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Raw text (snippet)</p>
                      <p className="text-sm line-clamp-4">{event.raw_text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {snippet && (
                <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Raw payload snippet</CardTitle>
                    <CardDescription>Preview of archived payload for audit.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs whitespace-pre-wrap break-words">
                      {typeof snippet === "string" ? snippet : JSON.stringify(snippet, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {event.provenance && Object.keys(event.provenance).length > 0 && (
                <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Shield className="h-5 w-5 text-primary" />
                      Provenance
                    </CardTitle>
                    <CardDescription>Source and lineage metadata.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
                      {JSON.stringify(event.provenance, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Link2 className="h-5 w-5 text-primary" />
                    Presigned URL
                  </CardTitle>
                  <CardDescription>
                    Generate a temporary read-only URL to access the full raw payload in object storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <Button
                    onClick={handleGetPresignedUrl}
                    disabled={presignedMutation.isPending || !archiveIndex?.s3_key}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {presignedMutation.isPending ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Generate presigned URL
                      </>
                    )}
                  </Button>
                  {archiveIndex?.s3_key && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">S3 key:</span>
                      <code className="max-w-[240px] truncate rounded bg-muted px-2 py-1 text-xs">
                        {archiveIndex.s3_key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(archiveIndex.s3_key)
                          // toast from sonner if available
                        }}
                        aria-label="Copy S3 key"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Link to={`/admin/data-replay?eventId=${encodeURIComponent(id)}`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Replay this event
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <PresignedUrlPanel
          open={presignedPanelOpen}
          onOpenChange={(open) => {
            setPresignedPanelOpen(open)
            if (!open) {
              setPresignedUrl(null)
              setPresignedExpiresAt(null)
            }
          }}
          s3Key={presignedS3Key}
          url={presignedUrl ?? undefined}
          expiresAt={presignedExpiresAt ?? undefined}
          isLoading={presignedMutation.isPending}
        />
      </AnimatedPage>
    </DataAccessGuard>
  )
}
