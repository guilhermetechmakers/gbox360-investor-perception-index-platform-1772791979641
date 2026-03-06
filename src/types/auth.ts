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
  termsVersion?: string
  full_name?: string
  displayName?: string
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
  user?: { id: string; email: string; full_name?: string; role?: string }
  token?: string
  /** When true, client must complete MFA verification before session is granted */
  mfa_required?: boolean
  session_id?: string
}

/** Roles that can access admin sections */
export const ADMIN_ROLES = ["PLATFORM_ADMIN", "ENTERPRISE_ADMIN"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export interface CurrentUser {
  id: string
  email: string
  full_name?: string
  display_name?: string
  role?: string
  roles?: string[]
  mfa_enabled?: boolean
  is_email_verified?: boolean
}

/** MFA setup response with secret and provisioning URI for authenticator app */
export interface MFASetupResponse {
  secret?: string
  provisioning_uri?: string
  qr_code_url?: string
}

/** Verification status from polling API */
export type VerificationStatusValue = "pending" | "verified" | "failed"

export interface VerificationStatusResponse {
  status: VerificationStatusValue
  lastUpdated?: string
  updatedAt?: string
}

export interface ResendVerificationResponse {
  success: boolean
  message?: string
  cooldown?: number
}
