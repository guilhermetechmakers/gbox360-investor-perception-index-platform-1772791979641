import { api } from "@/lib/api"
import type { AuthResponse, SignInInput, SignUpInput, MFAVerifyInput } from "@/types/auth"

function normalizeSignUpPayload(credentials: SignUpInput): Record<string, unknown> {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
    company: credentials.companyName.trim(),
    role: credentials.userRole,
    accept_tos: credentials.agreeToTOS,
    full_name: credentials.full_name?.trim(),
  }
}

export const authApi = {
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      remember_me: credentials.rememberMe ?? false,
    }
    const data = await api.post<AuthResponse>("/auth/login", payload)
    if (data?.token) localStorage.setItem("auth_token", data.token)
    return data
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const payload = normalizeSignUpPayload(credentials)
    const data = await api.post<AuthResponse>("/auth/register", payload)
    if (data?.token) localStorage.setItem("auth_token", data.token)
    return data
  },

  signOut: async (): Promise<void> => {
    await api.post("/auth/logout", {}).catch(() => {})
    localStorage.removeItem("auth_token")
  },

  resetPassword: async (email: string): Promise<void> =>
    api.post("/auth/password-reset", { email: email.trim().toLowerCase() }),

  verifyEmail: async (token: string): Promise<{ verified: boolean }> =>
    api.get<{ verified: boolean }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: async (): Promise<void> =>
    api.post("/auth/resend-verification", {}),

  verifyMfa: async (input: MFAVerifyInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>("/auth/verify-mfa", input)
    if (data?.token) localStorage.setItem("auth_token", data.token)
    return data
  },

  initiateSSO: async (): Promise<{ url?: string }> =>
    api.post<{ url?: string }>("/auth/sso", {}),

  getMe: async (): Promise<{ id: string; email: string; full_name?: string; role?: string } | null> => {
    try {
      const data = await api.get<{ id: string; email: string; full_name?: string; role?: string }>("/auth/me")
      return data ?? null
    } catch {
      return null
    }
  },
}
