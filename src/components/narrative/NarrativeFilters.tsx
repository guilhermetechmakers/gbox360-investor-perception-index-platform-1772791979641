import { CompanyTimeWindowSelect } from "@/components/dashboard/CompanyTimeWindowSelect"
import { DateRangePicker } from "@/components/ipi"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORM_OPTIONS = ["news", "social", "transcripts", ""]
const SOURCE_OPTIONS = ["analyst", "media", "retail", "corporate", ""]

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
  source?: string
  onSourceChange?: (value: string) => void
  platform?: string
  onPlatformChange?: (value: string) => void
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
  source = "",
  onSourceChange,
  platform = "",
  onPlatformChange,
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
        {onSourceChange && (
          <div className="space-y-1.5">
            <Label htmlFor="filter-source" className="sr-only">Source</Label>
            <Select value={source || "all"} onValueChange={(v) => onSourceChange(v === "all" ? "" : v)}>
              <SelectTrigger id="filter-source" className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {SOURCE_OPTIONS.filter(Boolean).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {onPlatformChange && (
          <div className="space-y-1.5">
            <Label htmlFor="filter-platform" className="sr-only">Platform</Label>
            <Select value={platform || "all"} onValueChange={(v) => onPlatformChange(v === "all" ? "" : v)}>
              <SelectTrigger id="filter-platform" className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                {PLATFORM_OPTIONS.filter(Boolean).map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
