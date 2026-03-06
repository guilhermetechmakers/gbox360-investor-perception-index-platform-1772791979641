export type UserRole = "Analyst" | "IR" | "Admin"

export interface SignInInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpInput {
  email: string
  password: string
  companyName: string
  userRole: UserRole
  agreeToTOS: boolean
  full_name?: string
  company?: string
  role?: string
  accept_tos?: boolean
}

/** MFA verification input */
export interface MFAVerifyInput {
  code: string
  sessionId?: string
}

export interface AuthResponse {
  user: { id: string; email: string; full_name?: string; role?: string }
  token: string
}

/** Roles that can access admin sections */
export const ADMIN_ROLES = ["PLATFORM_ADMIN", "ENTERPRISE_ADMIN"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export interface CurrentUser {
  id: string
  email: string
  full_name?: string
  role?: string
}
