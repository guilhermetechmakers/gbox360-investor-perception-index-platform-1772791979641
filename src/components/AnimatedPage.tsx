import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <div className={cn("animate-fade-in-up", className)}>
      {children}
    </div>
  )
}
