import { api } from "@/lib/api"
import type {
  AuthResponse,
  SignInInput,
  SignUpInput,
  MFAVerifyInput,
  VerificationStatusResponse,
  ResendVerificationResponse,
  CurrentUser,
} from "@/types/auth"

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
    const token = data?.token
    if (typeof token === "string" && token) {
      localStorage.setItem("auth_token", token)
    }
    return data ?? {}
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const payload = normalizeSignUpPayload(credentials)
    const data = await api.post<AuthResponse>("/auth/register", payload)
    const token = data?.token
    if (typeof token === "string" && token) {
      localStorage.setItem("auth_token", token)
    }
    return data ?? {}
  },

  signOut: async (): Promise<void> => {
    await api.post("/auth/logout", {}).catch(() => {})
    localStorage.removeItem("auth_token")
  },

  resetPassword: async (email: string): Promise<void> =>
    api.post("/auth/password-reset", { email: email.trim().toLowerCase() }),

  verifyEmail: async (token: string): Promise<{ verified: boolean }> => {
    const data = await api.get<{ verified?: boolean }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return { verified: data?.verified === true }
  },

  getVerificationStatus: async (userId?: string): Promise<VerificationStatusResponse> => {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : ""
    const data = await api.get<VerificationStatusResponse>(`/auth/verification-status${params}`)
    const status = data?.status
    const validStatus = status === "pending" || status === "verified" || status === "failed" ? status : "pending"
    return {
      status: validStatus,
      updatedAt: data?.updatedAt ?? data?.lastUpdated,
    }
  },

  resendVerification: async (payload?: { userId?: string; email?: string }): Promise<ResendVerificationResponse> => {
    const body = payload ?? {}
    const data = await api.post<ResendVerificationResponse>("/auth/resend-verification", body)
    return {
      success: data?.success !== false,
      message: data?.message,
      cooldown: typeof data?.cooldown === "number" ? data.cooldown : undefined,
    }
  },

  verifyMfa: async (input: MFAVerifyInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>("/auth/verify-mfa", input)
    const token = data?.token
    if (typeof token === "string" && token) {
      localStorage.setItem("auth_token", token)
    }
    return data ?? {}
  },

  initiateSSO: async (): Promise<{ url?: string }> =>
    api.post<{ url?: string }>("/auth/sso", {}),

  getMe: async (): Promise<CurrentUser | null> => {
    try {
      const data = await api.get<{ id?: string; email?: string; full_name?: string; role?: string } | null>("/auth/me")
      if (data && typeof data === "object" && typeof data.id === "string" && typeof data.email === "string") {
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        }
      }
      return null
    } catch {
      return null
    }
  },
}
