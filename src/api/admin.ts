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
  mockReplayHealth,
  mockReplayJobs,
  mockAuditLogsPreview,
  getMockPreflight,
} from "@/lib/admin-mock"
import type {
  AuditLog,
  AuditLogsParams,
  AuditLogsResponse,
  AuditLogExportParams,
  AuditLogExportResponse,
  DashboardHealth,
  Payload,
  Replay,
  Tenant,
  AdminUser,
  InviteUserInput,
  ReplayHealth,
  PreflightResult,
  ReplayJob,
  ReplayMode,
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
      if (params.actor) q.set("actor", params.actor)
      if (params.search) q.set("search", params.search)
      if (params.start) q.set("startDate", params.start)
      if (params.end) q.set("endDate", params.end)
      if (params.retentionStatus) q.set("retentionStatus", params.retentionStatus)
      if (params.page != null) q.set("page", String(params.page))
      if (params.pageSize != null) q.set("pageSize", String(params.pageSize))
      const eventTypes = params.eventTypes ?? []
      if (Array.isArray(eventTypes) && eventTypes.length > 0) {
        eventTypes.forEach((t) => q.append("eventTypes", t))
      }
      const query = q.toString()
      const res = await api.get<AuditLogsResponse | { data?: unknown[]; items?: unknown[] }>(
        `/admin/audit-logs${query ? `?${query}` : ""}`
      )
      const r = res as AuditLogsResponse & { data?: unknown[]; items?: unknown[] }
      const rawItems = safeArray(r?.items ?? r?.data)
      const items = rawItems as AuditLog[]
      if (items.length > 0 || (r?.count !== undefined && r?.count === 0)) {
        return {
          data: items,
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

  exportAuditLogs: async (params: AuditLogExportParams = {}): Promise<AuditLogExportResponse> => {
    try {
      const res = await api.post<{ url?: string }>("/admin/audit-logs/export", params)
      if (res?.url) return { url: res.url }
    } catch (err) {
      /* fall through to mock */
    }
    // Mock: generate CSV from mock data for dev/demo
    const { items } = mockAuditLogs
    const headers = ["id", "timestamp", "event_type", "actor", "tenant", "event_id", "payload_id", "description", "retention_status"]
    const rows = (items ?? []).map((log) => [
      log.id,
      log.timestamp ?? "",
      (log.event_type ?? log.eventType ?? "").replace(/_/g, " "),
      log.actor_email ?? log.actor ?? "",
      log.tenant_name ?? log.tenantId ?? "",
      log.event_id ?? "",
      log.payload_id ?? log.payloadRef ?? "",
      (log.description ?? "").replace(/"/g, '""'),
      log.retention_status ?? "RETAINED",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c)}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    return { url }
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

  // Data Replay endpoints
  getDataReplayHealth: async (tenantId?: string): Promise<ReplayHealth> => {
    try {
      const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : ""
      const res = await api.get<ReplayHealth>(`/admin/data-replay/health${q}`)
      if (res?.status) return res
    } catch {
      /* fall through to mock */
    }
    return { ...mockReplayHealth, ...(tenantId ? { tenantId } : {}) }
  },

  postDataReplayPreflight: async (body: {
    tenantId: string
    windowStart: string
    windowEnd: string
  }): Promise<PreflightResult> => {
    try {
      const res = await api.post<PreflightResult>("/admin/data-replay/preflight", body)
      if (res?.valid !== undefined) return res
    } catch {
      /* fall through to mock */
    }
    return getMockPreflight(body.tenantId, body.windowStart, body.windowEnd)
  },

  postDataReplayRun: async (body: {
    tenantId: string
    windowStart: string
    windowEnd: string
    mode: ReplayMode
  }): Promise<{ jobId: string; status: string } & Partial<import("@/types/admin").DryRunResult>> => {
    try {
      const res = await api.post<{ jobId: string; status: string } & Partial<import("@/types/admin").DryRunResult>>(
        "/admin/data-replay/run",
        body
      )
      if (res?.jobId) return res
    } catch {
      /* fall through to mock */
    }
    const jobId = `job-${Date.now()}`
    if (body.mode === "dry-run") {
      const { getMockPreflight } = await import("@/lib/admin-mock")
      const preflight = getMockPreflight(body.tenantId, body.windowStart, body.windowEnd)
      return {
        jobId,
        status: "completed",
        estimatedEventCount: preflight.estimatedEventCount,
        estimatedResources: preflight.estimatedResources,
        batchEstimates: preflight.batchEstimates,
        summary: `Dry-run completed: ${preflight.estimatedEventCount} events estimated`,
      }
    }
    return { jobId, status: "queued" }
  },

  getDataReplayJobs: async (params?: {
    tenantId?: string
    windowStart?: string
    windowEnd?: string
  }): Promise<ReplayJob[]> => {
    try {
      const q = new URLSearchParams()
      if (params?.tenantId) q.set("tenantId", params.tenantId)
      if (params?.windowStart) q.set("windowStart", params.windowStart)
      if (params?.windowEnd) q.set("windowEnd", params.windowEnd)
      const query = q.toString()
      const res = await api.get<{ data?: ReplayJob[]; jobs?: ReplayJob[] } | ReplayJob[]>(
        `/admin/data-replay/jobs${query ? `?${query}` : ""}`
      )
      const raw = (res as { data?: ReplayJob[]; jobs?: ReplayJob[] })?.data ??
        (res as { data?: ReplayJob[]; jobs?: ReplayJob[] })?.jobs ??
        (res as ReplayJob[])
      return safeArray(raw)
    } catch {
      return mockReplayJobs
    }
  },

  getDataReplayJobProgress: async (jobId: string) => {
    try {
      const res = await api.get<{ jobId: string; status: string; progressPercent: number; etaSeconds?: number }>(
        `/admin/data-replay/jobs/${jobId}/progress`
      )
      if (res?.jobId) return res
    } catch {
      /* fall through to mock */
    }
    return {
      jobId,
      status: "completed" as const,
      progressPercent: 100,
      eventsProcessed: 1247,
      totalEvents: 1247,
    }
  },

  getDataReplayAuditLogs: async (params?: {
    tenantId?: string
    relatedJobId?: string
  }) => {
    try {
      const q = new URLSearchParams()
      if (params?.tenantId) q.set("tenantId", params.tenantId)
      if (params?.relatedJobId) q.set("relatedJobId", params.relatedJobId)
      q.set("actionType", "replay_*")
      const res = await api.get<{ data?: unknown[] } | unknown[]>(
        `/admin/audit-logs?${q.toString()}`
      )
      const raw = (res as { data?: unknown[] })?.data ?? (res as unknown[])
      return (Array.isArray(raw) ? raw : []) as import("@/types/admin").AuditLogPreview[]
    } catch {
      return mockAuditLogsPreview
    }
  },
}
