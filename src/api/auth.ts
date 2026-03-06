import { api } from "@/lib/api"
import type {
  AuthResponse,
  SignInInput,
  SignUpInput,
  MFAVerifyInput,
  VerificationStatusResponse,
  ResendVerificationResponse,
  CurrentUser,
  MFASetupResponse,
} from "@/types/auth"

function normalizeSignUpPayload(credentials: SignUpInput): Record<string, unknown> {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
    company: credentials.companyName.trim(),
    role: credentials.userRole,
    accept_tos: credentials.agreeToTOS,
    terms_version: credentials.termsVersion,
    full_name: credentials.full_name?.trim() ?? credentials.displayName?.trim(),
    display_name: credentials.displayName?.trim(),
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

  /** Request password reset email. POST /auth/password-reset-request */
  passwordResetRequest: async (email: string): Promise<void> =>
    api.post("/auth/password-reset-request", { email: email.trim().toLowerCase() }),

  /** Set new password via token from email. POST /auth/password-reset */
  passwordReset: async (token: string, newPassword: string): Promise<void> =>
    api.post("/auth/password-reset", { token, newPassword }),

  /** Alias for passwordResetRequest (backward compatibility) */
  resetPassword: async (email: string): Promise<void> =>
    api.post("/auth/password-reset-request", { email: email.trim().toLowerCase() }),

  verifyEmail: async (token: string): Promise<{ verified: boolean }> => {
    // Backend may implement GET /auth/verify?token= or GET /auth/verify-email?token=
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

  mfaSetup: async (): Promise<MFASetupResponse> => {
    const data = await api.post<MFASetupResponse>("/auth/mfa/setup", {})
    return data ?? {}
  },

  /** Verify MFA code during enrollment. POST /auth/mfa/verify */
  mfaVerifyEnroll: async (code: string): Promise<{ success?: boolean }> => {
    const data = await api.post<{ success?: boolean }>("/auth/mfa/verify", { code })
    return data ?? {}
  },

  mfaDisable: async (code: string): Promise<void> =>
    api.post("/auth/mfa/disable", { code }),

  /** Verify MFA during login. POST /auth/verify-mfa */
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
      const data = await api.get<{
        id?: string
        email?: string
        full_name?: string
        display_name?: string
        role?: string
        roles?: string[]
        mfa_enabled?: boolean
        is_email_verified?: boolean
      } | null>("/auth/me")
      if (data && typeof data === "object" && typeof data.id === "string" && typeof data.email === "string") {
        const roles = Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : [])
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          display_name: data.display_name,
          role: data.role,
          roles: roles.length > 0 ? roles : undefined,
          mfa_enabled: data.mfa_enabled,
          is_email_verified: data.is_email_verified,
        }
      }
      return null
    } catch {
      return null
    }
  },

  /** Refresh access token using refresh token (cookie or body). POST /auth/refresh */
  refresh: async (): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse & { token?: string }>("/auth/refresh", {})
    const token = data?.token
    if (typeof token === "string" && token) {
      localStorage.setItem("auth_token", token)
    }
    return data ?? {}
  },
}
