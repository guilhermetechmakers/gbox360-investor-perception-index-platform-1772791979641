import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CompanyViewLinkProps {
  companyId: string
  window?: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function CompanyViewLink({
  companyId,
  window = "1W",
  className,
  variant = "default",
  size = "default",
  children,
}: CompanyViewLinkProps) {
  if (!companyId?.trim()) {
    return (
      <Button variant={variant} size={size} className={cn(className)} disabled>
        {children ?? "View IPI"}
      </Button>
    )
  }
  const to = `/dashboard/company/${companyId}${window ? `?window=${window}` : ""}`
  return (
    <Link to={to}>
      <Button variant={variant} size={size} className={cn(className)}>
        {children ?? "View IPI"}
      </Button>
    </Link>
  )
}
