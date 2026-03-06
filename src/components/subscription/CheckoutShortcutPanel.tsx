import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import type { Plan } from "@/types/subscription"

interface CheckoutShortcutPanelProps {
  currentPlan: Plan | null
  recommendedPlan?: Plan | null
}

export function CheckoutShortcutPanel({
  currentPlan,
  recommendedPlan,
}: CheckoutShortcutPanelProps) {
  const planName = (recommendedPlan ?? currentPlan)?.name ?? "Free"

  return (
    <Card className="card-elevated rounded-[1rem] border-primary/20 bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <CardTitle className="font-display text-lg">Upgrade or change plan</CardTitle>
        <CardDescription>
          Current plan: {planName}. Go to checkout to subscribe or upgrade with a promo code or
          enterprise invoicing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/dashboard/subscription-management/checkout">
            Go to checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
