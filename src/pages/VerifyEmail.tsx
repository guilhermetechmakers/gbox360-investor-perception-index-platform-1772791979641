import { useEffect, useState, useRef, useCallback } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  useResendVerification,
  useVerifyEmail,
  useVerificationStatus,
  useCurrentUser,
} from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Mail, CheckCircle, Loader2, AlertCircle, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import type { VerificationStatusValue } from "@/types/auth"

const POLL_INTERVAL_MS = 15000
const REDIRECT_DELAY_MS = 2000

/** Status badge with accessible aria-label and color coding */
function StatusIndicator({
  status,
  "aria-label": ariaLabel,
  className,
}: {
  status: VerificationStatusValue
  "aria-label"?: string
  className?: string
}) {
  const labels: Record<VerificationStatusValue, string> = {
    pending: "Verification pending",
    verified: "Email verified",
    failed: "Verification failed",
  }
  const label = ariaLabel ?? labels[status] ?? "Verification status"

  const variant =
    status === "verified"
      ? "success"
      : status === "failed"
        ? "destructive"
        : "secondary"

  return (
    <Badge
      variant={variant}
      className={className}
      role="status"
      aria-label={label}
    >
      {labels[status]}
    </Badge>
  )
}

/** Re-send button with disabled/loading states and rate-limit handling */
function ResendVerificationButton({
  onResend,
  isLoading,
  canResend,
  cooldownSeconds,
  className,
}: {
  onResend: () => void
  isLoading: boolean
  canResend: boolean
  cooldownSeconds: number
  className?: string
}) {
  const isDisabled = !canResend || isLoading || cooldownSeconds > 0

  return (
    <Button
      type="button"
      onClick={onResend}
      disabled={isDisabled}
      className={className}
      aria-label={cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds} seconds` : "Resend verification email"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending…
        </>
      ) : cooldownSeconds > 0 ? (
        `Resend in ${cooldownSeconds}s`
      ) : (
        "Re-send verification email"
      )}
    </Button>
  )
}

/** Support contact link */
function SupportLink({ className }: { className?: string }) {
  return (
    <a
      href="mailto:support@gbox360.com?subject=Gbox360%20Email%20Verification%20Help"
      className={`text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded ${className ?? ""}`}
      aria-label="Contact support for verification help"
    >
      Need help? Contact support
    </a>
  )
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? searchParams.get("token_hash") ?? ""
  const emailParam = searchParams.get("email") ?? ""

  const { user } = useCurrentUser()
  const userId = user?.id ?? ""
  const email = emailParam || user?.email ?? ""

  const [status, setStatus] = useState<VerificationStatusValue>("pending")
  const [lastResendAt, setLastResendAt] = useState<number>(0)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [showWhyInfo, setShowWhyInfo] = useState(false)
  const verifiedRef = useRef(false)

  const resend = useResendVerification()
  const verifyEmail = useVerifyEmail()

  const shouldPoll = !token && !!userId
  const { data: statusData } = useVerificationStatus(userId, {
    enabled: shouldPoll && status === "pending",
    refetchInterval: POLL_INTERVAL_MS,
  })

  const canResend = true
  const now = Date.now() / 1000
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now)))

  const handleResend = useCallback(() => {
    if (cooldownSeconds > 0 || resend.isPending) return
    resend.mutate(
      { userId: userId || undefined, email: email || undefined },
      {
        onSuccess: (data) => {
          setLastResendAt(Date.now())
          const cd = data?.cooldown ?? 60
          if (cd > 0) {
            setCooldownUntil(Date.now() / 1000 + cd)
          }
          if (data?.success === false && data?.message) {
            toast.error(data.message)
          }
        },
      }
    )
  }, [userId, email, cooldownSeconds, resend])

  useEffect(() => {
    if (cooldownUntil > 0 && cooldownUntil <= now) {
      const t = setInterval(() => {
        const n = Date.now() / 1000
        if (n >= cooldownUntil) {
          setCooldownUntil(0)
          clearInterval(t)
        }
      }, 1000)
      return () => clearInterval(t)
    }
  }, [cooldownUntil, now])

  useEffect(() => {
    if (!token || verifiedRef.current) return
    verifiedRef.current = true
    setStatus("pending")
    verifyEmail.mutate(token, {
      onSuccess: (data) => {
        const verified = data?.verified ?? true
        setStatus(verified ? "verified" : "failed")
      },
      onError: () => setStatus("failed"),
    })
  }, [token, verifyEmail])

  useEffect(() => {
    const remoteStatus = statusData?.status
    if (typeof remoteStatus === "string" && remoteStatus !== status) {
      setStatus(remoteStatus as VerificationStatusValue)
    }
  }, [statusData?.status, status])

  useEffect(() => {
    if (status === "verified") {
      toast.success("Email verified. Redirecting…")
      const t = setTimeout(() => navigate("/dashboard"), REDIRECT_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [status, navigate])

  const isTokenFlow = !!token
  const isVerifying = isTokenFlow && status === "pending"

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--hero-bg))]">
      <header className="border-b border-border bg-card py-4">
        <div className="container flex items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Gbox360
          </Link>
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to log in
          </Link>
        </div>
      </header>
      <AnimatedPage className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-card">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              {status === "verified" ? (
                <CheckCircle className="h-7 w-7 text-green-600" aria-hidden />
              ) : status === "failed" ? (
                <AlertCircle className="h-7 w-7 text-red-600" aria-hidden />
              ) : isVerifying ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
              ) : (
                <Mail className="h-7 w-7 text-primary" aria-hidden />
              )}
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="font-display text-2xl md:text-3xl">
                {status === "verified"
                  ? "Email verified"
                  : isVerifying
                    ? "Verifying your email…"
                    : status === "failed"
                      ? "Verification failed"
                      : "Verify your email to activate your account."}
              </CardTitle>
              <CardDescription className="text-base">
                {status === "verified"
                  ? "Your account is now active. Redirecting to your dashboard…"
                  : isVerifying
                    ? "Please wait while we confirm your email."
                    : status === "failed"
                      ? "The verification link may have expired or is invalid. Request a new one below."
                      : "A verification link has been sent to you. Please click the link to verify. You can re-send the email if you didn't receive it."}
              </CardDescription>
            </div>
            <div className="flex justify-center">
              <StatusIndicator status={status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {status !== "verified" && (
              <div className="space-y-4">
                <ResendVerificationButton
                  onResend={handleResend}
                  isLoading={resend.isPending}
                  canResend={canResend}
                  cooldownSeconds={cooldownSeconds}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-4 border-t border-border pt-6">
              <SupportLink />
              <button
                type="button"
                onClick={() => setShowWhyInfo(!showWhyInfo)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                aria-expanded={showWhyInfo}
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                Why am I seeing this?
              </button>
              {showWhyInfo && (
                <p className="animate-fade-in text-center text-sm text-muted-foreground max-w-md">
                  We require email verification to activate your account and ensure secure access. After signup, you receive a link—click it to verify. If you don't see it, check your spam folder or use the re-send button above.
                </p>
              )}
            </div>

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
