import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { adminApi } from "@/api/admin"
import type { AuditLogsParams, AuditLogExportParams, InviteUserInput } from "@/types/admin"
import { safeArray } from "@/lib/data-guard"

export const adminKeys = {
  health: ["admin", "dashboard-health"] as const,
  tenants: ["admin", "tenants"] as const,
  auditLogs: (params: AuditLogsParams) => ["admin", "audit-logs", params] as const,
  auditLogPayload: (id: string) => ["admin", "audit-logs", id, "payload"] as const,
  users: (tenantId: string) => ["admin", "users", tenantId] as const,
  replayStatus: (id: string) => ["admin", "replays", id, "status"] as const,
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

export function useAdminUsers(tenantId: string | null) {
  return useQuery({
    queryKey: adminKeys.users(tenantId ?? ""),
    queryFn: () => adminApi.getUsers(tenantId ?? ""),
    enabled: !!tenantId,
    select: (data) => safeArray(data),
  })
}

export function useAdminUserInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteUserInput) => adminApi.inviteUser(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(variables.tenantId) })
      toast.success("Invitation sent")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Invite failed")
    },
  })
}

export function useAdminUserDeactivate(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(tenantId) })
      toast.success("User deactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Deactivation failed")
    },
  })
}

export function useAdminUserReactivate(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users(tenantId) })
      toast.success("User reactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Reactivation failed")
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
