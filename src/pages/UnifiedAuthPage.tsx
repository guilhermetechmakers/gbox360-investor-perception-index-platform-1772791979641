import { useState, useCallback, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSignIn, useSignUp } from "@/hooks/useAuth"
import { AnimatedPage } from "@/components/AnimatedPage"
import { MFAPromptModal } from "@/components/auth/MFAPromptModal"
import { SSOLoginButton } from "@/components/auth/SSOLoginButton"
import { InlineErrorBox } from "@/components/auth/InlineErrorBox"
import { AcceptTermsInline } from "@/components/terms-of-service"
import type { SignInInput, SignUpInput, UserRole } from "@/types/auth"
import { TERMS_VERSION } from "@/content/terms-of-service"
import { ArrowLeft, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z.object({
  companyName: z.string().min(1, "Company name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  userRole: z.enum(["Analyst", "IR", "Admin"] as const),
  agreeToTOS: z.boolean().refine((v) => v === true, "You must accept the Terms of Service"),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Landing
      </Link>
      <a
        href="mailto:sales@gbox360.com?subject=Gbox360%20Enterprise%20Inquiry"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Contact Sales
      </a>
    </div>
  )
}

function EmailPasswordLoginForm({
  onSubmit,
  isLoading,
  serverError,
  onForgotPassword,
}: {
  onSubmit: (data: LoginFormData) => void
  isLoading: boolean
  serverError: string
  onForgotPassword: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })
  const rememberMe = watch("rememberMe")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InlineErrorBox message={serverError} />
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
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
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
            aria-describedby="remember-me-label"
          />
          <Label htmlFor="remember-me" id="remember-me-label" className="text-sm font-normal cursor-pointer">
            Remember me
          </Label>
        </div>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded min-h-[44px] min-w-[44px] inline-flex items-center"
        >
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-70" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  )
}

function SignupForm({
  onSubmit,
  isLoading,
  serverError,
}: {
  onSubmit: (data: SignupFormData) => void
  isLoading: boolean
  serverError: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userRole: "Analyst",
      agreeToTOS: false,
    },
  })
  const userRole = watch("userRole")
  const agreeToTOS = watch("agreeToTOS")

  const roles: UserRole[] = ["Analyst", "IR", "Admin"]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InlineErrorBox message={serverError} />
      <div className="space-y-2">
        <Label htmlFor="signup-company">Company name</Label>
        <Input
          id="signup-company"
          type="text"
          placeholder="Acme Inc."
          autoComplete="organization"
          {...register("companyName")}
        />
        {errors.companyName && (
          <p className="text-sm text-red-600" role="alert">
            {errors.companyName.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
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
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters, one letter and one number"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-role">Role</Label>
        <Select
          value={userRole}
          onValueChange={(v) => setValue("userRole", v as UserRole)}
        >
          <SelectTrigger id="signup-role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.userRole && (
          <p className="text-sm text-red-600" role="alert">
            {errors.userRole.message}
          </p>
        )}
      </div>
      <AcceptTermsInline
        checked={agreeToTOS}
        onChange={(checked) => setValue("agreeToTOS", checked)}
        error={errors.agreeToTOS?.message}
      />
      <Button type="submit" className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-70" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Creating account…
          </>
        ) : (
          "Sign up"
        )}
      </Button>
    </form>
  )
}

export default function UnifiedAuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tabParam = searchParams.get("tab") ?? "login"
  const initialTab = tabParam === "signup" ? "signup" : "login"
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])
  const [serverError, setServerError] = useState("")
  const [showMfaPrompt, setShowMfaPrompt] = useState(false)

  const signIn = useSignIn()
  const signUp = useSignUp()

  const handleLoginSuccess = useCallback(() => {
    setShowMfaPrompt(false)
    setServerError("")
    navigate("/dashboard")
  }, [navigate])

  const handleLoginSubmit = (data: LoginFormData) => {
    setServerError("")
    const payload: SignInInput = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      rememberMe: data.rememberMe ?? false,
    }
    signIn.mutate(payload, {
      onSuccess: (response) => {
        const requiresMfa = response?.mfa_required === true
        if (requiresMfa) {
          setShowMfaPrompt(true)
        } else {
          handleLoginSuccess()
        }
      },
      onError: (err) => {
        const msg = err?.message ?? "Sign in failed"
        const suggestsMfa = typeof msg === "string" && (msg.toLowerCase().includes("mfa") || msg.toLowerCase().includes("2fa"))
        if (suggestsMfa) {
          setShowMfaPrompt(true)
        } else {
          setServerError(msg)
        }
      },
    })
  }

  const handleSignupSubmit = (data: SignupFormData) => {
    setServerError("")
    const payload: SignUpInput = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      companyName: data.companyName.trim(),
      userRole: data.userRole,
      agreeToTOS: data.agreeToTOS,
      termsVersion: TERMS_VERSION,
    }
    signUp.mutate(payload, {
      onSuccess: () => navigate("/verify-email"),
      onError: (err) => setServerError(err?.message ?? "Sign up failed"),
    })
  }

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--page-bg))]">
      <header className="border-b border-border bg-card py-4 shadow-sm">
        <div className="container flex items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Gbox360
          </Link>
          <HeaderActions />
        </div>
      </header>
      <AnimatedPage className="flex flex-1 items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md rounded-[18px] shadow-card transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl text-center text-foreground">
              {activeTab === "login" ? "Log in" : "Create account"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {activeTab === "login"
                ? "Enter your email and password. SSO available for enterprise."
                : "Sign up with email. Enterprise SSO available on request."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as "login" | "signup")
                setServerError("")
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl p-1 bg-muted/50">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Log in
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6 space-y-4 animate-fade-in">
                <SSOLoginButton />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
                <EmailPasswordLoginForm
                  onSubmit={handleLoginSubmit}
                  isLoading={signIn.isPending}
                  serverError={serverError}
                  onForgotPassword={handleForgotPassword}
                />
              </TabsContent>
              <TabsContent value="signup" className="mt-6 space-y-4 animate-fade-in">
                <SSOLoginButton />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
                <SignupForm
                  onSubmit={handleSignupSubmit}
                  isLoading={signUp.isPending}
                  serverError={serverError}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </AnimatedPage>
      <MFAPromptModal
        open={showMfaPrompt}
        onSuccess={handleLoginSuccess}
        onCancel={() => setShowMfaPrompt(false)}
      />
    </div>
  )
}
