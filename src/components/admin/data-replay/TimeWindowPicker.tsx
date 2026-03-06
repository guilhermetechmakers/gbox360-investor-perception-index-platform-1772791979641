import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, subDays, subHours } from "date-fns"
import { cn } from "@/lib/utils"

const RELATIVE_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
] as const

export interface TimeWindow {
  start: string
  end: string
}

interface TimeWindowPickerProps {
  value: TimeWindow
  onChange: (window: TimeWindow) => void
  disabled?: boolean
  error?: string
}

function getDefaultWindow(): TimeWindow {
  const end = new Date()
  const start = subDays(end, 7)
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  }
}

export function TimeWindowPicker({
  value,
  onChange,
  disabled = false,
  error,
}: TimeWindowPickerProps) {
  const [mode, setMode] = useState<"24h" | "7d" | "14d" | "30d" | "custom">("7d")

  const applyRelative = (key: "24h" | "7d" | "14d" | "30d") => {
    const end = new Date()
    const start =
      key === "24h"
        ? subHours(end, 24)
        : subDays(end, key === "7d" ? 7 : key === "14d" ? 14 : 30)
    onChange({
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    })
    setMode(key)
  }

  const handleStartChange = (v: string) => {
    const end = value.end || getDefaultWindow().end
    const validEnd = v <= end ? end : v
    onChange({ start: v, end: validEnd })
    setMode("custom")
  }

  const handleEndChange = (v: string) => {
    const start = value.start || getDefaultWindow().start
    const validStart = v >= start ? start : v
    onChange({ start: validStart, end: v })
    setMode("custom")
  }

  const validationError = useMemo(() => {
    const start = value.start
    const end = value.end
    if (!start || !end) return "Select start and end dates"
    if (start > end) return "Start date must be before or equal to end date"
    return null
  }, [value.start, value.end])

  const displayError = error ?? validationError

  return (
    <div className="space-y-4">
      <div>
        <Label>Time window</Label>
        <Select
          value={mode}
          onValueChange={(v) => {
            const k = v as typeof mode
            if (k !== "custom") applyRelative(k)
            else setMode("custom")
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(RELATIVE_OPTIONS ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="window-start">Start date</Label>
          <Input
            id="window-start"
            type="date"
            value={value.start ?? ""}
            onChange={(e) => handleStartChange(e.target.value)}
            disabled={disabled}
            aria-invalid={!!displayError}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="window-end">End date</Label>
          <Input
            id="window-end"
            type="date"
            value={value.end ?? ""}
            onChange={(e) => handleEndChange(e.target.value)}
            disabled={disabled}
            aria-invalid={!!displayError}
          />
        </div>
      </div>
      {displayError && (
        <p className={cn("text-sm text-red-600", "animate-in fade-in")} role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
