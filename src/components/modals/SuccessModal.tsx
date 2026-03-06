import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

export interface ModalAction {
  label: string
  onClick: () => void
}

export interface SuccessModalProps {
  open: boolean
  title?: string
  message?: string
  primaryAction: ModalAction
  secondaryAction?: ModalAction
  showViewResults?: boolean
  resultsHref?: string
  onClose?: () => void
}

const DEFAULT_TITLE = "Success"
const DEFAULT_PRIMARY_LABEL = "Continue"
const DEFAULT_SECONDARY_LABEL = "Dismiss"

export function SuccessModal({
  open,
  title = DEFAULT_TITLE,
  message,
  primaryAction,
  secondaryAction,
  showViewResults = false,
  resultsHref,
  onClose,
}: SuccessModalProps) {
  const safeTitle = title ?? DEFAULT_TITLE
  const safeMessage = message ?? ""
  const primary = primaryAction ?? { label: DEFAULT_PRIMARY_LABEL, onClick: () => {} }
  const secondary = secondaryAction
  const primaryLabel = primary.label ?? DEFAULT_PRIMARY_LABEL
  const secondaryLabel = secondary?.label ?? DEFAULT_SECONDARY_LABEL
  const hasPrimaryHandler = typeof primary.onClick === "function"
  const hasSecondaryHandler = secondary && typeof secondary.onClick === "function"

  const handlePrimaryClick = () => {
    if (hasPrimaryHandler) {
      primary.onClick()
    }
  }

  const handleSecondaryClick = () => {
    if (hasSecondaryHandler && secondary) {
      secondary.onClick()
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            {safeTitle}
          </DialogTitle>
          {safeMessage ? (
            <p className="text-center text-sm text-muted-foreground">
              {safeMessage}
            </p>
          ) : null}
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handlePrimaryClick}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all"
          >
            {primaryLabel}
          </Button>
          {secondary ? (
            <Button
              variant="outline"
              onClick={handleSecondaryClick}
              className="w-full"
            >
              {secondaryLabel}
            </Button>
          ) : null}
          {showViewResults && resultsHref ? (
            <Link to={resultsHref} className="block">
              <Button variant="ghost" className="w-full text-muted-foreground">
                View results
              </Button>
            </Link>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
