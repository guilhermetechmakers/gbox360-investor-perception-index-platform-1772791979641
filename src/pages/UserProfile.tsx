import { useState, useCallback, useEffect } from "react"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  ProfileHeaderCard,
  ProfileDetailsForm,
  ActivityLogPanel,
  SaveBar,
  AdminUserManagementPanel,
  DataRefreshStatusCard,
} from "@/components/user-profile"
import type { ProfileDetailsFormValues } from "@/components/user-profile"
import {
  useUserProfileMe,
  useUserProfileUpdate,
  useAvatarUpload,
} from "@/hooks/useUserProfile"
import { useCurrentUser } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserProfile() {
  const { isAdmin } = useCurrentUser()
  const { data: profile, isLoading: profileLoading } = useUserProfileMe()
  const updateMutation = useUserProfileUpdate()
  const avatarUploadMutation = useAvatarUpload()

  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({ name: "", organization: "" })
  const [detailsValues, setDetailsValues] = useState<Partial<ProfileDetailsFormValues>>({})

  const profileData = profile ?? null

  useEffect(() => {
    if (profileData) {
      setEditValues({
        name: profileData.name ?? "",
        organization: profileData.organization ?? "",
      })
      setDetailsValues({
        phone: profileData.phone ?? "",
        timezone: profileData.timezone ?? "America/New_York",
        locale: profileData.locale ?? "en",
        emailVisibility: "team",
        notificationsEmail: true,
        notificationsInApp: true,
      })
    }
  }, [profileData?.id, profileData?.name, profileData?.organization, profileData?.phone, profileData?.timezone, profileData?.locale])

  const handleHeaderSave = useCallback(
    (values: { name?: string; organization?: string }) => {
      updateMutation.mutate(
        { name: values.name, organization: values.organization },
        {
          onSuccess: () => {
            setIsEditing(false)
            setEditValues({
              name: profileData?.name ?? "",
              organization: profileData?.organization ?? "",
            })
          },
        }
      )
    },
    [updateMutation, profileData?.name, profileData?.organization]
  )

  const hasHeaderChanges =
    isEditing &&
    (editValues.name !== (profileData?.name ?? "") ||
      editValues.organization !== (profileData?.organization ?? ""))

  const handleEditValuesChange = useCallback((v: { name?: string; organization?: string }) => {
    setEditValues((prev) => ({
      ...prev,
      ...(v.name !== undefined && { name: v.name }),
      ...(v.organization !== undefined && { organization: v.organization }),
    }))
  }, [])

  const handleSave = useCallback(() => {
    const payload: Parameters<typeof updateMutation.mutate>[0] = {}
    if (hasHeaderChanges) {
      payload.name = editValues.name || undefined
      payload.organization = editValues.organization || undefined
    }
    if (detailsValues.timezone !== undefined) payload.timezone = detailsValues.timezone
    if (detailsValues.locale !== undefined) payload.locale = detailsValues.locale
    if (detailsValues.phone !== undefined) payload.phone = detailsValues.phone || null
    if (
      detailsValues.notificationsEmail !== undefined ||
      detailsValues.notificationsInApp !== undefined
    ) {
      payload.notification_preferences = {
        email: detailsValues.notificationsEmail ?? true,
        inApp: detailsValues.notificationsInApp ?? true,
      }
    }
    updateMutation.mutate(payload, {
      onSuccess: () => {
        setIsEditing(false)
        setEditValues({
          name: profileData?.name ?? "",
          organization: profileData?.organization ?? "",
        })
      },
    })
  }, [
    hasHeaderChanges,
    editValues.name,
    editValues.organization,
    detailsValues.timezone,
    detailsValues.locale,
    detailsValues.phone,
    detailsValues.notificationsEmail,
    detailsValues.notificationsInApp,
    updateMutation,
    profileData?.name,
    profileData?.organization,
  ])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditValues({
      name: profileData?.name ?? "",
      organization: profileData?.organization ?? "",
    })
    if (profileData) {
      setDetailsValues({
        phone: profileData.phone ?? "",
        timezone: profileData.timezone ?? "America/New_York",
        locale: profileData.locale ?? "en",
        emailVisibility: "team",
        notificationsEmail: true,
        notificationsInApp: true,
      })
    }
  }, [profileData])

  if (profileLoading) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-[1000px] space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            User profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal details, preferences, and view recent activity.
          </p>
        </div>

        <ProfileHeaderCard
          profile={profileData}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing((prev) => !prev)}
          onSave={handleHeaderSave}
          editValues={editValues}
          onEditValuesChange={handleEditValuesChange}
          isSaving={updateMutation.isPending}
          emailReadOnly
          onAvatarUpload={async (file) => avatarUploadMutation.mutateAsync(file) ?? null}
        />

        <ProfileDetailsForm
          defaultValues={detailsValues}
          onSubmit={(values) => {
            setDetailsValues(values)
            updateMutation.mutate(
              {
                phone: values.phone || null,
                timezone: values.timezone,
                locale: values.locale,
                notification_preferences: {
                  email: values.notificationsEmail,
                  inApp: values.notificationsInApp,
                },
              },
              { onSuccess: () => {} }
            )
          }}
          isSubmitting={updateMutation.isPending}
          isLoading={profileLoading}
        />

        <DataRefreshStatusCard />

        <ActivityLogPanel showExport={isAdmin} />

        {isAdmin && profileData?.tenant_id && (
          <AdminUserManagementPanel tenantId={profileData.tenant_id} />
        )}

        <SaveBar
          visible={isEditing && hasHeaderChanges}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={updateMutation.isPending}
          showDelete={isAdmin}
        />
      </div>
    </AnimatedPage>
  )
}
