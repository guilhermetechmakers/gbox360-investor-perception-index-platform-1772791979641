import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Pencil, X } from "lucide-react"
import { SSOStatusBadge } from "./SSOStatusBadge"
import type { UserProfileMe } from "@/types/user-profile"

function getInitials(name: string, email: string): string {
  const trimmed = (name ?? "").trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/)
    if (parts.length >= 2) return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    return trimmed.slice(0, 2).toUpperCase()
  }
  return (email ?? "U").slice(0, 2).toUpperCase()
}

export interface ProfileHeaderCardProps {
  profile: UserProfileMe | null
  isEditing: boolean
  onEditToggle: () => void
  onSave: (values: { name?: string; organization?: string }) => void
  editValues: { name: string; organization: string }
  onEditValuesChange: (v: { name?: string; organization?: string }) => void
  isSaving?: boolean
  emailReadOnly?: boolean
}

export function ProfileHeaderCard({
  profile,
  isEditing,
  onEditToggle,
  onSave,
  editValues,
  onEditValuesChange,
  isSaving = false,
  emailReadOnly = true,
}: ProfileHeaderCardProps) {
  const email = profile?.email ?? ""
  const organization = profile?.organization ?? ""
  const role = profile?.role ?? "member"
  const displayName = isEditing ? editValues.name : (profile?.name ?? "")
  const displayOrg = isEditing ? editValues.organization : (profile?.organization ?? "")

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-2xl border-2 border-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-lg text-primary">
              {getInitials(profile?.name ?? "", profile?.email ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profile-header-name" className="sr-only">
                    Display name
                  </Label>
                  <Input
                    id="profile-header-name"
                    value={displayName}
                    onChange={(e) => onEditValuesChange({ name: e.target.value })}
                    placeholder="Your name"
                    className="max-w-xs font-display text-xl font-semibold"
                    aria-label="Display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-header-org" className="sr-only">
                    Organization
                  </Label>
                  <Input
                    id="profile-header-org"
                    value={displayOrg}
                    onChange={(e) => onEditValuesChange({ organization: e.target.value })}
                    placeholder="Organization"
                    className="max-w-xs text-muted-foreground"
                    aria-label="Organization"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {displayName || "—"}
                </h2>
                <p className="text-sm text-muted-foreground">{email}</p>
                {(displayOrg || organization) && (
                  <p className="text-sm text-muted-foreground">{displayOrg || organization}</p>
                )}
              </>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                {role}
              </span>
              <SSOStatusBadge isSsoEnabled={profile?.is_sso_enabled ?? false} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditToggle}
                disabled={isSaving}
                aria-label="Cancel edit"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onSave(editValues)}
                disabled={isSaving}
                aria-label="Save changes"
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditToggle}
              aria-label="Edit profile"
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      {emailReadOnly && isEditing && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label htmlFor="profile-header-email">Email</Label>
            <Input
              id="profile-header-email"
              type="email"
              value={email}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed max-w-xs"
              aria-label="Email (read-only)"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here. Contact support to update your email.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
