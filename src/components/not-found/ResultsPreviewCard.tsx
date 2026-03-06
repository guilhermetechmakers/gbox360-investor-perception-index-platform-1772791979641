/**
 * ResultsPreviewCard — Compact list of potential matches or recent items.
 * All list rendering guarded with Array.isArray and data ?? [].
 */
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewItem {
  id: string
  name: string
  ticker?: string
}

interface ResultsPreviewCardProps {
  items?: PreviewItem[] | null
  title?: string
  emptyMessage?: string
  className?: string
}

export function ResultsPreviewCard({
  items,
  title = "Quick access",
  emptyMessage = "Select a company above or use filters to see results.",
  className,
}: ResultsPreviewCardProps) {
  const safeItems: PreviewItem[] = Array.isArray(items) ? items : []

  return (
    <Card className={cn("rounded-[18px] shadow-card border-border", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {safeItems.length > 0 ? (
          <ul className="space-y-2" role="list">
            {safeItems.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/dashboard/company/${item.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1 font-medium truncate">
                    {item.name}
                  </span>
                  {item.ticker && (
                    <span className="text-xs text-muted-foreground">
                      {item.ticker}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
