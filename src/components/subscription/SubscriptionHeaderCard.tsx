import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpDown, Calendar } from "lucide-react"
import { Link } from "react-router-dom"
import type { Plan, Subscription, UsageMetrics } from "@/types/subscription"
import { safeNumber } from "@/lib/data-guard"
import { CancelSubscriptionFlow } from "./CancelSubscriptionFlow"
import { PlanChangeModal } from "./PlanChangeModal"
import { useState } from "react"
import { format } from "date-fns"

interface SubscriptionHeaderCardProps {
  currentPlan: Plan | null
  subscription: Subscription | null
  usageMetrics?: UsageMetrics | null
  isLoading?: boolean
}

export function SubscriptionHeaderCard({
  currentPlan,
  subscription,
  usageMetrics,
  isLoading,
}: SubscriptionHeaderCardProps) {
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [cancelFlowOpen, setCancelFlowOpen] = useState(false)

  const planName = currentPlan?.name ?? "No plan"
  const status = subscription?.status ?? "trial"
  const nextBillingDate = subscription?.nextBillingDate
  const isCancelable = status === "active" || status === "trial"
  const apiQuota = safeNumber(usageMetrics?.apiCallQuota, 0)
  const apiUsed = safeNumber(usageMetrics?.apiCallsUsed, 0)

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1rem]">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="card-elevated rounded-[1rem]">
        <CardHeader>
          <CardTitle className="font-display text-xl">{planName}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-4">
            <span
              className={
                status === "active"
                  ? "text-primary"
                  : status === "canceled"
                    ? "text-muted-foreground"
                    : "text-secondary"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {nextBillingDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Next billing: {format(new Date(nextBillingDate), "MMM d, yyyy")}
              </span>
            )}
            {apiQuota > 0 && (
              <span>
                API: {apiUsed} / {apiQuota} calls
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setPlanModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Change plan"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Change plan
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/dashboard/subscription-management/checkout">
              Checkout / Manage billing
            </Link>
          </Button>
          {isCancelable && (
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setCancelFlowOpen(true)}
              aria-label="Cancel subscription"
            >
              Cancel subscription
            </Button>
          )}
        </CardContent>
      </Card>
      <PlanChangeModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        currentPlan={currentPlan}
      />
      <CancelSubscriptionFlow
        open={cancelFlowOpen}
        onOpenChange={setCancelFlowOpen}
      />
    </>
  )
}
