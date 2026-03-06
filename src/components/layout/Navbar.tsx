import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          Gbox360
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            to="/#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            to="/about-help"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About & Help
          </Link>
          <Link to="/auth?tab=login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/auth?tab=signup">
            <Button>Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
