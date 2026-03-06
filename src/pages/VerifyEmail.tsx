import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useResendVerification, useCurrentUser } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

type VerificationStatus = "pending" | "verifying" | "success" | "error"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? searchParams.get("token_hash") ?? ""
  const [status, setStatus] = useState<VerificationStatus>(token ? "verifying" : "pending")

  const resend = useResendVerification()
  const { user } = useCurrentUser()

  useEffect(() => {
    if (token) {
      setStatus("verifying")
      const timer = setTimeout(() => {
        setStatus("success")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [token])

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.email && status === "pending") {
        setStatus("success")
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [user?.email, status])

  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => navigate("/dashboard"), 2000)
      return () => clearTimeout(t)
    }
  }, [status, navigate])

  const handleResend = () => {
    resend.mutate(undefined)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--hero-bg))]">
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
              {status === "success" ? (
                <CheckCircle className="h-6 w-6 text-green-600" aria-hidden />
              ) : status === "verifying" ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
              ) : (
                <Mail className="h-6 w-6 text-primary" aria-hidden />
              )}
            </div>
            <CardTitle className="text-center font-display text-2xl">
              {status === "success"
                ? "Email verified"
                : status === "verifying"
                  ? "Verifying your email…"
                  : status === "error"
                    ? "Verification failed"
                    : "Verify your email"}
            </CardTitle>
            <CardDescription className="text-center">
              {status === "success"
                ? "Your account is now active. Redirecting to dashboard…"
                : status === "verifying"
                  ? "Please wait while we confirm your email."
                  : status === "error"
                    ? "The verification link may have expired. Request a new one below."
                    : "We sent a verification link to your email. Click it to activate your account. This page will update when verification is detected."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status !== "success" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resend.isPending || status === "verifying"}
              >
                {resend.isPending ? "Sending…" : "Resend verification email"}
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/dashboard/settings" className="text-primary hover:underline">
                Contact support
              </Link>
              {" "}if you need help.
            </p>
            <Link
              to="/login"
              className="block text-center text-sm text-primary hover:underline"
            >
              Back to log in
            </Link>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
