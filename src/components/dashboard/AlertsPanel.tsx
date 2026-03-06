import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Alert } from "@/types/dashboard"

interface AlertsPanelProps {
  alerts: Alert[]
  isLoading?: boolean
}

const levelConfig = {
  info: {
    icon: Info,
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    variant: "default" as const,
    className: "bg-amber-100 text-amber-800",
  },
  error: {
    icon: AlertCircle,
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800",
  },
  success: {
    icon: CheckCircle,
    variant: "default" as const,
    className: "bg-green-100 text-green-800",
  },
} as const

export function AlertsPanel({ alerts, isLoading = false }: AlertsPanelProps) {
  const items = Array.isArray(alerts) ? alerts : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts
        </CardTitle>
        <CardDescription>
          System messages and significant events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((alert) => {
              const config = levelConfig[alert.level] ?? levelConfig.info
              const Icon = config.icon

              return (
                <li
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <Icon
                    className={cn("mt-0.5 h-4 w-4 shrink-0", config.className)}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={config.variant} className="shrink-0 capitalize">
                    {alert.level}
                  </Badge>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            No recent alerts.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
