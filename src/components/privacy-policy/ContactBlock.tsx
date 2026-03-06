import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PrivacyContact } from "@/content/privacy-policy"

interface ContactBlockProps {
  contact?: PrivacyContact | null
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

export function ContactBlock({
  contact,
  ctaLabel = "Submit a Data Request",
  ctaHref = "/about-help#contact",
  className,
}: ContactBlockProps) {
  const dpoName = contact?.dpoName ?? ""
  const email = contact?.email ?? ""
  const phone = contact?.phone ?? ""
  const address = contact?.address ?? ""
  const notes = contact?.notes ?? ""

  return (
    <section className={cn(className)} aria-labelledby="contact-heading">
      <h2
        id="contact-heading"
        className="mb-6 font-display text-2xl font-semibold text-foreground"
      >
        Contact for Privacy Inquiries
      </h2>
      <Card className="shadow-card">
        <CardContent className="p-6">
          <p className="mb-6 text-muted-foreground">
            {notes || "For privacy inquiries, data subject requests, or to report a concern, please contact us."}
          </p>
          <div className="space-y-4">
            {dpoName && (
              <p className="font-medium text-foreground">
                <span className="text-muted-foreground">Contact: </span>
                {dpoName}
              </p>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-primary transition-colors hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label={`Email ${dpoName || "privacy contact"}`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-primary transition-colors hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label={`Call ${dpoName || "privacy contact"}`}
              >
                <Phone className="h-4 w-4 shrink-0" />
                {phone}
              </a>
            )}
            {address && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {address}
              </p>
            )}
          </div>
          {ctaHref && ctaLabel && (
            <Link to={ctaHref} className="mt-6 inline-block print:hidden">
              <Button aria-label={ctaLabel}>{ctaLabel}</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
