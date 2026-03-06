/**
 * FilterPanel — Filters for NarrativeEvents and IPI timelines.
 * Date range, event type, timeline presets. Safe defaults for arrays/objects.
 */
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const TIMELINE_PRESETS = [
  { id: "1D", label: "1 Day" },
  { id: "1W", label: "1 Week" },
  { id: "1M", label: "1 Month" },
] as const

const EVENT_TYPES = [
  { id: "news", label: "News" },
  { id: "social", label: "Social" },
  { id: "transcript", label: "Transcript" },
] as const

export interface FilterState {
  from?: string
  to?: string
  eventTypes: string[]
  timelinePreset: string
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
}

const defaultFrom = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}
const defaultTo = () => new Date().toISOString().slice(0, 10)

export function FilterPanel({ onFiltersChange, className }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    from: defaultFrom(),
    to: defaultTo(),
    eventTypes: [],
    timelinePreset: "1W",
  })

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...updates }
      setFilters(next)
      onFiltersChange?.(next)
    },
    [filters, onFiltersChange]
  )

  const handleEventTypeToggle = useCallback(
    (id: string, checked: boolean) => {
      const current = filters.eventTypes ?? []
      const next = checked
        ? [...current, id]
        : current.filter((t) => t !== id)
      updateFilters({ eventTypes: next })
    },
    [filters.eventTypes, updateFilters]
  )

  const handlePresetSelect = useCallback(
    (id: string) => {
      updateFilters({ timelinePreset: id })
    },
    [updateFilters]
  )

  const eventTypes = filters.eventTypes ?? []

  return (
    <Card className={cn("rounded-[18px] shadow-card border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Filter className="h-5 w-5 text-primary" aria-hidden />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="filter-from" className="text-sm">
              From date
            </Label>
            <Input
              id="filter-from"
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => updateFilters({ from: e.target.value || undefined })}
              className="mt-1 rounded-lg"
              aria-label="Filter from date"
            />
          </div>
          <div>
            <Label htmlFor="filter-to" className="text-sm">
              To date
            </Label>
            <Input
              id="filter-to"
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => updateFilters({ to: e.target.value || undefined })}
              className="mt-1 rounded-lg"
              aria-label="Filter to date"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm">Timeline preset</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIMELINE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  filters.timelinePreset === preset.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-muted"
                )}
                aria-pressed={filters.timelinePreset === preset.id}
                aria-label={`Select ${preset.label} timeline`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm">Event type</Label>
          <div className="mt-2 flex flex-wrap gap-4">
            {EVENT_TYPES.map((type) => (
              <label
                key={type.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={eventTypes.includes(type.id)}
                  onCheckedChange={(checked) =>
                    handleEventTypeToggle(type.id, !!checked)
                  }
                  aria-label={`Filter by ${type.label}`}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
