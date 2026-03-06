import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, FileText } from "lucide-react"
import type { DocLink } from "@/types/about-help"
import { cn } from "@/lib/utils"

interface LinkPanelProps {
  links?: DocLink[] | null
  title?: string
  className?: string
}

const DEFAULT_LINKS: DocLink[] = [
  { label: "API Documentation", href: "/docs/api" },
  { label: "Developer Guide", href: "/docs/developer" },
  { label: "IPI Model Overview", href: "/docs/ipi-model" },
]

export function LinkPanel({
  links,
  title = "Resources",
  className,
}: LinkPanelProps) {
  const safeLinks =
    Array.isArray(links) && links.length > 0 ? links : DEFAULT_LINKS

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold text-foreground">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Developer resources and documentation.
        </p>
      </CardHeader>
      <CardContent>
        <nav
          className="flex flex-col gap-2"
          aria-label="Documentation and resource links"
        >
          {(safeLinks ?? []).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1">{link.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
