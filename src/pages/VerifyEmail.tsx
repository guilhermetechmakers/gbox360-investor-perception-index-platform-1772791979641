import { useEffect, useState, useRef, useCallback } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useResendVerification,
  useVerifyEmail,
  useCurrentUser,
  useVerificationStatus,
} from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Mail, CheckCircle, Loader2, AlertCircle, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { VerificationStatusValue } from "@/types/auth"

const POLL_INTERVAL_MS = 15000
const REDIRECT_DELAY_MS = 2000

/** Status badge with accessible aria-label and color coding (design system: primary green for verified) */
export function StatusIndicator({
  status,
  className,
}: {
  status: VerificationStatusValue
  className?: string
}) {
  const config: Record<
    VerificationStatusValue,
    { label: string; ariaLabel: string; className: string }
  > = {
    pending: {
      label: "Pending",
      ariaLabel: "Verification status: Pending",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    verified: {
      label: "Verified",
      ariaLabel: "Verification status: Verified",
      className: "bg-primary/15 text-primary border-primary/30",
    },
    failed: {
      label: "Failed",
      ariaLabel: "Verification status: Failed",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  }
  const c = config[status] ?? config.pending
  return (
    <span
      role="status"
      aria-label={c.ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
        c.className,
        className
      )}
    >
      {c.label}
    </span>
  )
}

/** Re-send button with disabled/loading and rate-limiting states */
export function ResendVerificationButton({
  onClick,
  disabled,
  isLoading,
  cooldownSeconds,
  className,
}: {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  cooldownSeconds?: number
  className?: string
}) {
  const [countdown, setCountdown] = useState(cooldownSeconds ?? 0)

  useEffect(() => {
    if (cooldownSeconds == null || cooldownSeconds <= 0) return
    setCountdown(cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const isDisabled = disabled || isLoading || countdown > 0

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn("w-full", className)}
      aria-label={countdown > 0 ? `Resend available in ${countdown} seconds` : "Resend verification email"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending…
        </>
      ) : countdown > 0 ? (
        `Resend in ${countdown}s`
      ) : (
        "Resend verification email"
      )}
    </Button>
  )
}

/** Support contact link */
export function SupportLink({ className }: { className?: string }) {
  return (
    <a
      href="mailto:support@gbox360.com?subject=Gbox360%20Email%20Verification%20Help"
      className={cn(
        "text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
        className
      )}
      aria-label="Contact support for help with email verification"
    >
      Need help? Contact support
    </a>
  )
}

type TokenVerifyStatus = "idle" | "verifying" | "success" | "error"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? searchParams.get("token_hash") ?? ""
  const [tokenStatus, setTokenStatus] = useState<TokenVerifyStatus>(token ? "verifying" : "idle")
  const verifiedRef = useRef(false)

  const { user, isLoading: isUserLoading } = useCurrentUser()
  const userId = user?.id ?? ""
  const email = user?.email ?? ""
  const hasTokenStored = typeof window !== "undefined" && !!localStorage.getItem("auth_token")

  const resend = useResendVerification()
  const verifyEmail = useVerifyEmail()
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)

  const hasToken = token.length > 0
  const isPostSignupFlow = !hasToken

  const { data: statusData, refetch: refetchStatus } = useVerificationStatus(userId || undefined, {
    enabled: isPostSignupFlow && (!!userId || hasTokenStored),
    refetchInterval: POLL_INTERVAL_MS,
  })

  const status: VerificationStatusValue = (statusData?.status ?? "pending") as VerificationStatusValue
  const nowSec = Math.floor(Date.now() / 1000)
  const cooldownSeconds = Math.max(0, cooldownUntil - nowSec)

  const handleResend = useCallback(() => {
    resend.mutate(userId && email ? { userId, email } : undefined, {
      onSuccess: (data) => {
        const cd = data?.cooldown ?? 60
        if (cd > 0) setCooldownUntil(Math.floor(Date.now() / 1000) + cd)
      },
    })
  }, [resend, userId, email])

  useEffect(() => {
    if (!hasToken || verifiedRef.current) return
    verifiedRef.current = true
    setTokenStatus("verifying")
    verifyEmail.mutate(token, {
      onSuccess: (data) => {
        const verified = data?.verified ?? true
        setTokenStatus(verified ? "success" : "error")
      },
      onError: () => setTokenStatus("error"),
    })
  }, [hasToken, token, verifyEmail])

  useEffect(() => {
    if (tokenStatus === "success") {
      toast.success("Email verified. Redirecting…")
      const t = setTimeout(() => navigate("/dashboard"), REDIRECT_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [tokenStatus, navigate])

  useEffect(() => {
    if (isPostSignupFlow && status === "verified") {
      toast.success("Email verified. Redirecting…")
      const t = setTimeout(() => navigate("/dashboard"), REDIRECT_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [isPostSignupFlow, status, navigate])

  if (hasToken) {
    return (
      <div className="flex min-h-screen flex-col bg-page-bg">
        <header className="border-b border-border bg-card py-4 shadow-sm">
          <div className="container flex justify-center">
            <Link to="/" className="font-display text-xl font-semibold text-foreground">
              Gbox360
            </Link>
          </div>
        </header>
        <section className="flex flex-1 items-center justify-center bg-hero-bg p-4">
          <AnimatedPage className="w-full max-w-[1000px]">
            <Card className="mx-auto w-full max-w-md rounded-[20px] border-border shadow-card transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {tokenStatus === "success" ? (
                  <CheckCircle className="h-6 w-6 text-green-600" aria-hidden />
                ) : tokenStatus === "error" ? (
                  <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
                ) : tokenStatus === "verifying" ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
                ) : (
                  <Mail className="h-6 w-6 text-primary" aria-hidden />
                )}
              </div>
              <CardTitle className="text-center font-display text-2xl">
                {tokenStatus === "success"
                  ? "Email verified"
                  : tokenStatus === "verifying"
                    ? "Verifying your email…"
                    : tokenStatus === "error"
                      ? "Verification failed"
                      : "Verify your email"}
              </CardTitle>
              <CardDescription className="text-center">
                {        tokenStatus === "success"
                  ? "Your account is now active. Redirecting…"
                  : tokenStatus === "verifying"
                    ? "Please wait while we confirm your email."
                    : tokenStatus === "error"
                      ? "The verification link may have expired or is invalid. Request a new one below."
                      : "We sent a verification link to your email. Click it to activate your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenStatus !== "success" && (
                <ResendVerificationButton
                  onClick={handleResend}
                  disabled={tokenStatus === "verifying"}
                  isLoading={resend.isPending}
                  cooldownSeconds={cooldownSeconds > 0 ? cooldownSeconds : undefined}
                />
              )}
              <p className="text-center text-sm text-muted-foreground">
                <SupportLink />
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
        </section>
      </div>
    )
  }

  if (!userId && !isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-page-bg">
        <header className="border-b border-border bg-card py-4 shadow-sm">
          <div className="container flex justify-center">
            <Link to="/" className="font-display text-xl font-semibold text-foreground">
              Gbox360
            </Link>
          </div>
        </header>
        <section className="flex flex-1 items-center justify-center bg-hero-bg p-4">
          <AnimatedPage className="w-full max-w-[1000px]">
            <Card className="mx-auto w-full max-w-md rounded-[20px] border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">
                Verify your email
              </CardTitle>
              <CardDescription className="text-center">
                {hasTokenStored
                  ? "Loading your account…"
                  : "Please log in to verify your email address."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasTokenStored ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="w-full">Go to log in</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </AnimatedPage>
        </section>
      </div>
    )
  }

  if (!userId && isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-page-bg">
        <header className="border-b border-border bg-card py-4 shadow-sm">
          <div className="container flex justify-center">
            <Link to="/" className="font-display text-xl font-semibold text-foreground">
              Gbox360
            </Link>
          </div>
        </header>
        <section className="flex flex-1 items-center justify-center bg-hero-bg p-4">
          <AnimatedPage className="w-full max-w-[1000px]">
            <Card className="mx-auto w-full max-w-md rounded-[20px] border-border shadow-card">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        </AnimatedPage>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-bg">
      <header className="border-b border-border bg-card py-4 shadow-sm">
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
      <section className="flex flex-1 items-center justify-center bg-hero-bg p-4">
        <AnimatedPage className="w-full max-w-[1000px]">
          <Card className="mx-auto w-full max-w-lg rounded-[20px] border-border shadow-card transition-shadow hover:shadow-lg">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <CardTitle className="text-center font-display text-2xl md:text-3xl">
              Verify your email to activate your account
            </CardTitle>
            <CardDescription className="text-center text-base">
              A verification link has been sent to you. Please click the link to verify. You can
              re-send the email if you didn&apos;t receive it.
              {email ? (
                <span className="mt-2 block font-medium text-foreground">Sent to: {email}</span>
              ) : null}
            </CardDescription>
            <div className="flex justify-center pt-2">
              <StatusIndicator status={status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Live status</p>
              <p>
                {status === "verified"
                  ? "Your email has been verified. Redirecting to sign in…"
                  : status === "pending"
                    ? "Waiting for verification. We check every 15 seconds."
                    : "Verification failed. Please try again or contact support."}
              </p>
            </div>
            <ResendVerificationButton
              onClick={handleResend}
              disabled={status === "verified"}
              isLoading={resend.isPending}
              cooldownSeconds={cooldownSeconds > 0 ? cooldownSeconds : undefined}
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <SupportLink />
              <button
                type="button"
                onClick={() => refetchStatus()}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Check verification status now
              </button>
            </div>
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" aria-hidden />
                Why am I seeing this?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                We require email verification to ensure account security and deliver important
                updates. Check your inbox (and spam folder) for the verification link.
              </p>
            </details>
          </CardContent>
        </Card>
        </AnimatedPage>
      </section>
    </div>
  )
}

/** Named export for spec: Email Verification page component */
export { VerifyEmail as EmailVerificationPage }
