import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { usersApi } from "@/api/users"
import type { ProfileUpdatePayload } from "@/types/user-profile"
import type { TeamInviteInput } from "@/types/settings"
import { safeArray } from "@/lib/data-guard"
import { settingsKeys } from "@/hooks/useSettings"

export const userProfileKeys = {
  me: ["user-profile", "me"] as const,
  activity: ["user-profile", "activity"] as const,
  tenantUsers: (tenantId: string) => ["user-profile", "tenant-users", tenantId] as const,
}

export function useUserProfileMe() {
  return useQuery({
    queryKey: userProfileKeys.me,
    queryFn: () => usersApi.getMe(),
    select: (data) => data ?? null,
  })
}

export function useUserProfileUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(userProfileKeys.me, data ?? null)
      queryClient.invalidateQueries({ queryKey: userProfileKeys.me })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Profile updated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update profile")
    },
  })
}

export function useUserActivity() {
  return useQuery({
    queryKey: userProfileKeys.activity,
    queryFn: () => usersApi.getActivity(),
    select: (data) => safeArray(data),
  })
}

export function useUserActivityExport() {
  return useMutation({
    mutationFn: () => usersApi.exportActivityCsv(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `activity-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Activity log exported")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Export failed")
    },
  })
}

export function useTenantUsers(tenantId: string | undefined, isAdmin: boolean) {
  return useQuery({
    queryKey: userProfileKeys.tenantUsers(tenantId ?? ""),
    queryFn: () => usersApi.getTenantUsers(tenantId ?? ""),
    select: (data) => safeArray(data),
    enabled: Boolean(isAdmin && tenantId),
  })
}

export function useInviteTenantUser(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamInviteInput) =>
      usersApi.inviteUser(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.tenantUsers(tenantId) })
      toast.success("Invitation sent")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to send invitation")
    },
  })
}

export function useUpdateTenantUserRole(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      usersApi.updateTenantUserRole(tenantId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.tenantUsers(tenantId) })
      toast.success("Role updated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update role")
    },
  })
}

export function useRemoveTenantUser(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => usersApi.removeTenantUser(tenantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.tenantUsers(tenantId) })
      toast.success("User removed")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to remove user")
    },
  })
}
