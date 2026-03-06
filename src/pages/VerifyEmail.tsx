import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useResendVerification } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Mail } from "lucide-react"

export default function VerifyEmail() {
  const resend = useResendVerification()

  useEffect(() => {
    const t = setInterval(() => {
      // In a real app, poll auth state or check verification endpoint
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[rgb(var(--hero-bg))] flex flex-col">
      <header className="border-b border-border bg-card py-4">
        <div className="container flex justify-center">
          <Link to="/" className="font-display text-xl font-semibold">
            Gbox360
          </Link>
        </div>
      </header>
      <AnimatedPage className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl text-center">Verify your email</CardTitle>
            <CardDescription className="text-center">
              We sent a verification link to your email. Click it to activate your account. This page will update when verification is detected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => resend.mutate(undefined)}
              disabled={resend.isPending}
            >
              {resend.isPending ? "Sending…" : "Resend verification email"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/support" className="text-primary hover:underline">
                Contact support
              </Link>
              {" "}if you need help.
            </p>
            <Link to="/login" className="block text-center text-sm text-primary hover:underline">
              Back to log in
            </Link>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
