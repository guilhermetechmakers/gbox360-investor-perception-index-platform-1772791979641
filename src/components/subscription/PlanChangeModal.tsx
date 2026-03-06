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
import { Switch } from "@/components/ui/switch"
import { usePlans, useChangePlan } from "@/hooks/useSubscription"
import { toast } from "sonner"
import { safeArray } from "@/lib/data-guard"
import type { Plan, Subscription } from "@/types/subscription"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PlanChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: Plan | null
  currentSubscription?: Subscription | null
}

export function PlanChangeModal({
  open,
  onOpenChange,
  currentPlan,
}: PlanChangeModalProps) {
  const { data: plans = [], isLoading: plansLoading } = usePlans()
  const changePlan = useChangePlan()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [enterpriseInvoice, setEnterpriseInvoice] = useState(false)

  const planList = safeArray(plans)
  const selectedPlan = planList.find((p) => p.id === selectedPlanId) ?? null
  const currentPlanId = currentPlan?.id ?? null

  const handleConfirm = () => {
    if (!selectedPlanId) {
      toast.error("Select a plan")
      return
    }
    if (selectedPlanId === currentPlanId) {
      toast.info("Already on this plan")
      return
    }
    changePlan.mutate(
      { planId: selectedPlanId, promoCode: promoCode.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Plan updated")
          onOpenChange(false)
          setSelectedPlanId(null)
          setPromoCode("")
        },
        onError: () => toast.error("Failed to change plan"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" showClose>
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
          <DialogDescription>
            Choose a new plan. Proration will apply to your next invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {plansLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          ) : (
            <div className="space-y-2">
              {planList.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    selectedPlanId === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="sr-only"
                  />
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-muted-foreground">
                    {plan.currency} {plan.price}/{plan.interval === "annual" ? "yr" : "mo"}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="promo-code">Promo code</Label>
            <Input
              id="promo-code"
              placeholder="Optional"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enterprise-invoice">Enterprise invoicing</Label>
            <Switch
              id="enterprise-invoice"
              checked={enterpriseInvoice}
              onCheckedChange={setEnterpriseInvoice}
            />
          </div>
          {selectedPlan && (
            <p className="text-sm text-muted-foreground">
              Proration: You will be charged a prorated amount for the remainder of the
              current period. New plan starts immediately.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlanId || changePlan.isPending}
          >
            {changePlan.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Confirm change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
