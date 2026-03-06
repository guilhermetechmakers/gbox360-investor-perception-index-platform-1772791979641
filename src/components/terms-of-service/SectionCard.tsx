import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TermsLink {
  text: string
  href: string
}

export interface SectionCardProps {
  id?: string
  title?: string
  content?: string
  paragraphs?: string[]
  links?: TermsLink[]
  subsections?: Array<{ title: string; paragraphs: string[] }>
  children?: ReactNode
  className?: string
}

export function SectionCard({
  id,
  title,
  content,
  paragraphs = [],
  links = [],
  subsections = [],
  children,
  className,
}: SectionCardProps) {
  const sectionTitle = title ?? ""
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : []
  const safeLinks = Array.isArray(links) ? links : []
  const safeSubsections = Array.isArray(subsections) ? subsections : []

  return (
    <section
      id={id}
      className={cn("scroll-mt-24", className)}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <Card className="rounded-[18px] border-border bg-card shadow-card transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
        <CardContent className="p-6 md:p-8">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            {sectionTitle}
          </h2>
          {content && (
            <p className="mt-4 leading-relaxed text-muted-foreground">{content}</p>
          )}
          {safeParagraphs.length > 0 && (
            <div className="mt-4 space-y-4">
              {safeParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="leading-relaxed text-muted-foreground [&>strong]:font-semibold [&>strong]:text-foreground"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
          {safeLinks.length > 0 && (
            <ul className="mt-4 space-y-2">
              {safeLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("mailto:") || link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
                      className="text-primary transition-colors hover:text-primary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {link.text}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-primary transition-colors hover:text-primary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
          {safeSubsections.length > 0 && (
            <div className="mt-6 space-y-6">
              {safeSubsections.map((sub, idx) => (
                <div key={idx}>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {sub.title}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {(sub.paragraphs ?? []).map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="leading-relaxed text-muted-foreground"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </section>
  )
}
