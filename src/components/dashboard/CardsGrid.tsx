import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardsGridProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3
}

export function CardsGrid({
  children,
  className,
  columns = 2,
}: CardsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}
