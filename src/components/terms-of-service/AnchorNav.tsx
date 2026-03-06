import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  title: string
}

interface AnchorNavProps {
  items: NavItem[]
  className?: string
}

export function AnchorNav({ items, className }: AnchorNavProps) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <nav
      aria-label="Terms of Service sections"
      className={cn("space-y-2", className)}
    >
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Quick navigation
      </h3>
      <ul className="space-y-1">
        {safeItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
