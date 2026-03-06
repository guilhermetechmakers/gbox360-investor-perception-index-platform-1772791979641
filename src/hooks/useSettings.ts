import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { settingsApi } from "@/api/settings"
import { useCurrentUser } from "@/hooks/useAuth"
import type {
  ProfileUpdateInput,
  ApiKeyCreateInput,
  DataRefreshUpdateInput,
  TeamInviteInput,
} from "@/types/settings"
import { safeArray } from "@/lib/data-guard"

export const settingsKeys = {
  all: ["settings"] as const,
  settings: ["settings", "payload"] as const,
  team: ["settings", "team"] as const,
  sessions: ["settings", "sessions"] as const,
}

export function useSettings() {
  const { isAdmin } = useCurrentUser()
  return useQuery({
    queryKey: settingsKeys.settings,
    queryFn: settingsApi.getSettings,
    select: (data) => ({
      profile: data.profile,
      notifications: safeArray(data.notifications),
      apiKeys: safeArray(data.apiKeys),
      dataRefresh: data.dataRefresh ?? null,
      team: isAdmin ? safeArray(data.team) : [],
      sessions: safeArray(data.sessions),
    }),
  })
}

export function useSettingsProfileUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfileUpdateInput) => settingsApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Profile updated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update profile")
    },
  })
}

export function useSettingsNotificationsUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { preferences: Array<{ channel: string; enabled: boolean; frequency?: string; webhookUrl?: string }> }) =>
      settingsApi.updateNotifications(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Notification preferences saved")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to save notifications")
    },
  })
}

export function useSettingsApiKeyCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApiKeyCreateInput) => settingsApi.createApiKey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("API key created. Copy the secret now — it won't be shown again.")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create API key")
    },
  })
}

export function useSettingsApiKeyRotate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.rotateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("API key rotated. Copy the new secret now.")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to rotate API key")
    },
  })
}

export function useSettingsApiKeyRevoke() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("API key revoked")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to revoke API key")
    },
  })
}

export function useSettingsDataRefreshUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DataRefreshUpdateInput) => settingsApi.updateDataRefresh(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Data refresh preferences saved")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to save data refresh settings")
    },
  })
}

export function useSettingsTeam(isAdmin: boolean) {
  return useQuery({
    queryKey: settingsKeys.team,
    queryFn: settingsApi.getTeam,
    select: (data) => safeArray(data),
    enabled: isAdmin,
  })
}

export function useSettingsTeamInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamInviteInput) => settingsApi.inviteTeamMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Invitation sent")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to send invitation")
    },
  })
}

export function useSettingsTeamRoleUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      settingsApi.updateTeamRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Role updated")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update role")
    },
  })
}

export function useSettingsTeamRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => settingsApi.removeTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Member removed")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to remove member")
    },
  })
}

export function useSettingsSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions,
    queryFn: settingsApi.getSessions,
    select: (data) => safeArray(data),
  })
}

export function useSettingsTerminateSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => settingsApi.terminateOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
      toast.success("Other sessions signed out")
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to terminate sessions")
    },
  })
}
