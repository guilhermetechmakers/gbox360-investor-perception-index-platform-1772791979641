/**
 * FilterPanel — Filters for NarrativeEvents and IPI timelines.
 * Time window, source type, speaker role, authority band. URL-persisted state; safe defaults.
 */
import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SOURCE_TYPES,
  SPEAKER_ROLES,
  AUTHORITY_BANDS,
} from "@/types/search-filter"

const TIMELINE_PRESETS = [
  { id: "1D", label: "1 Day" },
  { id: "1W", label: "1 Week" },
  { id: "2W", label: "2 Weeks" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "1M", label: "1 Month" },
] as const

export interface FilterState {
  from?: string
  to?: string
  eventTypes: string[]
  timelinePreset: string
  roles: string[]
  authorityBands: string[]
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
  /** When set, show "X results" for real-time feedback. */
  resultCount?: number | null
  /** When true, read/write filter state to URL query params for shareable links. */
  persistToUrl?: boolean
}

const defaultFrom = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}
const defaultTo = () => new Date().toISOString().slice(0, 10)

const URL_KEYS = {
  window: "window",
  from: "from",
  to: "to",
  sources: "sources",
  roles: "roles",
  authority: "authority",
} as const

function parseArrayParam(value: string | null): string[] {
  if (!value || typeof value !== "string") return []
  return value.split(",").filter(Boolean)
}

export function FilterPanel({
  onFiltersChange,
  className,
  resultCount,
  persistToUrl = true,
}: FilterPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<FilterState>(() => {
    if (!persistToUrl) {
      return {
        from: defaultFrom(),
        to: defaultTo(),
        eventTypes: [],
        timelinePreset: "1W",
        roles: [],
        authorityBands: [],
      }
    }
    const from = searchParams.get(URL_KEYS.from) ?? defaultFrom()
    const to = searchParams.get(URL_KEYS.to) ?? defaultTo()
    const windowPreset = searchParams.get(URL_KEYS.window) ?? "1W"
    const eventTypes = parseArrayParam(searchParams.get(URL_KEYS.sources))
    const roles = parseArrayParam(searchParams.get(URL_KEYS.roles))
    const authorityBands = parseArrayParam(searchParams.get(URL_KEYS.authority))
    return {
      from,
      to,
      eventTypes,
      timelinePreset: TIMELINE_PRESETS.some((p) => p.id === windowPreset)
        ? windowPreset
        : "1W",
      roles,
      authorityBands,
    }
  })

  useEffect(() => {
    if (!persistToUrl) return
    const next = new URLSearchParams(searchParams)
    next.set(URL_KEYS.window, filters.timelinePreset)
    if (filters.from) next.set(URL_KEYS.from, filters.from)
    if (filters.to) next.set(URL_KEYS.to, filters.to)
    if ((filters.eventTypes ?? []).length > 0)
      next.set(URL_KEYS.sources, (filters.eventTypes ?? []).join(","))
    else next.delete(URL_KEYS.sources)
    if ((filters.roles ?? []).length > 0)
      next.set(URL_KEYS.roles, (filters.roles ?? []).join(","))
    else next.delete(URL_KEYS.roles)
    if ((filters.authorityBands ?? []).length > 0)
      next.set(URL_KEYS.authority, (filters.authorityBands ?? []).join(","))
    else next.delete(URL_KEYS.authority)
    const nextStr = next.toString()
    if (nextStr !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [persistToUrl, filters, searchParams, setSearchParams])

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

  const handleRoleToggle = useCallback(
    (id: string, checked: boolean) => {
      const current = filters.roles ?? []
      const next = checked ? [...current, id] : current.filter((r) => r !== id)
      updateFilters({ roles: next })
    },
    [filters.roles, updateFilters]
  )

  const handleAuthorityToggle = useCallback(
    (id: string, checked: boolean) => {
      const current = filters.authorityBands ?? []
      const next = checked
        ? [...current, id]
        : current.filter((b) => b !== id)
      updateFilters({ authorityBands: next })
    },
    [filters.authorityBands, updateFilters]
  )

  const handlePresetSelect = useCallback(
    (id: string) => {
      updateFilters({ timelinePreset: id })
    },
    [updateFilters]
  )

  const eventTypes = filters.eventTypes ?? []
  const roles = filters.roles ?? []
  const authorityBands = filters.authorityBands ?? []
  const count =
    resultCount != null && Number.isFinite(resultCount) ? resultCount : null

  return (
    <Card className={cn("rounded-[18px] shadow-card border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg font-display">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" aria-hidden />
            Filters
          </span>
          {count !== null && (
            <span
              className="text-sm font-normal text-muted-foreground"
              aria-live="polite"
            >
              {count} result{count !== 1 ? "s" : ""}
            </span>
          )}
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
              onChange={(e) =>
                updateFilters({ from: e.target.value || undefined })
              }
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
              onChange={(e) =>
                updateFilters({ to: e.target.value || undefined })
              }
              className="mt-1 rounded-lg"
              aria-label="Filter to date"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm">Time window</Label>
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
          <Label className="text-sm">Source type</Label>
          <div className="mt-2 flex flex-wrap gap-4">
            {SOURCE_TYPES.map((type) => (
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
        <div>
          <Label className="text-sm">Speaker role</Label>
          <div className="mt-2 flex flex-wrap gap-4">
            {SPEAKER_ROLES.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={roles.includes(role.id)}
                  onCheckedChange={(checked) =>
                    handleRoleToggle(role.id, !!checked)
                  }
                  aria-label={`Filter by ${role.label}`}
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm">Authority band</Label>
          <div className="mt-2 flex flex-wrap gap-4">
            {AUTHORITY_BANDS.map((band) => (
              <label
                key={band.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={authorityBands.includes(band.id)}
                  onCheckedChange={(checked) =>
                    handleAuthorityToggle(band.id, !!checked)
                  }
                  aria-label={`Filter by ${band.label} authority`}
                />
                <span>{band.label}</span>
              </label>
            ))}
          </div>
        </div>
        {count === 0 && (
          <p className="text-sm text-muted-foreground" role="status">
            No results match the current filters. Try widening the time window
            or clearing some filters.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
