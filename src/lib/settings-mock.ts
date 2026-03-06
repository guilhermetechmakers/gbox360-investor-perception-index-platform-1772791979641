/**
 * Settings mock data for dev when backend is unavailable.
 * Used with null-safe access: data ?? [].
 */

import type {
  UserProfile,
  NotificationPreference,
  ApiKey,
  DataRefreshPreference,
  TeamMember,
  Session,
  SettingsPayload,
} from "@/types/settings"

const mockProfile: UserProfile = {
  id: "usr-1",
  name: "Jane Analyst",
  email: "jane@example.com",
  timezone: "America/New_York",
  language: "en",
  roles: ["Analyst"],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-03-01T14:30:00Z",
}

const mockNotifications: NotificationPreference[] = [
  {
    id: "notif-1",
    userId: "usr-1",
    channel: "email",
    enabled: true,
    frequency: "instant",
  },
  {
    id: "notif-2",
    userId: "usr-1",
    channel: "webhook",
    enabled: false,
    frequency: "instant",
    webhookUrl: "",
  },
  {
    id: "notif-3",
    userId: "usr-1",
    channel: "in-app",
    enabled: true,
    frequency: "instant",
  },
]

const mockApiKeys: ApiKey[] = [
  {
    id: "key-1",
    userId: "usr-1",
    label: "Production API",
    maskedKey: "gbox_••••••••••••••••••••••••••••••••••••••••",
    createdAt: "2024-02-01T09:00:00Z",
    lastUsed: "2024-03-05T16:22:00Z",
    active: true,
    scopes: ["read:ipi", "read:companies"],
  },
]

const mockDataRefresh: DataRefreshPreference = {
  id: "dr-1",
  userId: "usr-1",
  cadenceMs: 300000, // 5 min
  lastRefresh: "2024-03-06T08:00:00Z",
  batchProcessingEnabled: false,
}

const mockTeamMembers: TeamMember[] = [
  {
    tenantId: "tnt-1",
    userId: "usr-1",
    email: "jane@example.com",
    name: "Jane Analyst",
    role: "admin",
    invitedAt: "2024-01-15T10:00:00Z",
    status: "active",
  },
  {
    tenantId: "tnt-1",
    userId: "usr-2",
    email: "bob@example.com",
    name: "Bob Smith",
    role: "editor",
    invitedAt: "2024-02-10T14:00:00Z",
    status: "active",
  },
]

const mockSessions: Session[] = [
  {
    sessionId: "sess-1",
    userId: "usr-1",
    device: "Chrome on macOS",
    ip: "192.168.1.1",
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    sessionId: "sess-2",
    userId: "usr-1",
    device: "Safari on iPhone",
    ip: "192.168.1.2",
    lastActive: "2024-03-05T18:00:00Z",
    current: false,
  },
]

export const mockSettingsPayload: SettingsPayload = {
  profile: mockProfile,
  notifications: mockNotifications,
  apiKeys: mockApiKeys,
  dataRefresh: mockDataRefresh,
  team: mockTeamMembers,
  sessions: mockSessions,
}

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
] as const

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const

export const CADENCE_OPTIONS = [
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
  { value: 900000, label: "15 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
] as const
