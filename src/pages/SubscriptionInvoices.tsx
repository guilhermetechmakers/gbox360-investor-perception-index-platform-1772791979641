import { AnimatedPage } from "@/components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { InvoicesPanel } from "@/components/subscription/InvoicesPanel"

export default function SubscriptionInvoices() {
  return (
    <AnimatedPage>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/subscription-management" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to subscription
            </Link>
          </Button>
          <h1 className="mt-4 font-display text-2xl font-semibold">Invoices & transactions</h1>
          <p className="text-muted-foreground">
            View and download past invoices.
          </p>
        </div>
        <InvoicesPanel />
      </div>
    </AnimatedPage>
  )
}
