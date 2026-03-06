import { cn } from "@/lib/utils"

export interface AnchorNavItem {
  id: string
  title: string
}

export interface AnchorNavProps {
  items?: AnchorNavItem[]
  className?: string
}

export function AnchorNav({ items = [], className }: AnchorNavProps) {
  const safeItems = Array.isArray(items) ? items : []

  if (safeItems.length === 0) return null

  return (
    <nav
      className={cn("space-y-1", className)}
      aria-label="Terms of Service sections"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Jump to section
      </p>
      <ul className="space-y-0.5">
        {safeItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
