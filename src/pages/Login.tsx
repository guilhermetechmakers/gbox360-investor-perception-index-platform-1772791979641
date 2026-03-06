import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSignIn } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const [showMfaPrompt, setShowMfaPrompt] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    signIn.mutate(data, {
      onSuccess: () => navigate("/dashboard"),
      onError: () => setShowMfaPrompt(true),
    })
  }

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
            <CardTitle className="font-display text-2xl">Log in</CardTitle>
            <CardDescription>
              Enter your email and password. SSO coming soon for enterprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              {showMfaPrompt && (
                <p className="text-sm text-muted-foreground">
                  MFA may be required. Check your authenticator or email.
                </p>
              )}
              <Button type="submit" className="w-full" disabled={signIn.isPending}>
                {signIn.isPending ? "Signing in…" : "Log in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </p>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
