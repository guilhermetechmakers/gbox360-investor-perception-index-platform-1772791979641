import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { toast } from "sonner"

export const authKeys = {
  user: ["auth", "user"] as const,
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user })
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
