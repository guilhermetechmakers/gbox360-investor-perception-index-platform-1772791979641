import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export interface LoadingModalProps {
  open: boolean
  title?: string
  subtitle?: string
  onDismiss?: () => void
  optionalProgress?: number | string
}

const DEFAULT_TITLE = "Loading…"

export function LoadingModal({
  open,
  title = DEFAULT_TITLE,
  subtitle,
  onDismiss,
  optionalProgress,
}: LoadingModalProps) {
  const safeTitle = title ?? DEFAULT_TITLE
  const safeSubtitle = subtitle ?? ""

  const progressValue =
    typeof optionalProgress === "number"
      ? Math.min(100, Math.max(0, optionalProgress))
      : undefined
  const progressLabel =
    typeof optionalProgress === "string" ? optionalProgress : undefined

  const handleOpenChange = (next: boolean) => {
    if (!next && onDismiss) {
      onDismiss()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={!!onDismiss}
        className="sm:max-w-md rounded-[18px] shadow-card"
        role="dialog"
        aria-modal="true"
        aria-label={safeTitle}
        aria-live="polite"
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Loader2
              className="h-6 w-6 animate-spin text-primary"
              aria-hidden
            />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            {safeTitle}
          </DialogTitle>
          {safeSubtitle ? (
            <p className="text-center text-sm text-muted-foreground">
              {safeSubtitle}
            </p>
          ) : null}
        </DialogHeader>

        <div className="space-y-4">
          {progressValue != null ? (
            <div className="space-y-2">
              <Progress value={progressValue} className="h-2" />
              {progressLabel ? (
                <p className="text-center text-xs text-muted-foreground">
                  {progressLabel}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex justify-center gap-2" aria-hidden>
              <Skeleton className="h-2 w-16 rounded-full" />
              <Skeleton className="h-2 w-20 rounded-full" />
              <Skeleton className="h-2 w-12 rounded-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
