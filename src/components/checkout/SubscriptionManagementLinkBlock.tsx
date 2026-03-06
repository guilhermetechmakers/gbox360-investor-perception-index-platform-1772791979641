import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Settings } from "lucide-react"
import { Link } from "react-router-dom"

interface SubscriptionManagementLinkBlockProps {
  title?: string
  description?: string
}

export function SubscriptionManagementLinkBlock({
  title = "Manage your subscription",
  description = "Update payment methods, change plans, view invoices, and manage team seats.",
}: SubscriptionManagementLinkBlockProps) {
  return (
    <Card className="card-elevated rounded-[1.25rem] border-primary/10 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Settings className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/dashboard/subscription-management">
            Subscription Management
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
