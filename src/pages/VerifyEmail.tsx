import { useEffect, useState, useRef } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useResendVerification, useVerifyEmail } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react"

type VerificationStatus = "pending" | "verifying" | "success" | "error"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? searchParams.get("token_hash") ?? ""
  const [status, setStatus] = useState<VerificationStatus>(token ? "verifying" : "pending")
  const verifiedRef = useRef(false)

  const resend = useResendVerification()
  const verifyEmail = useVerifyEmail()

  useEffect(() => {
    if (!token || verifiedRef.current) return
    verifiedRef.current = true
    setStatus("verifying")
    verifyEmail.mutate(token, {
      onSuccess: (data) => {
        const verified = data?.verified ?? true
        setStatus(verified ? "success" : "error")
      },
      onError: () => setStatus("error"),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => navigate("/auth"), 2000)
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
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
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
              ) : status === "error" ? (
                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
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
                ? "Your account is now active. Redirecting to log in…"
                : status === "verifying"
                  ? "Please wait while we confirm your email."
                  : status === "error"
                    ? "The verification link may have expired or is invalid. Request a new one below."
                    : "We sent a verification link to your email. Click it to activate your account. You can also request a new link below."}
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
                {resend.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground">
              <a
                href="mailto:support@gbox360.com"
                className="text-primary hover:underline"
              >
                Contact support
              </a>
              {" "}if you need help.
            </p>
            <Link
              to="/auth"
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
