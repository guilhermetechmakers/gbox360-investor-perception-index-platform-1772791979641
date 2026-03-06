import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface FooterNoteProps {
  className?: string
}

export function FooterNote({ className }: FooterNoteProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-card py-8",
        className
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <span className="text-sm text-muted-foreground">
          © Gbox360. All rights reserved.
        </span>
        <nav
          className="flex flex-wrap justify-center gap-6"
          aria-label="Legal and site links"
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
            Terms
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Home
          </Link>
          <Link
            to="/about-help"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            About & Help
          </Link>
        </nav>
      </div>
    </footer>
  )
}
