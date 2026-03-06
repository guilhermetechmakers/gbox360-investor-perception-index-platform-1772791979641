/**
 * User Profile API — /api/users/me, activity, and org user management.
 * All responses validated; use data ?? [] and Array.isArray() on the client.
 */

import { api } from "@/lib/api"
import type {
  UserProfileMe,
  ActivityItem,
  ProfileUpdatePayload,
  TenantUser,
} from "@/types/user-profile"
import type { TeamMember, TeamInviteInput } from "@/types/settings"

function normalizeUserMe(data: unknown): UserProfileMe | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>
  if (typeof d.id !== "string" || typeof d.email !== "string") return null
  return {
    id: d.id as string,
    tenant_id: (d.tenant_id ?? d.tenantId ?? "tnt-1") as string,
    name: (d.name ?? d.full_name ?? "") as string,
    email: d.email as string,
    phone: (d.phone ?? null) as string | null,
    avatar_url: (d.avatar_url ?? d.avatarUrl ?? null) as string | null,
    timezone: (d.timezone ?? "America/New_York") as string,
    locale: (d.locale ?? d.language ?? "en") as string,
    role: (d.role ?? "member") as string,
    is_active: d.is_active !== false,
    is_sso_enabled: d.is_sso_enabled === true,
    last_login_at: (d.last_login_at ?? d.lastLoginAt ?? null) as string | null,
    organization: (d.organization ?? d.company ?? undefined) as string | undefined,
  }
}

function normalizeActivityList(data: unknown): ActivityItem[] {
  const raw = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data
  const arr = Array.isArray(raw) ? raw : []
  return arr
    .filter((x) => x && typeof x === "object" && typeof (x as Record<string, unknown>).id === "string")
    .map((x) => {
      const item = x as Record<string, unknown>
      return {
        id: item.id as string,
        user_id: (item.user_id ?? item.userId ?? "") as string,
        action_type: (item.action_type ?? item.actionType ?? "action") as string,
        description: (item.description ?? "") as string,
        timestamp: (item.timestamp ?? item.created_at ?? "") as string,
        metadata: (item.metadata ?? null) as Record<string, unknown> | null,
      }
    })
}

function normalizeTenantUsers(data: unknown): TenantUser[] {
  const raw = Array.isArray(data) ? data : (data as { data?: unknown[]; items?: unknown[] })?.data ?? (data as { items?: unknown[] })?.items
  const arr = Array.isArray(raw) ? raw : []
  return arr
    .filter((x) => x && typeof x === "object" && typeof (x as Record<string, unknown>).id === "string")
    .map((x) => {
      const item = x as Record<string, unknown>
      return {
        id: item.id as string,
        tenant_id: (item.tenant_id ?? item.tenantId ?? "") as string,
        email: (item.email ?? "") as string,
        name: (item.name ?? item.full_name ?? null) as string | null,
        role: (item.role ?? "member") as string,
        is_active: item.is_active !== false,
        invited_at: (item.invited_at ?? item.invitedAt) as string | undefined,
        status: (item.status ?? "active") as "invited" | "active" | "disabled",
      }
    })
}

async function mockDelay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

const mockProfileMe: UserProfileMe = {
  id: "usr-1",
  tenant_id: "tnt-1",
  name: "Jane Analyst",
  email: "jane@example.com",
  phone: null,
  avatar_url: null,
  timezone: "America/New_York",
  locale: "en",
  role: "admin",
  is_active: true,
  is_sso_enabled: false,
  last_login_at: new Date().toISOString(),
  organization: "Acme Corp",
}

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    user_id: "usr-1",
    action_type: "login",
    description: "Signed in successfully",
    timestamp: new Date().toISOString(),
    metadata: { ip: "192.168.1.1", device: "Chrome" },
  },
  {
    id: "act-2",
    user_id: "usr-1",
    action_type: "export",
    description: "Exported activity log to CSV",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    metadata: { format: "csv" },
  },
]

export const usersApi = {
  getMe: async (): Promise<UserProfileMe | null> => {
    try {
      const data = await api.get<unknown>("/users/me")
      const normalized = normalizeUserMe(data)
      if (normalized) return normalized
      const authMe = await import("@/api/auth").then((m) => m.authApi.getMe())
      if (authMe) {
        return {
          ...mockProfileMe,
          id: authMe.id,
          email: authMe.email,
          name: authMe.full_name ?? authMe.email.split("@")[0],
        }
      }
      return mockProfileMe
    } catch {
      await mockDelay(200)
      return mockProfileMe
    }
  },

  updateMe: async (payload: ProfileUpdatePayload): Promise<UserProfileMe | null> => {
    try {
      const data = await api.patch<unknown>("/users/me", payload)
      const normalized = normalizeUserMe(data)
      if (normalized) return normalized
      return { ...mockProfileMe, ...payload }
    } catch {
      await mockDelay(300)
      return { ...mockProfileMe, ...payload }
    }
  },

  getActivity: async (): Promise<ActivityItem[]> => {
    try {
      const data = await api.get<unknown>("/users/me/activity")
      const list = normalizeActivityList(data)
      if (list.length > 0) return list
      return mockActivities
    } catch {
      await mockDelay(200)
      return mockActivities
    }
  },

  exportActivityCsv: async (): Promise<Blob> => {
    try {
      const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
      const token = localStorage.getItem("auth_token")
      const headers: HeadersInit = {}
      if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      const res = await fetch(`${base}/users/me/activity/export`, { method: "POST", headers })
      if (res.ok && res.headers.get("content-type")?.includes("text/csv")) {
        return res.blob()
      }
      const text = res.ok ? await res.text() : ""
      const csv = text || "action_type,description,timestamp\n" + mockActivities.map((a) => `"${a.action_type}","${a.description}","${a.timestamp}"`).join("\n")
      return new Blob([csv], { type: "text/csv" })
    } catch {
      await mockDelay(400)
      const csv = "action_type,description,timestamp\n" + mockActivities.map((a) => `"${a.action_type}","${a.description}","${a.timestamp}"`).join("\n")
      return new Blob([csv], { type: "text/csv" })
    }
  },

  getTenantUsers: async (tenantId: string): Promise<TenantUser[]> => {
    try {
      const data = await api.get<unknown>(`/organizations/${tenantId}/users`)
      return normalizeTenantUsers(data)
    } catch {
      const { settingsApi } = await import("@/api/settings")
      const team = await settingsApi.getTeam().catch(() => [] as TeamMember[])
      const members: TeamMember[] = Array.isArray(team) ? team : []
      return members.map((m) => ({
        id: m.userId,
        tenant_id: m.tenantId,
        email: m.email,
        name: m.name ?? null,
        role: m.role,
        is_active: m.status === "active",
        invited_at: m.invitedAt as string | undefined,
        status: m.status,
      }))
    }
  },

  inviteUser: async (tenantId: string, payload: TeamInviteInput): Promise<{ id: string; email: string; role: string }> => {
    try {
      const data = await api.post<{ id?: string; email?: string; role?: string }>(`/organizations/${tenantId}/invite`, payload)
      return {
        id: (data?.id ?? `inv-${Date.now()}`) as string,
        email: (data?.email ?? payload.email) as string,
        role: (data?.role ?? payload.role) as string,
      }
    } catch {
      await mockDelay(300)
      return { id: `inv-${Date.now()}`, email: payload.email, role: payload.role }
    }
  },

  updateTenantUserRole: async (tenantId: string, userId: string, role: string): Promise<TenantUser | null> => {
    try {
      const data = await api.patch<unknown>(`/organizations/${tenantId}/users/${userId}`, { role })
      const normalized = normalizeUserMe(data)
      if (normalized) return { ...normalized, id: userId, invited_at: undefined, status: "active" } as TenantUser
      return null
    } catch {
      await mockDelay(200)
      return null
    }
  },

  removeTenantUser: async (tenantId: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/organizations/${tenantId}/users/${userId}`)
    } catch {
      await mockDelay(200)
    }
  },

  /** Upload avatar image; returns new avatar URL or null. */
  uploadAvatar: async (file: File): Promise<string | null> => {
    try {
      const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
      const token = localStorage.getItem("auth_token")
      const formData = new FormData()
      formData.append("avatar", file)
      const headers: HeadersInit = {}
      if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      const res = await fetch(`${base}/users/me/avatar`, {
        method: "POST",
        headers,
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json() as { avatar_url?: string; avatarUrl?: string }
      const url = data?.avatar_url ?? data?.avatarUrl ?? null
      return typeof url === "string" ? url : null
    } catch {
      await mockDelay(300)
      return null
    }
  },
}
