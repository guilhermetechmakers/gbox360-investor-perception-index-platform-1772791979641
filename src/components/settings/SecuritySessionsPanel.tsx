import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield, Monitor, Smartphone, Clock } from "lucide-react"
import { useSettingsSessions, useSettingsTerminateSessions } from "@/hooks/useSettings"
import type { Session } from "@/types/settings"
import { safeArray } from "@/lib/data-guard"
import { cn } from "@/lib/utils"

const SESSION_TIMEOUT_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "60", label: "1 hour" },
  { value: "1440", label: "24 hours" },
  { value: "10080", label: "7 days" },
] as const

function getDeviceIcon(device: string): "Monitor" | "Smartphone" {
  const d = device.toLowerCase()
  if (d.includes("iphone") || d.includes("android") || d.includes("mobile")) return "Smartphone"
  return "Monitor"
}

export function SecuritySessionsPanel() {
  const { data: sessionsData, isLoading } = useSettingsSessions()
  const terminateMutation = useSettingsTerminateSessions()

  const sessions = safeArray(sessionsData) as Session[]
  const otherSessions = (sessions ?? []).filter((s) => !s.current)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState("60")

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display">
            <Shield className="h-5 w-5 text-primary" />
            Security & Sessions
          </CardTitle>
          <CardDescription>
            View active devices and sign out other sessions.
          </CardDescription>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => terminateMutation.mutate()}
            disabled={terminateMutation.isPending}
          >
            {terminateMutation.isPending ? "Signing out…" : "Sign out all other sessions"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            <Label htmlFor="session-timeout">Session timeout (optional)</Label>
          </div>
          <Select value={sessionTimeoutMinutes} onValueChange={setSessionTimeoutMinutes}>
            <SelectTrigger id="session-timeout" className="w-full max-w-[200px]">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TIMEOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Idle sessions will expire after this period. Takes effect when supported by your plan.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center">
            <Shield className="h-10 w-10 text-muted-foreground" aria-hidden />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No sessions
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Session information will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(sessions ?? []).map((s) => {
              const Icon = getDeviceIcon(s.device) === "Smartphone" ? Smartphone : Monitor
              return (
                <div
                  key={s.sessionId}
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-border p-4",
                    s.current && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                    <div>
                      <p className="font-medium">{s.device}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.ip} · Last active {new Date(s.lastActive).toLocaleString()}
                      </p>
                      {s.current && (
                        <Badge variant="default" className="mt-1">
                          Current session
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
