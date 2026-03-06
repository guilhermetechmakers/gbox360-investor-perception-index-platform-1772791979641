/**
 * ActionBar — Primary and secondary navigation actions for 404 page.
 * Primary: Go to Dashboard (green). Secondary: Go to Landing Page (teal/gray-teal).
 * Accessible labels and clear guidance.
 */
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Home, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionBarProps {
  className?: string
}

export function ActionBar({ className }: ActionBarProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-4", className)}
      role="navigation"
      aria-label="Page not found navigation"
    >
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="rounded-lg gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        Back
      </Button>
      <Link to="/dashboard">
        <Button
          size="lg"
          className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:ring-ring"
          aria-label="Go to Dashboard"
        >
          <LayoutDashboard className="mr-2 h-5 w-5" aria-hidden />
          Go to Dashboard
        </Button>
      </Link>
      <Link to="/">
        <Button
          size="lg"
          variant="outline"
          className="rounded-lg border-secondary/50 bg-transparent hover:bg-secondary/10 hover:border-secondary transition-all duration-200 focus-visible:ring-ring"
          aria-label="Go to Landing Page"
        >
          <Home className="mr-2 h-5 w-5" aria-hidden />
          Go to Landing Page
        </Button>
      </Link>
    </div>
  )
}
