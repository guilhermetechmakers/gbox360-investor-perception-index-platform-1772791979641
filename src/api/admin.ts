/**
 * Admin API — dashboard health, tenants, audit logs, users, replays.
 * All responses consumed with data ?? [] or Array.isArray checks.
 * Uses mock fallbacks when API is unavailable (e.g. dev without backend).
 */

import { api } from "@/lib/api"
import {
  mockDashboardHealth,
  mockAuditLogs,
  mockUsers,
} from "@/lib/admin-mock"
import type {
  AuditLogsParams,
  AuditLogsResponse,
  DashboardHealth,
  Payload,
  Replay,
  Tenant,
  AdminUser,
  InviteUserInput,
} from "@/types/admin"

const safeArray = <T>(data: T[] | null | undefined): T[] =>
  Array.isArray(data) ? data : []

export const adminApi = {
  checkAccess: async (): Promise<{ allowed: boolean; roles?: string[] }> => {
    try {
      const data = await api.get<{ allowed: boolean; roles?: string[] }>(
        "/admin/check-access"
      )
      return data ?? { allowed: false }
    } catch {
      const hasToken = !!localStorage.getItem("auth_token")
      if (import.meta.env.DEV && hasToken) {
        return { allowed: true, roles: ["PLATFORM_ADMIN"] }
      }
      return { allowed: false }
    }
  },

  getDashboardHealth: async (): Promise<DashboardHealth> => {
    try {
      const res = await api.get<DashboardHealth | { health?: unknown; tenants?: Tenant[]; alerts?: unknown[] }>(
        "/admin/dashboard-health"
      )
      const d = res as DashboardHealth
      if (d?.health && Array.isArray(d.tenants)) {
        return {
          health: d.health,
          tenants: d.tenants,
          alerts: safeArray(d.alerts),
        }
      }
    } catch {
      /* fall through to mock */
    }
    return mockDashboardHealth
  },

  getTenants: async (): Promise<Tenant[]> => {
    try {
      const res = await api.get<{ tenants?: Tenant[] } | Tenant[]>("/admin/tenants")
      const raw = (res as { tenants?: Tenant[] })?.tenants ?? (res as Tenant[])
      return safeArray(raw)
    } catch {
      return mockDashboardHealth.tenants
    }
  },

  getAuditLogs: async (params: AuditLogsParams = {}): Promise<AuditLogsResponse> => {
    try {
      const q = new URLSearchParams()
      if (params.tenantId) q.set("tenantId", params.tenantId)
      if (params.eventType) q.set("eventType", params.eventType)
      if (params.start) q.set("start", params.start)
      if (params.end) q.set("end", params.end)
      if (params.page != null) q.set("page", String(params.page))
      if (params.pageSize != null) q.set("pageSize", String(params.pageSize))
      const query = q.toString()
      const res = await api.get<AuditLogsResponse | { data?: unknown[]; items?: unknown[] }>(
        `/admin/audit-logs${query ? `?${query}` : ""}`
      )
      const r = res as AuditLogsResponse & { data?: unknown[] }
      const items = safeArray(r?.items ?? r?.data)
      if (items.length > 0 || (r?.count !== undefined && r?.count === 0)) {
        return {
          items,
          count: r?.count ?? items.length,
          page: r?.page ?? params.page ?? 1,
          pageSize: r?.pageSize ?? params.pageSize ?? 25,
        }
      }
    } catch {
      /* fall through to mock */
    }
    return mockAuditLogs
  },

  getAuditLogPayload: async (id: string): Promise<Payload | null> => {
    try {
      const res = await api.get<Payload | { data?: Payload }>(`/admin/audit-logs/${id}/payload`)
      const data = (res as { data?: Payload })?.data ?? (res as Payload)
      if (data) return data
    } catch {
      /* fall through to mock */
    }
    return {
      id,
      payloadRef: `evt-${id}`,
      data: JSON.stringify(
        { event_id: id, message: "Sample raw payload (mock)", checksum: "...", s3_key: "..." },
        null,
        2
      ),
      createdAt: new Date().toISOString(),
    }
  },

  getUsers: async (tenantId: string): Promise<AdminUser[]> => {
    try {
      const res = await api.get<{ users?: AdminUser[] } | AdminUser[]>(
        `/admin/users?tenantId=${encodeURIComponent(tenantId)}`
      )
      const raw = (res as { users?: AdminUser[] })?.users ?? (res as AdminUser[])
      return safeArray(raw)
    } catch {
      return (mockUsers[tenantId] as AdminUser[]) ?? []
    }
  },

  inviteUser: async (input: InviteUserInput): Promise<{ id: string }> => {
    const res = await api.post<{ id: string }>("/admin/users/invite", input)
    return res ?? { id: "" }
  },

  deactivateUser: async (id: string): Promise<void> => {
    await api.post(`/admin/users/${id}/deactivate`, {})
  },

  reactivateUser: async (id: string): Promise<void> => {
    await api.post(`/admin/users/${id}/reactivate`, {})
  },

  triggerReplay: async (id: string): Promise<Replay> => {
    const res = await api.post<Replay>(`/admin/replays/${id}/trigger`, {})
    return res ?? { id, targetEventId: "", status: "PENDING", createdAt: "", updatedAt: "" }
  },

  getReplayStatus: async (id: string): Promise<Replay> => {
    const res = await api.get<Replay>(`/admin/replays/${id}/status`)
    return res ?? { id, targetEventId: "", status: "PENDING", createdAt: "", updatedAt: "" }
  },
}
