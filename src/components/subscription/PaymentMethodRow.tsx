import { Button } from "@/components/ui/button"
import { CreditCard, Star, Trash2 } from "lucide-react"
import type { PaymentMethod } from "@/types/subscription"
import { useRemovePaymentMethod, useSetDefaultPaymentMethod } from "@/hooks/useSubscription"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface PaymentMethodRowProps {
  method: PaymentMethod
}

export function PaymentMethodRow({ method }: PaymentMethodRowProps) {
  const remove = useRemovePaymentMethod()
  const setDefault = useSetDefaultPaymentMethod()
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const label = `${method.brand} •••• ${method.last4}`
  const exp = `${String(method.expMonth).padStart(2, "0")}/${method.expYear}`

  const handleSetDefault = () => {
    if (method.isDefault) return
    setDefault.mutate(method.id, {
      onSuccess: () => toast.success("Default payment method updated"),
      onError: () => toast.error("Failed to set default"),
    })
  }

  const handleRemove = () => {
    remove.mutate(method.id, {
      onSuccess: () => {
        setConfirmRemoveOpen(false)
        toast.success("Payment method removed")
      },
      onError: () => toast.error("Failed to remove payment method"),
    })
  }

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
        role="listitem"
      >
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">Expires {exp}</p>
          </div>
          {method.isDefault && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!method.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              aria-label={`Set ${label} as default`}
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmRemoveOpen(true)}
            aria-label={`Remove ${label}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove payment method</DialogTitle>
            <DialogDescription>
              Remove {label}? You can add it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={remove.isPending}>
              {remove.isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
