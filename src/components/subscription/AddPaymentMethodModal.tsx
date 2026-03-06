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
import { Input } from "@/components/ui/input"
import { useAddPaymentMethod } from "@/hooks/useSubscription"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface AddPaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
}: AddPaymentMethodModalProps) {
  const [last4, setLast4] = useState("")
  const [brand, setBrand] = useState("Visa")
  const [expMonth, setExpMonth] = useState("12")
  const [expYear, setExpYear] = useState("")
  const addMethod = useAddPaymentMethod()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const l4 = last4.replace(/\D/g, "").slice(-4)
    if (l4.length !== 4) {
      toast.error("Enter last 4 digits of card")
      return
    }
    const month = parseInt(expMonth, 10)
    const year = parseInt(expYear, 10)
    if (month < 1 || month > 12 || !year || year < new Date().getFullYear()) {
      toast.error("Enter a valid expiration date")
      return
    }
    addMethod.mutate(
      {
        provider: "card",
        last4: l4,
        brand,
        expMonth: month,
        expYear: year,
      },
      {
        onSuccess: () => {
          toast.success("Payment method added")
          onOpenChange(false)
          setLast4("")
          setExpMonth("12")
          setExpYear("")
        },
        onError: () => toast.error("Failed to add payment method"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" showClose>
        <DialogHeader>
          <DialogTitle>Add payment method</DialogTitle>
          <DialogDescription>
            Card details are tokenized and never stored. Enter last 4 digits and expiry for demo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="last4">Last 4 digits</Label>
            <Input
              id="last4"
              placeholder="4242"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Visa"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exp-month">Month</Label>
              <Input
                id="exp-month"
                type="number"
                min={1}
                max={12}
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-year">Year</Label>
              <Input
                id="exp-year"
                type="number"
                min={new Date().getFullYear()}
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={last4.length !== 4 || !expYear || addMethod.isPending}>
              {addMethod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
