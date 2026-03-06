import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSignUp } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  full_name: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  accept_tos: z.boolean().refine((v) => v === true, "You must accept the Terms of Service"),
})

type FormData = z.infer<typeof schema>

export default function Signup() {
  const navigate = useNavigate()
  const signUp = useSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accept_tos: false },
  })

  const onSubmit = (data: FormData) => {
    signUp.mutate(data, {
      onSuccess: () => navigate("/verify-email"),
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
            <CardTitle className="font-display text-2xl">Create account</CardTitle>
            <CardDescription>
              Sign up with email. Enterprise SSO available on request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name (optional)</Label>
                <Input id="full_name" {...register("full_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" {...register("company")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (optional)</Label>
                <Input id="role" placeholder="e.g. Analyst, IR" {...register("role")} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accept_tos"
                  {...register("accept_tos")}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="accept_tos">I accept the Terms of Service</Label>
              </div>
              {errors.accept_tos && (
                <p className="text-sm text-red-600">{errors.accept_tos.message}</p>
              )}
              <Button type="submit" className="w-full" disabled={signUp.isPending}>
                {signUp.isPending ? "Creating account…" : "Sign up"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </AnimatedPage>
    </div>
  )
}
