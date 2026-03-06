/**
 * User Profile feature — data models.
 * All list fields consumed with data ?? [] or Array.isArray checks.
 */

export type ProfileRole = "admin" | "member" | "viewer" | string

export interface UserProfileMe {
  id: string
  tenant_id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  timezone: string
  locale: string
  role: ProfileRole
  is_active: boolean
  is_sso_enabled: boolean
  last_login_at: string | null
  organization?: string
}

export interface ActivityItem {
  id: string
  user_id: string
  action_type: string
  description: string
  timestamp: string
  metadata: Record<string, unknown> | null
}

export interface InvitationItem {
  id: string
  tenant_id: string
  email: string
  role: string
  status: "pending" | "accepted" | "revoked"
  created_at: string
  invited_by: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  invited_at?: string
  status?: "invited" | "active" | "disabled"
}

export interface ProfileUpdatePayload {
  name?: string
  phone?: string | null
  timezone?: string
  locale?: string
  organization?: string
  notification_preferences?: Record<string, boolean>
  email_visibility?: "team" | "private"
}

export interface ActivityExportResponse {
  url?: string
  blob?: Blob
}
