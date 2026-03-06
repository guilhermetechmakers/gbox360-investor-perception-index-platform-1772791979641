/**
 * ActionPanel500 — Primary and secondary CTAs for 500 page.
 * Retry (green), Contact Support, View System Status.
 */

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { RefreshCw, Headphones, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionPanel500Props {
  onRetry?: () => void
  isRetrying?: boolean
  errorCode?: string
  supportHref?: string
  statusHref?: string
  className?: string
}

export function ActionPanel500({
  onRetry,
  isRetrying = false,
  errorCode = "",
  supportHref = "/about-help#contact",
  statusHref = "/about-help",
  className,
}: ActionPanel500Props) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-4", className)}
      role="navigation"
      aria-label="500 error actions"
    >
      <Button
        size="lg"
        onClick={handleRetry}
        disabled={isRetrying}
        className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:ring-ring"
        aria-label="Retry loading the page"
      >
        <RefreshCw
          className={cn("mr-2 h-5 w-5", isRetrying && "animate-spin")}
          aria-hidden
        />
        {isRetrying ? "Retrying…" : "Retry"}
      </Button>
      <Link to={supportHref} state={{ errorCode: errorCode || undefined }}>
        <Button
          size="lg"
          variant="outline"
          className="rounded-lg border-secondary/50 bg-transparent hover:bg-secondary/10 hover:border-secondary transition-all duration-200 focus-visible:ring-ring"
          aria-label="Contact support"
        >
          <Headphones className="mr-2 h-5 w-5" aria-hidden />
          Contact Support
        </Button>
      </Link>
      <Link to={statusHref}>
        <Button
          size="lg"
          variant="outline"
          className="rounded-lg border-secondary/50 bg-transparent hover:bg-secondary/10 hover:border-secondary transition-all duration-200 focus-visible:ring-ring"
          aria-label="View system status"
        >
          <Activity className="mr-2 h-5 w-5" aria-hidden />
          View Status
        </Button>
      </Link>
    </div>
  )
}
