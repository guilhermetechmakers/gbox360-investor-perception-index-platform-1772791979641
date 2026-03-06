import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface ConfirmationPanelProps {
  subscriptionId?: string
  invoiceId?: string
  pdfUrl?: string
  planName?: string
  className?: string
}

export function ConfirmationPanel({
  subscriptionId: _subscriptionId,
  invoiceId,
  pdfUrl,
  planName,
  className,
}: ConfirmationPanelProps) {
  return (
    <Card
      className={cn(
        "card-elevated overflow-hidden rounded-[1.25rem] border-primary/20 bg-gradient-to-br from-card to-primary/5",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Subscription confirmed</CardTitle>
            <p className="text-sm text-muted-foreground">
              {planName ? `You're now subscribed to ${planName}.` : "Your subscription is active."}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent. You can manage your subscription and view invoices
          from the Subscription Management page.
        </p>

        <div className="flex flex-wrap gap-3">
          {(pdfUrl ?? invoiceId) && (
            <Button variant="outline" asChild>
              <a href={pdfUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View invoice
              </a>
            </Button>
          )}
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/dashboard/subscription-management">
              Go to Subscription Management
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
