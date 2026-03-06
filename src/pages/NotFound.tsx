import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Home, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <AnimatedPage>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
            <p className="mt-2 text-muted-foreground">
              The page you’re looking for doesn’t exist or has been moved.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Error reference: 404
            </p>
            <Link to="/">
              <Button className="mt-6">
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
