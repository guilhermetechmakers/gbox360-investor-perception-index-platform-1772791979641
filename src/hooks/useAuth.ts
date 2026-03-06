import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { toast } from "sonner"
import { ADMIN_ROLES, type CurrentUser, type MFAVerifyInput } from "@/types/auth"

export const authKeys = {
  user: ["auth", "user"] as const,
  me: ["auth", "me"] as const,
}

export function useCurrentUser(): {
  user: CurrentUser | null
  isAdmin: boolean
  isLoading: boolean
} {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("auth_token")
  const { data: user, isLoading } = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.getMe,
    enabled: hasToken,
    staleTime: 1000 * 60 * 5,
  })
  const role = user?.role ?? ""
  const isAdmin = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])
  return {
    user: user ?? null,
    isAdmin,
    isLoading: hasToken && isLoading,
  }
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user })
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Signed in successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Sign in failed")
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: () => {
      toast.success("Account created. Please verify your email.")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Sign up failed")
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.clear()
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Signed out")
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.passwordResetRequest(email),
    onSuccess: () => toast.success("Password reset email sent. Check your inbox."),
    onError: (error: Error) => toast.error(error.message ?? "Failed to send reset email"),
  })
}

export function useResetPasswordSet() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.passwordReset(token, newPassword),
    onSuccess: () => toast.success("Password reset successfully. You can now log in."),
    onError: (error: Error) => toast.error(error.message ?? "Failed to reset password"),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload?: { userId?: string; email?: string }) => authApi.resendVerification(payload),
    onSuccess: (data) => {
      const msg = data?.message ?? "Verification email sent"
      if (data?.success !== false) {
        toast.success(data?.cooldown ? `${msg} You can resend again in ${data.cooldown}s.` : msg)
      } else {
        toast.info(msg)
      }
    },
    onError: (error: Error) => toast.error(error.message ?? "Failed to resend"),
  })
}

export function useVerificationStatus(userId?: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  const enabled = options?.enabled ?? true
  const interval = options?.refetchInterval ?? 15000
  return useQuery({
    queryKey: [...authKeys.me, "verification-status", userId ?? "me"] as const,
    queryFn: () => authApi.getVerificationStatus(userId),
    enabled,
    refetchInterval: interval,
    staleTime: 5000,
  })
}

export function useVerifyMfa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MFAVerifyInput) => authApi.verifyMfa(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user })
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("MFA verified successfully")
    },
    onError: (error: Error) => toast.error(error.message ?? "MFA verification failed"),
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => toast.success("Email verified successfully"),
    onError: (error: Error) => toast.error(error.message ?? "Verification failed"),
  })
}

export function useMfaSetup() {
  return useMutation({
    mutationFn: () => authApi.mfaSetup(),
    onError: (error: Error) => toast.error(error.message ?? "MFA setup failed"),
  })
}

export function useMfaVerifyEnroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => authApi.mfaVerifyEnroll(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Two-factor authentication enabled")
    },
    onError: (error: Error) => toast.error(error.message ?? "MFA verification failed"),
  })
}

export function useMfaDisable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => authApi.mfaDisable(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Two-factor authentication disabled")
    },
    onError: (error: Error) => toast.error(error.message ?? "Failed to disable MFA"),
  })
}
