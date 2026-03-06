import { useState } from "react"
import { Link } from "react-router-dom"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSubscription, usePlans, useChangePlan } from "@/hooks/useSubscription"
import { safeArray } from "@/lib/data-guard"
import { ShoppingCart, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"

export default function SubscriptionCheckout() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [enterpriseInvoice, setEnterpriseInvoice] = useState(false)

  const { data: subData } = useSubscription()
  const { data: plans = [] } = usePlans()
  const changePlan = useChangePlan()

  const planList = safeArray(plans)
  const currentPlan = subData?.plan ?? null
  const currentPlanId = currentPlan?.id ?? null
  const selectedPlan = planList.find((p) => p.id === selectedPlanId) ?? planList[0] ?? null

  const handleCheckout = () => {
    const planId = selectedPlanId ?? selectedPlan?.id
    if (!planId) {
      toast.error("Select a plan")
      return
    }
    if (planId === currentPlanId) {
      toast.info("Already on this plan")
      return
    }
    changePlan.mutate(
      { planId, promoCode: promoCode.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Plan updated. Redirecting…")
          window.location.href = "/dashboard/subscription-management"
        },
        onError: () => toast.error("Failed to update plan"),
      }
    )
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link
            to="/dashboard/subscription-management"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to subscription
          </Link>
          <h1 className="font-display text-2xl font-semibold">Checkout</h1>
          <p className="text-muted-foreground">
            Select a plan and complete your subscription.
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Plan summary
            </CardTitle>
            <CardDescription>
              Choose your plan. Proration applies when changing plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select plan</Label>
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
                      ${plan.price}/{plan.interval === "annual" ? "yr" : "mo"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo">Promo code</Label>
              <Input
                id="promo"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Enterprise invoice</p>
                <p className="text-sm text-muted-foreground">Contact sales for invoice billing.</p>
              </div>
              <input
                type="checkbox"
                checked={enterpriseInvoice}
                onChange={(e) => setEnterpriseInvoice(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
            </div>

            {selectedPlan && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Proration: You will be charged a prorated amount. New plan starts immediately.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={!selectedPlanId || changePlan.isPending}
            >
              {changePlan.isPending ? (
                "Processing…"
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm and subscribe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
