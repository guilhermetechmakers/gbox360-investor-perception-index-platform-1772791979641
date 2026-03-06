import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink } from "lucide-react"

export interface ErrorModalAction {
  label: string
  onClick: () => void
}

export interface ErrorModalProps {
  open: boolean
  title?: string
  errorMessage?: string
  retryAction?: ErrorModalAction
  supportLink?: string
  onClose?: () => void
}

const DEFAULT_TITLE = "Something went wrong"
const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred. Please try again."
const DEFAULT_RETRY_LABEL = "Retry"

export function ErrorModal({
  open,
  title = DEFAULT_TITLE,
  errorMessage,
  retryAction,
  supportLink,
  onClose,
}: ErrorModalProps) {
  const safeTitle = title ?? DEFAULT_TITLE
  const safeMessage = errorMessage ?? DEFAULT_ERROR_MESSAGE
  const retry = retryAction
  const retryLabel = retry?.label ?? DEFAULT_RETRY_LABEL
  const hasRetryHandler = retry && typeof retry.onClick === "function"

  const handleRetryClick = () => {
    if (hasRetryHandler && retry) {
      retry.onClick()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && onClose) onClose()
      }}
    >
      <DialogContent
        showClose
        className="sm:max-w-md rounded-[18px] shadow-card"
        role="dialog"
        aria-modal="true"
        aria-label={safeTitle}
      >
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            {safeTitle}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            {safeMessage}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {retry ? (
            <Button
              onClick={handleRetryClick}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all"
            >
              {retryLabel}
            </Button>
          ) : null}
          {supportLink ? (
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              <ExternalLink className="h-4 w-4" />
              Contact support
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
