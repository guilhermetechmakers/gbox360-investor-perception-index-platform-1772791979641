import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmailVerificationLinkProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive"
  children?: React.ReactNode
}

export function EmailVerificationLink({
  className,
  variant = "outline",
  children = "Verify email",
}: EmailVerificationLinkProps) {
  return (
    <Link to="/verify-email">
      <Button variant={variant} className={cn(className)}>
        {children}
      </Button>
    </Link>
  )
}
