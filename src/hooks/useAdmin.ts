import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { adminApi } from "@/api/admin"
import type {
  AuditLogsParams,
  AuditLogExportParams,
  AdminUsersParams,
  InviteUserInput,
} from "@/types/admin"
import { safeArray } from "@/lib/data-guard"

export const adminKeys = {
  health: ["admin", "dashboard-health"] as const,
  tenants: ["admin", "tenants"] as const,
  roles: ["admin", "roles"] as const,
  auditLogs: (params: AuditLogsParams) => ["admin", "audit-logs", params] as const,
  auditLogPayload: (id: string) => ["admin", "audit-logs", id, "payload"] as const,
  users: (params: AdminUsersParams) => ["admin", "users", params] as const,
  usersLegacy: (tenantId: string) => ["admin", "users", "legacy", tenantId] as const,
  replayStatus: (id: string) => ["admin", "replays", id, "status"] as const,
  dataReplayHealth: (tenantId?: string) => ["admin", "data-replay", "health", tenantId ?? ""] as const,
  dataReplayPreflight: (params: { tenantId: string; windowStart: string; windowEnd: string }) =>
    ["admin", "data-replay", "preflight", params] as const,
  dataReplayJobs: (params?: { tenantId?: string; windowStart?: string; windowEnd?: string }) =>
    ["admin", "data-replay", "jobs", params ?? {}] as const,
  dataReplayJobProgress: (jobId: string) => ["admin", "data-replay", "jobs", jobId, "progress"] as const,
  dataReplayAuditLogs: (params?: { tenantId?: string; relatedJobId?: string }) =>
    ["admin", "data-replay", "audit-logs", params ?? {}] as const,
}

export function useAdminDashboardHealth() {
  return useQuery({
    queryKey: adminKeys.health,
    queryFn: adminApi.getDashboardHealth,
    staleTime: 1000 * 60,
  })
}

export function useAdminTenants() {
  return useQuery({
    queryKey: adminKeys.tenants,
    queryFn: adminApi.getTenants,
    select: (data) => safeArray(data),
  })
}

export function useAdminAuditLogs(params: AuditLogsParams) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => adminApi.getAuditLogs(params),
  })
}

export function useAdminAuditLogPayload(id: string | null) {
  return useQuery({
    queryKey: adminKeys.auditLogPayload(id ?? ""),
    queryFn: () => (id ? adminApi.getAuditLogPayload(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useAdminAuditLogExport() {
  return useMutation({
    mutationFn: (params: AuditLogExportParams) => adminApi.exportAuditLogs(params),
    onSuccess: (data) => {
      if (data?.url) {
        const a = document.createElement("a")
        a.href = data.url
        a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(data.url)
        toast.success("Audit logs exported")
      } else if (data?.error) {
        toast.error(data.error)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Export failed")
    },
  })
}

export function useAdminUsers(params: AdminUsersParams | null) {
  return useQuery({
    queryKey: adminKeys.users(params ?? {}),
    queryFn: () => adminApi.getUsers(params ?? {}),
    enabled: !!params,
    select: (data) => ({
      ...data,
      items: safeArray(data?.items),
    }),
  })
}

export function useAdminRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: adminApi.getRoles,
    select: (data) => safeArray(data),
  })
}

export function useAdminUserInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteUserInput) => adminApi.inviteUser(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      if (variables.tenantId) {
        queryClient.invalidateQueries({
          queryKey: adminKeys.usersLegacy(variables.tenantId),
        })
      }
      toast.success("Invitation sent")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Invite failed")
    },
  })
}

export function useAdminUserDeactivate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User deactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Deactivation failed")
    },
  })
}

export function useAdminUserReactivate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User reactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Reactivation failed")
    },
  })
}

export function useAdminUserResetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.resetPassword(id),
    onSuccess: () => {
      toast.success("Password reset email sent")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Reset password failed")
    },
  })
}

export function useAdminUserExport() {
  return useMutation({
    mutationFn: (params: AdminUsersParams & { format?: "csv" | "json" }) =>
      adminApi.exportUsers(params),
    onSuccess: (data) => {
      if (data?.url) {
        const a = document.createElement("a")
        a.href = data.url
        a.download = `users-export-${new Date().toISOString().slice(0, 10)}.${data.url.endsWith("json") ? "json" : "csv"}`
        a.click()
        URL.revokeObjectURL(data.url)
        toast.success("Users exported")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Export failed")
    },
  })
}

export function useAdminReplayTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.triggerReplay(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.replayStatus(id) })
      toast.success("Replay triggered")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Replay trigger failed")
    },
  })
}

export function useAdminReplayStatus(id: string | null) {
  return useQuery({
    queryKey: adminKeys.replayStatus(id ?? ""),
    queryFn: () => (id ? adminApi.getReplayStatus(id) : Promise.resolve(null)),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === "RUNNING" ? 2000 : false,
  })
}

export function useAdminDataReplayHealth(tenantId: string | null) {
  return useQuery({
    queryKey: adminKeys.dataReplayHealth(tenantId ?? ""),
    queryFn: () => adminApi.getDataReplayHealth(tenantId ?? ""),
    enabled: !!tenantId,
  })
}

export function useAdminDataReplayPreflight(params: {
  tenantId: string
  windowStart: string
  windowEnd: string
} | null) {
  return useQuery({
    queryKey: adminKeys.dataReplayPreflight(params ?? { tenantId: "", windowStart: "", windowEnd: "" }),
    queryFn: () =>
      params
        ? adminApi.postDataReplayPreflight(params)
        : Promise.resolve(null),
    enabled: !!params?.tenantId && !!params?.windowStart && !!params?.windowEnd,
  })
}

export function useAdminDataReplayJobs(params?: {
  tenantId?: string
  windowStart?: string
  windowEnd?: string
}) {
  return useQuery({
    queryKey: adminKeys.dataReplayJobs(params),
    queryFn: () => adminApi.getDataReplayJobs(params),
    select: (data) => safeArray(data),
  })
}

export function useAdminDataReplayPreflightMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      tenantId: string
      windowStart: string
      windowEnd: string
    }) => adminApi.postDataReplayPreflight(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "data-replay"] })
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Preflight failed")
    },
  })
}

export function useAdminDataReplayJobProgress(jobId: string | null) {
  return useQuery({
    queryKey: adminKeys.dataReplayJobProgress(jobId ?? ""),
    queryFn: () => (jobId ? adminApi.getDataReplayJobProgress(jobId) : Promise.resolve(null)),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data as { status?: string })?.status
      return status === "running" || status === "queued" ? 1500 : false
    },
  })
}

export function useAdminDataReplayAuditLogs(params?: {
  tenantId?: string
  relatedJobId?: string
}) {
  return useQuery({
    queryKey: adminKeys.dataReplayAuditLogs(params ?? {}),
    queryFn: () => adminApi.getDataReplayAuditLogs(params),
    select: (data) => safeArray(data),
  })
}

export function useAdminDataReplayRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      tenantId: string
      windowStart: string
      windowEnd: string
      mode: "dry-run" | "execute"
    }) => adminApi.postDataReplayRun(params),
    onSuccess: (data) => {
      if (data?.jobId) {
        queryClient.invalidateQueries({ queryKey: adminKeys.dataReplayJobs() })
        queryClient.invalidateQueries({ queryKey: adminKeys.dataReplayJobProgress(data.jobId) })
      }
      toast.success(
        data?.status === "completed"
          ? "Dry-run completed"
          : "Replay job started"
      )
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Replay failed")
    },
  })
}
