import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useResetPassword } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { InlineErrorBox } from "@/components/auth/InlineErrorBox"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [serverError, setServerError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    setServerError("")
    resetPassword.mutate(data.email.trim().toLowerCase(), {
      onSuccess: () => setSubmitted(true),
      onError: (err) => setServerError(err?.message ?? "Failed to send reset email"),
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--hero-bg))]">
      <header className="border-b border-border bg-card py-4">
        <div className="container flex items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Gbox360
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to log in
          </Link>
        </div>
      </header>
      <AnimatedPage className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {submitted ? (
                <CheckCircle className="h-6 w-6 text-green-600" aria-hidden />
              ) : (
                <Mail className="h-6 w-6 text-primary" aria-hidden />
              )}
            </div>
            <CardTitle className="text-center font-display text-2xl">
              {submitted ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription className="text-center">
              {submitted
                ? "If an account exists for that email, we've sent a link to reset your password."
                : "Enter your email and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/auth">Back to log in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InlineErrorBox message={serverError} />
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
