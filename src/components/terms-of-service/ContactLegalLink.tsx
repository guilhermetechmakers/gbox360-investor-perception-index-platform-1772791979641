import { Link } from "react-router-dom"
import { Mail, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ContactLegalLinkProps {
  email?: string
  formUrl?: string
  className?: string
}

export function ContactLegalLink({
  email = "legal@gbox360.com",
  formUrl,
  className,
}: ContactLegalLinkProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-4", className)}
      role="group"
      aria-label="Contact for legal inquiries"
    >
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label={`Email legal inquiries to ${email}`}
      >
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        {email}
      </a>
      {formUrl && (
        <Link
          to={formUrl}
          className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-secondary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Go to contact support form"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Contact Support Form
        </Link>
      )}
    </div>
  )
}
