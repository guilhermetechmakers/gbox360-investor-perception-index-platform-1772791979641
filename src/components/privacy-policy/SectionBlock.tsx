import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Subsection {
  title: string
  content: string
}

interface SectionBlockProps {
  id?: string
  title?: string
  heading?: string
  content?: string
  body?: string
  subsections?: Subsection[]
  subcontent?: ReactNode
  children?: ReactNode
  className?: string
}

export function SectionBlock({
  id,
  title,
  heading,
  content,
  body,
  subsections = [],
  subcontent,
  children,
  className,
}: SectionBlockProps) {
  const sectionTitle = title ?? heading ?? ""
  const sectionContent = content ?? body ?? ""
  const sub = subcontent ?? children
  const safeSubsections = Array.isArray(subsections) ? subsections : []

  return (
    <section
      id={id}
      className={cn("scroll-mt-24 space-y-6", className)}
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
          <p className="mt-4 leading-relaxed text-muted-foreground">{sectionContent}</p>
          {sub !== undefined && sub !== null
            ? sub
            : safeSubsections.length > 0
              ? (
                  <div className="mt-6 space-y-4">
                    {safeSubsections.map((subsection, idx) => (
                      <div key={idx}>
                        <h3 className="font-display text-lg font-medium text-foreground">
                          {subsection.title}
                        </h3>
                        <p className="mt-1 leading-relaxed text-muted-foreground">
                          {subsection.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              : null}
        </CardContent>
      </Card>
    </section>
  )
}
