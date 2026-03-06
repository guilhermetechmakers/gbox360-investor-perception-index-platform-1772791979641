import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { User, Loader2, KeyRound, Shield } from "lucide-react"
import { useSettings, useSettingsProfileUpdate } from "@/hooks/useSettings"
import { TIMEZONES, LANGUAGES } from "@/lib/settings-mock"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UserProfilePanel() {
  const { data, isLoading } = useSettings()
  const updateMutation = useSettingsProfileUpdate()

  const profile = data?.profile ?? null

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      timezone: "America/New_York",
      language: "en",
    },
    values: profile
      ? {
          name: profile.name ?? "",
          timezone: profile.timezone ?? "America/New_York",
          language: profile.language ?? "en",
        }
      : undefined,
  })

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => form.reset(values),
    })
  }

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <User className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>
          Update your personal details, timezone, and language preferences.{" "}
          <Link to="/dashboard/profile" className="text-primary hover:underline">
            View full profile
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              type="text"
              placeholder="Your name"
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
              aria-label="Email (read-only)"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here. Contact support to update your email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-timezone">Timezone</Label>
            <Select
              value={form.watch("timezone")}
              onValueChange={(v) => form.setValue("timezone", v)}
            >
              <SelectTrigger
                id="profile-timezone"
                className={cn(form.formState.errors.timezone && "border-destructive")}
              >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timezone && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.timezone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-language">Language</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(v) => form.setValue("language", v)}
            >
              <SelectTrigger
                id="profile-language"
                className={cn(form.formState.errors.language && "border-destructive")}
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.language && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.language.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              Security
            </div>
            <p className="text-sm text-muted-foreground">
              Manage password and two-factor authentication.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/forgot-password" aria-label="Change password via email reset">
                  <KeyRound className="h-4 w-4" />
                  Change password
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-2" aria-label="Two-factor authentication settings">
                <Link to="/dashboard/settings?tab=mfa" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-factor authentication
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
