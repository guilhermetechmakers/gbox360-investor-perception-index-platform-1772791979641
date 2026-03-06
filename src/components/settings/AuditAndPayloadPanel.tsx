import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"
import { useCurrentUser } from "@/hooks/useAuth"

export function AuditAndPayloadPanel() {
  const { isAdmin } = useCurrentUser()
  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <FileText className="h-5 w-5 text-primary" />
          Audit & Raw Payloads
        </CardTitle>
        <CardDescription>
          View raw payload retention status and access audit trails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium">Raw payload retention</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Raw payloads are archived per your plan retention policy. Access retention details in the
            Privacy Policy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/privacy-policy" className="gap-2">
              <FileText className="h-4 w-4" />
              Privacy Policy
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/audit-logs" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Audit logs
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
