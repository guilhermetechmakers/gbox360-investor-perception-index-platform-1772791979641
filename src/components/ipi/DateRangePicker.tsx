import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"

export interface DateRangePickerProps {
  start: string
  end: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  className?: string
}

const toDateString = (d: Date) => format(d, "yyyy-MM-dd")

export function DateRangePicker({
  start,
  end,
  onStartChange,
  onEndChange,
  className,
}: DateRangePickerProps) {
  const defaultEnd = toDateString(new Date())
  const defaultStart = toDateString(subDays(new Date(), 7))

  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="date-start">Start</Label>
        <Input
          id="date-start"
          type="date"
          value={start || defaultStart}
          onChange={(e) => onStartChange(e.target.value)}
          className="min-w-[140px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date-end">End</Label>
        <Input
          id="date-end"
          type="date"
          value={end || defaultEnd}
          onChange={(e) => onEndChange(e.target.value)}
          className="min-w-[140px]"
        />
      </div>
    </div>
  )
}
