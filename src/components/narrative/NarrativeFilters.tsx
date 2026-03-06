import { CompanyTimeWindowSelect } from "@/components/dashboard/CompanyTimeWindowSelect"
import { DateRangePicker } from "@/components/ipi"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface NarrativeFiltersProps {
  timeWindow: string
  onTimeWindowChange: (value: string) => void
  dateStart: string
  dateEnd: string
  onDateStartChange: (value: string) => void
  onDateEndChange: (value: string) => void
  searchQuery?: string
  onSearchChange?: (value: string) => void
  narrativeTags?: string[]
  selectedTag?: string
  onTagSelect?: (tag: string | null) => void
  className?: string
}

export function NarrativeFilters({
  timeWindow,
  onTimeWindowChange,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
  searchQuery = "",
  onSearchChange,
  narrativeTags = [],
  selectedTag,
  onTagSelect,
  className,
}: NarrativeFiltersProps) {
  const tags = Array.isArray(narrativeTags) ? narrativeTags : []

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <CompanyTimeWindowSelect value={timeWindow} onChange={onTimeWindowChange} />
        <DateRangePicker
          start={dateStart}
          end={dateEnd}
          onStartChange={onDateStartChange}
          onEndChange={onDateEndChange}
        />
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search narratives…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Search narratives"
            />
          </div>
        )}
      </div>
      {tags.length > 0 && onTagSelect && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTagSelect(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !selectedTag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-pressed={!selectedTag}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              aria-pressed={selectedTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
