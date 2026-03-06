import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Globe, Bell } from "lucide-react"
import { TIMEZONES, LANGUAGES } from "@/lib/settings-mock"
import { cn } from "@/lib/utils"

const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/

const profileDetailsSchema = z.object({
  phone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  locale: z.string().min(1, "Locale is required"),
  emailVisibility: z.enum(["team", "private"]),
  notificationsEmail: z.boolean(),
  notificationsInApp: z.boolean(),
})

export type ProfileDetailsFormValues = z.infer<typeof profileDetailsSchema>

export interface ProfileDetailsFormProps {
  defaultValues: Partial<ProfileDetailsFormValues>
  onSubmit: (values: ProfileDetailsFormValues) => void
  isSubmitting?: boolean
  isLoading?: boolean
}

export function ProfileDetailsForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isLoading = false,
}: ProfileDetailsFormProps) {
  const form = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      phone: defaultValues.phone ?? "",
      timezone: defaultValues.timezone ?? "America/New_York",
      locale: defaultValues.locale ?? "en",
      emailVisibility: defaultValues.emailVisibility ?? "team",
      notificationsEmail: defaultValues.notificationsEmail ?? true,
      notificationsInApp: defaultValues.notificationsInApp ?? true,
    },
    values:
      defaultValues.timezone !== undefined && defaultValues.locale !== undefined
        ? {
            phone: defaultValues.phone ?? "",
            timezone: defaultValues.timezone,
            locale: defaultValues.locale,
            emailVisibility: defaultValues.emailVisibility ?? "team",
            notificationsEmail: defaultValues.notificationsEmail ?? true,
            notificationsInApp: defaultValues.notificationsInApp ?? true,
          }
        : undefined,
  })

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
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Globe className="h-5 w-5 text-primary" aria-hidden />
          Preferences
        </CardTitle>
        <CardDescription>
          Timezone, locale, and notification preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="details-phone">Phone</Label>
            <Input
              id="details-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...form.register("phone")}
              className={cn(form.formState.errors.phone && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!form.formState.errors.phone}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details-timezone">Timezone</Label>
            <Select
              value={form.watch("timezone")}
              onValueChange={(v) => form.setValue("timezone", v)}
            >
              <SelectTrigger
                id="details-timezone"
                className={cn(form.formState.errors.timezone && "border-destructive")}
              >
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {(TIMEZONES as readonly string[]).map((tz) => (
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
            <Label htmlFor="details-locale">Language</Label>
            <Select
              value={form.watch("locale")}
              onValueChange={(v) => form.setValue("locale", v)}
            >
              <SelectTrigger
                id="details-locale"
                className={cn(form.formState.errors.locale && "border-destructive")}
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
            {form.formState.errors.locale && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.locale.message}
              </p>
            )}
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Bell className="h-5 w-5 text-primary" aria-hidden />
              Notifications
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <Label htmlFor="notif-email" className="cursor-pointer font-normal">
                Email notifications
              </Label>
              <Switch
                id="notif-email"
                checked={form.watch("notificationsEmail")}
                onCheckedChange={(v) => form.setValue("notificationsEmail", v)}
                aria-label="Toggle email notifications"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <Label htmlFor="notif-inapp" className="cursor-pointer font-normal">
                In-app notifications
              </Label>
              <Switch
                id="notif-inapp"
                checked={form.watch("notificationsInApp")}
                onCheckedChange={(v) => form.setValue("notificationsInApp", v)}
                aria-label="Toggle in-app notifications"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
