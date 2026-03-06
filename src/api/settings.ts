import { api } from "@/lib/api"
import { mockSettingsPayload, TIMEZONES, LANGUAGES, CADENCE_OPTIONS } from "@/lib/settings-mock"
import type {
  SettingsPayload,
  UserProfile,
  NotificationPreference,
  ApiKey,
  DataRefreshPreference,
  TeamMember,
  Session,
  ProfileUpdateInput,
  ApiKeyCreateInput,
  ApiKeyCreateResponse,
  DataRefreshUpdateInput,
  TeamInviteInput,
} from "@/types/settings"

function normalizePayload(data: unknown): SettingsPayload | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  const profile = d.profile
  const notifications = d.notifications
  const apiKeys = d.apiKeys
  const dataRefresh = d.dataRefresh
  const team = d.team
  const sessions = d.sessions

  const safeProfile =
    profile && typeof profile === "object" && typeof (profile as Record<string, unknown>).id === "string"
      ? (profile as UserProfile)
      : null
  if (!safeProfile) return null

  const safeNotifications = Array.isArray(notifications) ? (notifications as NotificationPreference[]) : []
  const safeApiKeys = Array.isArray(apiKeys) ? (apiKeys as ApiKey[]) : []
  const safeDataRefresh =
    dataRefresh && typeof dataRefresh === "object" && typeof (dataRefresh as Record<string, unknown>).id === "string"
      ? (dataRefresh as DataRefreshPreference)
      : null
  const safeTeam = Array.isArray(team) ? (team as TeamMember[]) : []
  const safeSessions = Array.isArray(sessions) ? (sessions as Session[]) : []

  return {
    profile: safeProfile,
    notifications: safeNotifications,
    apiKeys: safeApiKeys,
    dataRefresh: safeDataRefresh,
    team: safeTeam,
    sessions: safeSessions,
  }
}

async function mockDelay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

export const settingsApi = {
  getSettings: async (): Promise<SettingsPayload> => {
    try {
      const data = await api.get<SettingsPayload | Record<string, unknown>>("/settings")
      const normalized = normalizePayload(data)
      if (normalized) return normalized
      throw new Error("Invalid settings response")
    } catch {
      await mockDelay(400)
      return mockSettingsPayload
    }
  },

  updateProfile: async (payload: ProfileUpdateInput): Promise<UserProfile> => {
    try {
      const data = await api.put<UserProfile>("/settings/profile", payload)
      if (data && typeof data.id === "string") return data
      throw new Error("Invalid profile response")
    } catch {
      await mockDelay(300)
      return {
        ...mockSettingsPayload.profile!,
        ...payload,
        updatedAt: new Date().toISOString(),
      } as UserProfile
    }
  },

  updateNotifications: async (payload: {
    preferences: Array<{
      channel: string
      enabled: boolean
      frequency?: string
      webhookUrl?: string
    }>
  }): Promise<NotificationPreference[]> => {
    try {
      const data = await api.put<NotificationPreference[] | { preferences?: NotificationPreference[] }>(
        "/settings/notifications",
        payload
      )
      const prefs = Array.isArray(data) ? data : (data as { preferences?: NotificationPreference[] })?.preferences
      if (Array.isArray(prefs)) return prefs
      throw new Error("Invalid notifications response")
    } catch {
      await mockDelay(300)
      return mockSettingsPayload.notifications ?? []
    }
  },

  createApiKey: async (payload: ApiKeyCreateInput): Promise<ApiKeyCreateResponse> => {
    try {
      const data = await api.post<ApiKeyCreateResponse>("/settings/api-keys", payload)
      if (data && typeof data.id === "string" && typeof data.maskedKey === "string") return data
      throw new Error("Invalid API key response")
    } catch {
      await mockDelay(300)
      const id = `key-${Date.now()}`
      return {
        id,
        label: payload.label,
        maskedKey: "gbox_••••••••••••••••••••••••••••••••••••••••",
        secret: `gbox_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`,
      }
    }
  },

  rotateApiKey: async (id: string): Promise<{ maskedKey: string; secret: string }> => {
    try {
      const data = await api.post<{ maskedKey: string; secret: string }>(`/settings/api-keys/${id}/rotate`, {})
      if (data && typeof data.maskedKey === "string" && typeof data.secret === "string") return data
      throw new Error("Invalid rotate response")
    } catch {
      await mockDelay(300)
      return {
        maskedKey: "gbox_••••••••••••••••••••••••••••••••••••••••",
        secret: `gbox_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`,
      }
    }
  },

  revokeApiKey: async (id: string): Promise<void> => {
    try {
      await api.delete(`/settings/api-keys/${id}`)
    } catch {
      await mockDelay(200)
    }
  },

  updateDataRefresh: async (payload: DataRefreshUpdateInput): Promise<DataRefreshPreference> => {
    try {
      const data = await api.put<DataRefreshPreference>("/settings/data-refresh", payload)
      if (data && typeof data.id === "string") return data
      throw new Error("Invalid data refresh response")
    } catch {
      await mockDelay(300)
      return {
        ...(mockSettingsPayload.dataRefresh ?? {}),
        id: "dr-1",
        userId: mockSettingsPayload.profile?.id ?? "usr-1",
        cadenceMs: payload.cadenceMs,
        lastRefresh: new Date().toISOString(),
        batchProcessingEnabled: payload.batchProcessingEnabled,
      } as DataRefreshPreference
    }
  },

  getTeam: async (): Promise<TeamMember[]> => {
    try {
      const data = await api.get<TeamMember[] | { items?: TeamMember[] }>("/settings/team")
      const items = Array.isArray(data) ? data : (data as { items?: TeamMember[] })?.items
      return Array.isArray(items) ? items : []
    } catch {
      await mockDelay(300)
      return mockSettingsPayload.team ?? []
    }
  },

  inviteTeamMember: async (payload: TeamInviteInput): Promise<TeamMember> => {
    try {
      const data = await api.post<TeamMember>("/settings/team/invite", payload)
      if (data && typeof data.userId === "string") return data
      throw new Error("Invalid invite response")
    } catch {
      await mockDelay(400)
      return {
        tenantId: "tnt-1",
        userId: `usr-${Date.now()}`,
        email: payload.email,
        role: payload.role,
        invitedAt: new Date().toISOString(),
        status: "invited",
      }
    }
  },

  updateTeamRole: async (userId: string, role: string): Promise<TeamMember> => {
    try {
      const data = await api.post<TeamMember>(`/settings/team/${userId}/role`, { role })
      if (data && typeof data.userId === "string") return data
      throw new Error("Invalid role update response")
    } catch {
      await mockDelay(300)
      const members = mockSettingsPayload.team ?? []
      const m = members.find((x) => x.userId === userId) ?? members[0]
      return m ? { ...m, role: role as TeamMember["role"] } : members[0]!
    }
  },

  removeTeamMember: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/settings/team/${userId}`)
    } catch {
      await mockDelay(200)
    }
  },

  getSessions: async (): Promise<Session[]> => {
    try {
      const data = await api.get<Session[] | { sessions?: Session[] }>("/settings/sessions")
      const sessions = Array.isArray(data) ? data : (data as { sessions?: Session[] })?.sessions
      return Array.isArray(sessions) ? sessions : []
    } catch {
      await mockDelay(200)
      return mockSettingsPayload.sessions ?? []
    }
  },

  terminateOtherSessions: async (): Promise<void> => {
    try {
      await api.post("/settings/sessions/terminate", {})
    } catch {
      await mockDelay(300)
    }
  },
}

export { TIMEZONES, LANGUAGES, CADENCE_OPTIONS }
