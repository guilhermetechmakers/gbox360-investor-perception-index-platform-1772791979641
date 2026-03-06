import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { toast } from "sonner"
import { ADMIN_ROLES, type CurrentUser } from "@/types/auth"

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

export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => toast.success("Verification email sent"),
    onError: (error: Error) => toast.error(error.message ?? "Failed to resend"),
  })
}
