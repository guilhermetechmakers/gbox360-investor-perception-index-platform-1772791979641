/**
 * Compact filter bar for dashboard header — time window and quick source filter.
 * Persists to URL for shareable links; minimal footprint.
 */
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESETS = [
  { id: "1D", label: "1D" },
  { id: "1W", label: "1W" },
  { id: "2W", label: "2W" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
] as const

interface CompactFilterBarProps {
  className?: string
}

export function CompactFilterBar({ className }: CompactFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const current = searchParams.get("window") ?? "1W"
  const valid = PRESETS.some((p) => p.id === current) ? current : "1W"

  const setWindow = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set("window", id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="group"
      aria-label="Quick time window filter"
    >
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 rounded-lg px-2 text-xs font-medium transition-colors",
              valid === preset.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setWindow(preset.id)}
            aria-pressed={valid === preset.id}
            aria-label={`Time window ${preset.label}`}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
