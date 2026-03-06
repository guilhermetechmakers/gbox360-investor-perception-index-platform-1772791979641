export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  full_name?: string
  company?: string
  role?: string
  accept_tos?: boolean
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
