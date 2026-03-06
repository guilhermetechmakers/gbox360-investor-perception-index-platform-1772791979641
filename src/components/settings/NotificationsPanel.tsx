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
import { Bell, Mail, Webhook, MessageSquare, Clock, BellOff } from "lucide-react"
import { useSettings, useSettingsNotificationsUpdate, useSettingsDeliveryWindowUpdate, useSettingsMutedNotificationsUpdate } from "@/hooks/useSettings"
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
  const deliveryWindowMutation = useSettingsDeliveryWindowUpdate()
  const mutedMutation = useSettingsMutedNotificationsUpdate()

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
  const [deliveryStart, setDeliveryStart] = useState("09:00")
  const [deliveryEnd, setDeliveryEnd] = useState("18:00")
  const [mutedUntil, setMutedUntil] = useState<string | null>(null)

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
    const dw = (data as { deliveryWindow?: { start?: string; end?: string } } | undefined)?.deliveryWindow
    if (dw?.start) setDeliveryStart(dw.start)
    if (dw?.end) setDeliveryEnd(dw.end)
    const muted = (data as { mutedNotifications?: { until?: string } } | undefined)?.mutedNotifications
    if (muted?.until) {
      try {
        const d = new Date(muted.until)
        if (!Number.isNaN(d.getTime())) setMutedUntil(d.toISOString().slice(0, 16))
      } catch {
        setMutedUntil(null)
      }
    } else {
      setMutedUntil(null)
    }
  }, [notifications, data])

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

        {/* Delivery window */}
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <Label htmlFor="delivery-window" className="font-medium">
                Delivery window
              </Label>
              <p className="text-xs text-muted-foreground">
                Only send notifications between these times (local time).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <Label htmlFor="delivery-start" className="text-xs">From</Label>
              <Input
                id="delivery-start"
                type="time"
                value={deliveryStart}
                onChange={(e) => setDeliveryStart(e.target.value)}
                aria-label="Delivery window start"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="delivery-end" className="text-xs">To</Label>
              <Input
                id="delivery-end"
                type="time"
                value={deliveryEnd}
                onChange={(e) => setDeliveryEnd(e.target.value)}
                aria-label="Delivery window end"
              />
            </div>
            <Button
              size="sm"
              onClick={() => deliveryWindowMutation.mutate({ start: deliveryStart, end: deliveryEnd })}
              disabled={deliveryWindowMutation.isPending}
              className="mt-6"
            >
              {deliveryWindowMutation.isPending ? "Saving…" : "Save window"}
            </Button>
          </div>
        </div>

        {/* Muted notifications */}
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <Label htmlFor="muted-until" className="font-medium">
                Muted notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Pause all notifications until a set time.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <Label htmlFor="muted-until" className="text-xs">Mute until (optional)</Label>
              <Input
                id="muted-until"
                type="datetime-local"
                value={mutedUntil ?? ""}
                onChange={(e) => setMutedUntil(e.target.value || null)}
                aria-label="Mute notifications until"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const until = new Date()
                  until.setHours(until.getHours() + 1)
                  setMutedUntil(until.toISOString().slice(0, 16))
                  mutedMutation.mutate({ until: until.toISOString() })
                }}
                disabled={mutedMutation.isPending}
              >
                Mute for 1 hour
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMutedUntil(null)
                  mutedMutation.mutate({})
                }}
                disabled={mutedMutation.isPending}
              >
                Unmute
              </Button>
              {mutedUntil && (
                <Button
                  size="sm"
                  onClick={() => mutedMutation.mutate({ until: new Date(mutedUntil).toISOString() })}
                  disabled={mutedMutation.isPending}
                >
                  {mutedMutation.isPending ? "Saving…" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
