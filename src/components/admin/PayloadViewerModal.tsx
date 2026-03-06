import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CardDescription } from "@/components/ui/card"

interface PayloadViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload: string | object | null
  isLoading: boolean
  /** Optional event ID for provenance display */
  eventId?: string
}

export function PayloadViewerModal({
  open,
  onOpenChange,
  payload,
  isLoading,
  eventId,
}: PayloadViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl" aria-describedby="payload-content">
        <DialogHeader>
          <DialogTitle>Raw Payload</DialogTitle>
          {eventId && (
            <CardDescription>Read-only view. Event ID: {eventId}</CardDescription>
          )}
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-48 w-full" aria-busy="true" />
        ) : payload != null ? (
          <ScrollArea
            id="payload-content"
            className="h-[50vh] w-full rounded-lg border border-border bg-muted/20 p-4"
            role="region"
            aria-label="Raw payload content"
          >
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">
              {typeof payload === "string"
                ? payload
                : JSON.stringify(payload, null, 2)}
            </pre>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground">No payload data for this entry.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
