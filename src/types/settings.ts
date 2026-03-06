/**
 * Settings & Preferences data models.
 * All list fields consumed with data ?? [] or Array.isArray checks.
 */

export type NotificationChannel = "email" | "webhook" | "in-app"
export type NotificationFrequency = "instant" | "daily" | "weekly"
export type TeamRole = "owner" | "admin" | "editor" | "viewer"
export type TeamMemberStatus = "invited" | "active" | "disabled"

export interface UserProfile {
  id: string
  name: string
  email: string
  timezone: string
  language: string
  roles: string[]
  createdAt?: string
  updatedAt?: string
}

export interface NotificationPreference {
  id: string
  userId: string
  channel: NotificationChannel
  enabled: boolean
  frequency: NotificationFrequency
  webhookUrl?: string
}

/** Delivery window: only send notifications between start and end (local time). */
export interface DeliveryWindow {
  start: string
  end: string
}

/** Muted notifications: do not send until this timestamp (ISO). */
export interface MutedNotifications {
  until?: string
  channels?: NotificationChannel[]
}

export interface ApiKey {
  id: string
  userId: string
  label: string
  maskedKey: string
  createdAt: string
  lastUsed?: string
  active: boolean
  scopes: string[]
}

export interface DataRefreshPreference {
  id: string
  userId: string
  cadenceMs: number
  lastRefresh?: string
  batchProcessingEnabled?: boolean
}

export interface TeamMember {
  tenantId: string
  userId: string
  email: string
  name?: string
  role: TeamRole
  invitedAt: string
  status: TeamMemberStatus
}

export interface Session {
  sessionId: string
  userId: string
  device: string
  ip: string
  lastActive: string
  current?: boolean
}

export interface SettingsPayload {
  profile: UserProfile | null
  notifications: NotificationPreference[]
  apiKeys: ApiKey[]
  dataRefresh: DataRefreshPreference | null
  team?: TeamMember[]
  sessions?: Session[]
  deliveryWindow?: DeliveryWindow | null
  mutedNotifications?: MutedNotifications | null
}

export interface ProfileUpdateInput {
  name?: string
  timezone?: string
  language?: string
}

export interface NotificationUpdateInput {
  channel: NotificationChannel
  enabled: boolean
  frequency?: NotificationFrequency
  webhookUrl?: string
}

export interface DeliveryWindowUpdateInput {
  start: string
  end: string
}

export interface MutedNotificationsUpdateInput {
  until?: string
  channels?: NotificationChannel[]
}

export interface ApiKeyCreateInput {
  label: string
  scopes?: string[]
}

export interface ApiKeyCreateResponse {
  id: string
  label: string
  maskedKey: string
  secret?: string
}

export interface DataRefreshUpdateInput {
  cadenceMs: number
  batchProcessingEnabled?: boolean
}

export interface TeamInviteInput {
  email: string
  role: TeamRole
}
