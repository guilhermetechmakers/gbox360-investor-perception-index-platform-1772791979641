import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditTrailLinkCardProps {
  tenantId?: string
  windowStart?: string
  windowEnd?: string
  jobId?: string
  className?: string
}

export function AuditTrailLinkCard({
  tenantId,
  windowStart,
  windowEnd,
  jobId,
  className,
}: AuditTrailLinkCardProps) {
  const params = new URLSearchParams()
  if (tenantId) params.set("tenantId", tenantId)
  if (windowStart) params.set("start", windowStart)
  if (windowEnd) params.set("end", windowEnd)
  if (jobId) params.set("relatedJobId", jobId)
  params.set("eventTypes", "REPLAY")

  const to = `/admin/audit-logs${params.toString() ? `?${params.toString()}` : ""}`

  return (
    <Card className={cn("rounded-[1rem] border border-border bg-card shadow-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          Audit trail
        </CardTitle>
        <CardDescription>
          View replay events and raw payload references in the audit logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={to}>
          <Button variant="outline" className="w-full gap-2 sm:w-auto" aria-label="Open audit logs">
            <ExternalLink className="h-4 w-4" aria-hidden />
            View audit logs
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
