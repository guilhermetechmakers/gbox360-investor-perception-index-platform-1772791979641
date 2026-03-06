import { api } from "@/lib/api"
import type { AuthResponse, SignInInput, SignUpInput } from "@/types/auth"

export const authApi = {
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>("/auth/login", credentials)
    if (data.token) localStorage.setItem("auth_token", data.token)
    return data
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>("/auth/register", credentials)
    if (data.token) localStorage.setItem("auth_token", data.token)
    return data
  },

  signOut: async (): Promise<void> => {
    await api.post("/auth/logout", {}).catch(() => {})
    localStorage.removeItem("auth_token")
  },

  resetPassword: async (email: string): Promise<void> =>
    api.post("/auth/forgot-password", { email }),

  resendVerification: async (): Promise<void> =>
    api.post("/auth/resend-verification", {}),
}
