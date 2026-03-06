import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface LegalFooterProps {
  companyName?: string
  contactUrl?: string
  className?: string
}

export function LegalFooter({
  companyName = "Gbox360",
  contactUrl = "/about-help#contact",
  className,
}: LegalFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        "border-t border-border bg-card py-8 print:py-4",
        className
      )}
      role="contentinfo"
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <span className="text-sm text-muted-foreground">
          © {currentYear} {companyName}. All rights reserved.
        </span>
        <nav
          className="flex flex-wrap justify-center gap-6 print:hidden"
          aria-label="Legal and support links"
        >
          <Link
            to="/privacy-policy"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>
          <Link
            to={contactUrl}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Contact
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Home
          </Link>
        </nav>
      </div>
    </footer>
  )
}
