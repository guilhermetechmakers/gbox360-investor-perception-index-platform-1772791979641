import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SSOStatusBadgeProps {
  isSsoEnabled: boolean
  className?: string
}

export function SSOStatusBadge({ isSsoEnabled, className }: SSOStatusBadgeProps) {
  if (!isSsoEnabled) return null
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 font-medium", className)}
      aria-label="Authenticated via SSO"
    >
      <Shield className="h-3.5 w-3.5" aria-hidden />
      SSO
    </Badge>
  )
}
