import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import type { FilterState } from "@/types/invoice"

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "past_due", label: "Past Due" },
  { value: "refunded", label: "Refunded" },
  { value: "canceled", label: "Canceled" },
] as const

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const

interface FiltersBarProps {
  filter: FilterState
  onFilterChange: (next: FilterState) => void
  actions?: ReactNode
}

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function FiltersBar({ filter, onFilterChange, actions }: FiltersBarProps) {
  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onFilterChange({
      ...filter,
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
    })
  }

  const toggleStatus = (value: string) => {
    if (value === "all") {
      onFilterChange({ ...filter, status: [] })
      return
    }
    const current = filter.status ?? []
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    onFilterChange({ ...filter, status: next })
  }

  const isStatusActive = (value: string) => {
    if (value === "all") return (filter.status ?? []).length === 0
    return (filter.status ?? []).includes(value)
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
      role="search"
      aria-label="Filter invoices"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Invoice ID, description, plan..."
              value={filter.query ?? ""}
              onChange={(e) =>
                onFilterChange({ ...filter, query: e.target.value })
              }
              className="pl-9"
              aria-label="Search invoices"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-medium">
            Start date
          </Label>
          <Input
            id="start-date"
            type="date"
            value={filter.startDate ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                startDate: e.target.value || null,
              })
            }
            aria-label="Start date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            End date
          </Label>
          <Input
            id="end-date"
            type="date"
            value={filter.endDate ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                endDate: e.target.value || null,
              })
            }
            aria-label="End date"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.days}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(p.days)}
              className="transition-all hover:scale-[1.02]"
            >
              {p.label}
            </Button>
          ))}
          {actions}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="sr-only">Filter by status</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleStatus(opt.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isStatusActive(opt.value)
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:bg-muted"
            )}
            aria-pressed={isStatusActive(opt.value)}
            aria-label={`Filter by ${opt.label}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
