import { AnimatedPage } from "@/components/AnimatedPage"
import {
  SubscriptionHeaderCard,
  PaymentMethodsPanel,
  TeamSeatsPanel,
  UsageOverviewPanel,
  CheckoutShortcutPanel,
  InvoicesPanel,
} from "@/components/subscription"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useSubscription"
import { Link } from "react-router-dom"
import { ArrowRight, FileText } from "lucide-react"

export default function SubscriptionManagement() {
  const { data, isLoading } = useSubscription()
  const plan = data?.plan ?? null
  const subscription = data?.subscription ?? null
  const usage = data?.usage ?? null

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your plan, billing, payment methods, and team seats.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link to="/dashboard/subscription-management/invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Transaction history
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <SubscriptionHeaderCard
          currentPlan={plan}
          subscription={subscription}
          usageMetrics={usage}
          isLoading={isLoading}
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <UsageOverviewPanel usageMetrics={usage} isLoading={isLoading} />
            <div className="grid gap-6 md:grid-cols-2">
              <PaymentMethodsPanel />
              <TeamSeatsPanel
                seatsActive={usage?.seats ?? 0}
                seatsTotal={plan?.quotas?.seats ?? 0}
              />
            </div>
            <CheckoutShortcutPanel currentPlan={plan} recommendedPlan={null} />
          </TabsContent>
          <TabsContent value="invoices">
            <InvoicesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  )
}
