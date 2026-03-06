import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { RefreshCw } from "lucide-react"
import { useSettings, useSettingsDataRefreshUpdate } from "@/hooks/useSettings"
import { useCurrentUser } from "@/hooks/useAuth"
import { CADENCE_OPTIONS } from "@/lib/settings-mock"

export function DataRefreshPanel() {
  const { data, isLoading } = useSettings()
  const { isAdmin } = useCurrentUser()
  const updateMutation = useSettingsDataRefreshUpdate()

  const dataRefresh = data?.dataRefresh ?? null

  const [cadenceMs, setCadenceMs] = useState(300000)
  const [batchEnabled, setBatchEnabled] = useState(false)

  useEffect(() => {
    if (dataRefresh) {
      setCadenceMs(dataRefresh.cadenceMs ?? 300000)
      setBatchEnabled(dataRefresh.batchProcessingEnabled ?? false)
    }
  }, [dataRefresh])

  const handleSave = useCallback(() => {
    updateMutation.mutate({
      cadenceMs,
      batchProcessingEnabled: isAdmin ? batchEnabled : undefined,
    })
  }, [cadenceMs, batchEnabled, isAdmin, updateMutation])

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <RefreshCw className="h-5 w-5 text-primary" />
          Data Refresh
        </CardTitle>
        <CardDescription>
          Set how often data is polled. Plan limits may apply. Admins can enable batch processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cadence">Polling cadence</Label>
          <Select
            value={String(cadenceMs)}
            onValueChange={(v) => setCadenceMs(Number(v))}
          >
            <SelectTrigger id="cadence">
              <SelectValue placeholder="Select cadence" />
            </SelectTrigger>
            <SelectContent>
              {CADENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How often data is refreshed. Shorter intervals may count toward plan limits.
          </p>
        </div>

        {dataRefresh?.lastRefresh && (
          <p className="text-sm text-muted-foreground">
            Last refresh: {new Date(dataRefresh.lastRefresh).toLocaleString()}
          </p>
        )}

        {isAdmin && (
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="batch-processing">Batch processing</Label>
              <p className="text-xs text-muted-foreground">
                Enable admin-only batch transcript ingestion.
              </p>
            </div>
            <Switch
              id="batch-processing"
              checked={batchEnabled}
              onCheckedChange={setBatchEnabled}
              aria-label="Toggle batch processing"
            />
          </div>
        )}

        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
