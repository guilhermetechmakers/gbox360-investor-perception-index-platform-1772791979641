import { useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  ProfileHeaderCard,
  ProfileDetailsForm,
  ActivityLogPanel,
  AdminUserManagementPanel,
} from "@/components/user-profile"
import type { ProfileDetailsFormValues } from "@/components/user-profile/ProfileDetailsForm"
import { Button } from "@/components/ui/button"
import { KeyRound, Shield } from "lucide-react"
import { useUserProfileMe, useUserProfileUpdate } from "@/hooks/useUserProfile"
import { useCurrentUser } from "@/hooks/useAuth"

export default function UserProfile() {
  const { data: profile, isLoading } = useUserProfileMe()
  const { isAdmin } = useCurrentUser()
  const updateMutation = useUserProfileUpdate()

  const [isHeaderEditing, setIsHeaderEditing] = useState(false)
  const [headerEditValues, setHeaderEditValues] = useState({
    name: profile?.name ?? "",
    organization: profile?.organization ?? "",
  })

  const syncHeaderEditValues = useCallback(() => {
    setHeaderEditValues({
      name: profile?.name ?? "",
      organization: profile?.organization ?? "",
    })
  }, [profile?.name, profile?.organization])

  useEffect(() => {
    if (profile && !isHeaderEditing) {
      syncHeaderEditValues()
    }
  }, [profile, isHeaderEditing, syncHeaderEditValues])

  const handleHeaderEditToggle = useCallback(() => {
    if (isHeaderEditing) {
      syncHeaderEditValues()
    } else {
      setHeaderEditValues({
        name: profile?.name ?? "",
        organization: profile?.organization ?? "",
      })
    }
    setIsHeaderEditing((prev) => !prev)
  }, [isHeaderEditing, profile?.name, profile?.organization, syncHeaderEditValues])

  const handleHeaderSave = useCallback(
    (values: { name?: string; organization?: string }) => {
      updateMutation.mutate(
        { name: values.name, organization: values.organization },
        {
          onSuccess: () => {
            setIsHeaderEditing(false)
            syncHeaderEditValues()
          },
        }
      )
    },
    [updateMutation, syncHeaderEditValues]
  )

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Your profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal details, preferences, and view recent activity.
          </p>
        </div>

        <ProfileHeaderCard
          profile={profile ?? null}
          isEditing={isHeaderEditing}
          onEditToggle={handleHeaderEditToggle}
          onSave={handleHeaderSave}
          editValues={headerEditValues}
          onEditValuesChange={(v: { name?: string; organization?: string }) =>
            setHeaderEditValues((prev) => ({ ...prev, ...v }))
          }
          isSaving={updateMutation.isPending}
        />

        <ProfileDetailsForm
          defaultValues={
            profile
              ? {
                  phone: profile.phone ?? "",
                  timezone: profile.timezone,
                  locale: profile.locale,
                  emailVisibility: "team",
                  notificationsEmail: true,
                  notificationsInApp: true,
                }
              : {}
          }
          isLoading={isLoading}
          onSubmit={(values: ProfileDetailsFormValues) => {
            const payload = {
              phone: values.phone || null,
              timezone: values.timezone,
              locale: values.locale,
              email_visibility: values.emailVisibility,
              notification_preferences: {
                email: values.notificationsEmail,
                in_app: values.notificationsInApp,
              },
            }
            updateMutation.mutate(payload)
          }}
          isSubmitting={updateMutation.isPending}
        />

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            Security
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage password and two-factor authentication.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/forgot-password" aria-label="Change password via email reset">
                <KeyRound className="h-4 w-4" />
                Change password
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2"
              aria-label="Two-factor authentication (coming soon)"
            >
              <Shield className="h-4 w-4" />
              Two-factor (coming soon)
            </Button>
          </div>
        </div>

        <ActivityLogPanel />

        {isAdmin && (
          <section className="animate-fade-in-up" aria-label="Team management">
            <AdminUserManagementPanel />
          </section>
        )}
      </div>
    </AnimatedPage>
  )
}
