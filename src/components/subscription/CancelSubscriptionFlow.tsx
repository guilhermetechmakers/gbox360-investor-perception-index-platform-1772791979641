import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCancelSubscription } from "@/hooks/useSubscription"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const CANCEL_REASONS = [
  "Too expensive",
  "Missing features",
  "Switching to another tool",
  "Not using enough",
  "Other",
]

interface CancelSubscriptionFlowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "confirm" | "reason" | "final"

export function CancelSubscriptionFlow({
  open,
  onOpenChange,
}: CancelSubscriptionFlowProps) {
  const [step, setStep] = useState<Step>("confirm")
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const cancel = useCancelSubscription()

  const handleClose = () => {
    onOpenChange(false)
    setStep("confirm")
    setReason("")
    setConfirmed(false)
  }

  const handleNext = () => {
    if (step === "confirm") {
      if (!confirmed) {
        toast.error("Please confirm cancellation")
        return
      }
      setStep("reason")
    } else if (step === "reason") {
      setStep("final")
    } else {
      cancel.mutate(
        { confirm: true, reason: reason.trim() || undefined },
        {
          onSuccess: () => {
            toast.success("Subscription canceled")
            handleClose()
          },
          onError: () => toast.error("Failed to cancel"),
        }
      )
    }
  }

  const handleCancel = () => {
    if (step === "confirm") handleClose()
    else if (step === "reason") setStep("confirm")
    else setStep("reason")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showClose>
        <DialogHeader>
          <DialogTitle>
            {step === "confirm" && "Cancel subscription?"}
            {step === "reason" && "Why are you leaving?"}
            {step === "final" && "Last chance"}
          </DialogTitle>
          <DialogDescription>
            {step === "confirm" &&
              "Your access will continue until the end of the current billing period."}
            {step === "reason" && "Optional. Helps us improve."}
            {step === "final" &&
              "Are you sure? You can resubscribe anytime."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {step === "confirm" && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">
                I understand my subscription will be canceled at the end of the billing period.
              </span>
            </label>
          )}
          {step === "reason" && (
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {CANCEL_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            {step === "confirm" ? "Keep subscription" : "Back"}
          </Button>
          <Button
            variant={step === "final" ? "destructive" : "default"}
            onClick={handleNext}
            disabled={(step === "confirm" && !confirmed) || cancel.isPending}
          >
            {cancel.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Canceling…
              </>
            ) : step === "final" ? (
              "Yes, cancel"
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
