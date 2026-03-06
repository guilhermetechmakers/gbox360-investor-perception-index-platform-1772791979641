import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bell, Mail, Webhook, MessageSquare } from "lucide-react"
import { useSettings, useSettingsNotificationsUpdate } from "@/hooks/useSettings"
import { useDebounce } from "@/hooks/useDebounce"
import type { NotificationChannel, NotificationFrequency } from "@/types/settings"
import { cn } from "@/lib/utils"

const FREQUENCIES: { value: NotificationFrequency; label: string }[] = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
]

function isValidUrl(s: string): boolean {
  if (!s || s.trim() === "") return true
  try {
    new URL(s)
    return true
  } catch {
    return false
  }
}

export function NotificationsPanel() {
  const { data, isLoading } = useSettings()
  const updateMutation = useSettingsNotificationsUpdate()

  const notifications = (data?.notifications ?? []) as Array<{
    id: string
    channel: NotificationChannel
    enabled: boolean
    frequency: NotificationFrequency
    webhookUrl?: string
  }>

  const [emailEnabled, setEmailEnabled] = useState(true)
  const [emailFreq, setEmailFreq] = useState<NotificationFrequency>("instant")
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [webhookFreq, setWebhookFreq] = useState<NotificationFrequency>("instant")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null)
  const [inAppEnabled, setInAppEnabled] = useState(true)
  const [inAppFreq, setInAppFreq] = useState<NotificationFrequency>("instant")

  useEffect(() => {
    const email = notifications.find((n) => n.channel === "email")
    const webhook = notifications.find((n) => n.channel === "webhook")
    const inApp = notifications.find((n) => n.channel === "in-app")
    if (email) {
      setEmailEnabled(email.enabled)
      setEmailFreq(email.frequency ?? "instant")
    }
    if (webhook) {
      setWebhookEnabled(webhook.enabled)
      setWebhookFreq(webhook.frequency ?? "instant")
      setWebhookUrl(webhook.webhookUrl ?? "")
    }
    if (inApp) {
      setInAppEnabled(inApp.enabled)
      setInAppFreq(inApp.frequency ?? "instant")
    }
  }, [notifications])

  const debouncedWebhookUrl = useDebounce(webhookUrl, 300)

  const buildPayload = useCallback(() => {
    const prefs = [
      { channel: "email" as const, enabled: emailEnabled, frequency: emailFreq },
      {
        channel: "webhook" as const,
        enabled: webhookEnabled,
        frequency: webhookFreq,
        webhookUrl: webhookEnabled ? webhookUrl.trim() || undefined : undefined,
      },
      { channel: "in-app" as const, enabled: inAppEnabled, frequency: inAppFreq },
    ]
    return { preferences: prefs }
  }, [emailEnabled, emailFreq, webhookEnabled, webhookFreq, webhookUrl, inAppEnabled, inAppFreq])

  const handleSave = useCallback(() => {
    if (webhookEnabled && webhookUrl.trim() && !isValidUrl(webhookUrl.trim())) {
      setWebhookUrlError("Please enter a valid URL")
      return
    }
    setWebhookUrlError(null)
    updateMutation.mutate(buildPayload())
  }, [webhookEnabled, webhookUrl, buildPayload, updateMutation])

  useEffect(() => {
    if (debouncedWebhookUrl && webhookEnabled && !isValidUrl(debouncedWebhookUrl)) {
      setWebhookUrlError("Please enter a valid URL")
    } else {
      setWebhookUrlError(null)
    }
  }, [debouncedWebhookUrl, webhookEnabled])

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure email, webhook, and in-app notifications for IPI changes and system alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" aria-hidden />
              <Label htmlFor="notif-email">Email notifications</Label>
            </div>
            <Switch
              id="notif-email"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              aria-label="Toggle email notifications"
            />
          </div>
          {emailEnabled && (
            <div className="space-y-2">
              <Label htmlFor="email-freq">Frequency</Label>
              <Select value={emailFreq} onValueChange={(v) => setEmailFreq(v as NotificationFrequency)}>
                <SelectTrigger id="email-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Webhook */}
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-muted-foreground" aria-hidden />
              <Label htmlFor="notif-webhook">Webhook notifications</Label>
            </div>
            <Switch
              id="notif-webhook"
              checked={webhookEnabled}
              onCheckedChange={setWebhookEnabled}
              aria-label="Toggle webhook notifications"
            />
          </div>
          {webhookEnabled && (
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-server.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className={cn(webhookUrlError && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={!!webhookUrlError}
                aria-describedby={webhookUrlError ? "webhook-url-error" : undefined}
              />
              {webhookUrlError && (
                <p id="webhook-url-error" className="text-sm text-destructive" role="alert">
                  {webhookUrlError}
                </p>
              )}
              <Label htmlFor="webhook-freq">Frequency</Label>
              <Select value={webhookFreq} onValueChange={(v) => setWebhookFreq(v as NotificationFrequency)}>
                <SelectTrigger id="webhook-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* In-app */}
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden />
              <Label htmlFor="notif-inapp">In-app notifications</Label>
            </div>
            <Switch
              id="notif-inapp"
              checked={inAppEnabled}
              onCheckedChange={setInAppEnabled}
              aria-label="Toggle in-app notifications"
            />
          </div>
          {inAppEnabled && (
            <div className="space-y-2">
              <Label htmlFor="inapp-freq">Frequency</Label>
              <Select value={inAppFreq} onValueChange={(v) => setInAppFreq(v as NotificationFrequency)}>
                <SelectTrigger id="inapp-freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save notification preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
