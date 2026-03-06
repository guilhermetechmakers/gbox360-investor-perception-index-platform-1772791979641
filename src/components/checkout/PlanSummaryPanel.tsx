import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import type { Plan } from "@/types/subscription"
import { safeArray } from "@/lib/data-guard"
import { cn } from "@/lib/utils"

interface PlanSummaryPanelProps {
  plans: Plan[]
  selectedPlanId: string | null
  onSelectPlan: (planId: string) => void
  billingPeriod: "monthly" | "annual"
  onBillingPeriodChange: (period: "monthly" | "annual") => void
  isLoading?: boolean
}

export function PlanSummaryPanel({
  plans,
  selectedPlanId,
  onSelectPlan,
  billingPeriod,
  onBillingPeriodChange,
  isLoading,
}: PlanSummaryPanelProps) {
  const planList = safeArray(plans)

  const getPrice = (plan: Plan) => {
    if (billingPeriod === "annual") {
      return plan.priceAnnual ?? plan.price * 12
    }
    return plan.priceMonthly ?? plan.price
  }

  const getPriceLabel = (plan: Plan) => {
    const price = getPrice(plan)
    return billingPeriod === "annual"
      ? `$${price}/yr`
      : `$${price}/mo`
  }

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] overflow-hidden">
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
      <CardHeader>
        <CardTitle className="font-display text-xl">Plan summary</CardTitle>
        <CardDescription>
          Choose your plan and billing cycle. Annual billing saves you up to 17%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
          <Label htmlFor="billing-toggle" className="text-sm font-medium">
            Billing period
          </Label>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm",
                billingPeriod === "monthly" ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <Switch
              id="billing-toggle"
              checked={billingPeriod === "annual"}
              onCheckedChange={(checked) =>
                onBillingPeriodChange(checked ? "annual" : "monthly")
              }
              aria-label="Toggle annual billing"
            />
            <span
              className={cn(
                "text-sm",
                billingPeriod === "annual" ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select plan</Label>
          <div className="space-y-2">
            {planList.map((plan) => {
              const isSelected = selectedPlanId === plan.id
              const features = safeArray(plan.features)
              const entitlements = safeArray(plan.entitlements)
              const displayFeatures = entitlements.length > 0 ? entitlements : features

              return (
                <label
                  key={plan.id}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-xl border-2 px-4 py-4 transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={isSelected}
                      onChange={() => onSelectPlan(plan.id)}
                      className="sr-only"
                      aria-label={`Select ${plan.name} plan`}
                    />
                    <span className="font-display font-semibold">{plan.name}</span>
                    <span className="text-lg font-medium text-primary">
                      {getPriceLabel(plan)}
                    </span>
                  </div>
                  {displayFeatures.length > 0 && (
                    <ul className="space-y-1 pl-1">
                      {displayFeatures.slice(0, 4).map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {plan.quotas?.seats != null && (
                    <p className="text-xs text-muted-foreground">
                      {plan.quotas.seats} team seat{plan.quotas.seats !== 1 ? "s" : ""} included
                    </p>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
