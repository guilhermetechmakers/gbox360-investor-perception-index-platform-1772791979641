import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, ExternalLink, Shield } from "lucide-react"
import { toast } from "sonner"

interface PresignedUrlPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  s3Key: string | null
  url: string | undefined
  expiresAt: string | undefined
  isLoading: boolean
}

export function PresignedUrlPanel({
  open,
  onOpenChange,
  s3Key,
  url,
  expiresAt,
  isLoading,
}: PresignedUrlPanelProps) {
  const [fetchedContent, setFetchedContent] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const isMockUrl = typeof url === "string" && url.startsWith("#mock-")

  useEffect(() => {
    if (!open || !url || isMockUrl) {
      setFetchedContent(null)
      setFetchError(null)
      return
    }
    setFetchedContent(null)
    setFetchError(null)
    fetch(url)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((text) => setFetchedContent(text))
      .catch((err) => setFetchError(err?.message ?? "Failed to load"))
  }, [open, url, isMockUrl])

  const handleCopyUrl = () => {
    if (url && !isMockUrl) {
      navigator.clipboard.writeText(url)
      toast.success("URL copied to clipboard")
    }
  }

  const handleCopyContent = () => {
    if (fetchedContent) {
      navigator.clipboard.writeText(fetchedContent)
      toast.success("Content copied")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl" aria-describedby="presigned-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Presigned URL — read-only access
          </DialogTitle>
          {s3Key && (
            <p className="text-sm text-muted-foreground">S3 key: {s3Key}</p>
          )}
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(expiresAt).toLocaleString()}
            </p>
          )}
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : url ? (
          <div className="space-y-4">
            {!isMockUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyUrl} className="gap-1">
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Open in new tab
                  </Button>
                </a>
              </div>
            )}
            {isMockUrl && (
              <p className="text-sm text-muted-foreground">
                Mock mode: no live S3 backend. Use a real archive endpoint to generate presigned URLs.
              </p>
            )}
            {fetchedContent != null && (
              <>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleCopyContent}>
                    Copy content
                  </Button>
                </div>
                <ScrollArea
                  id="presigned-content"
                  className="h-[40vh] w-full rounded-lg border border-border bg-muted/20 p-4"
                  role="region"
                  aria-label="Raw payload content"
                >
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">
                    {fetchedContent}
                  </pre>
                </ScrollArea>
              </>
            )}
            {fetchError && (
              <p className="text-sm text-destructive">Could not load content: {fetchError}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No URL available.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
