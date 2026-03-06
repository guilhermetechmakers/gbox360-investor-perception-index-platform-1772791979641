import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useResetPasswordSet } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { InlineErrorBox } from "@/components/auth/InlineErrorBox"
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter"
import { ArrowLeft, KeyRound, Loader2, CheckCircle } from "lucide-react"

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, "Password must contain at least one symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const resetPassword = useResetPasswordSet()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const newPassword = watch("newPassword") ?? ""

  const onSubmit = (data: FormData) => {
    if (!token.trim()) {
      setServerError("Invalid or missing reset token. Please request a new password reset link.")
      return
    }
    setServerError("")
    resetPassword.mutate(
      { token, newPassword: data.newPassword },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => setServerError(err?.message ?? "Failed to reset password"),
      }
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-[rgb(var(--page-bg))]">
        <header className="border-b border-border bg-card py-4 shadow-sm">
          <div className="container flex items-center justify-between px-4">
            <Link to="/" className="font-display text-xl font-semibold text-foreground">
              Gbox360
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-h-[44px] items-center"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to log in
            </Link>
          </div>
        </header>
        <AnimatedPage className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-[18px] shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">Invalid reset link</CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired. Please request a new one from the forgot password page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request new reset link</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedPage>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-[rgb(var(--page-bg))]">
        <header className="border-b border-border bg-card py-4 shadow-sm">
          <div className="container flex items-center justify-between px-4">
            <Link to="/" className="font-display text-xl font-semibold text-foreground">
              Gbox360
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-h-[44px] items-center"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to log in
            </Link>
          </div>
        </header>
        <AnimatedPage className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-[18px] shadow-card border-border transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-center font-display text-2xl">Password updated</CardTitle>
              <CardDescription className="text-center">
                Your password has been reset successfully. You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">Log in</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedPage>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--page-bg))]">
      <header className="border-b border-border bg-card py-4 shadow-sm">
        <div className="container flex items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Gbox360
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-h-[44px] items-center"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to log in
          </Link>
        </div>
      </header>
      <AnimatedPage className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-[18px] shadow-card border-border transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <CardTitle className="text-center font-display text-2xl">Set new password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below. Use a strong password with uppercase, lowercase, numbers, and symbols.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InlineErrorBox message={serverError} />
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  className="rounded-lg focus-visible:ring-ring"
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? "new-password-error" : undefined}
                />
                <PasswordStrengthMeter password={newPassword} showRules />
                {errors.newPassword && (
                  <p id="new-password-error" className="text-sm text-destructive" role="alert">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className="rounded-lg focus-visible:ring-ring"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                disabled={resetPassword.isPending}
              >
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Resetting…
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
