import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export const TIME_WINDOW_OPTIONS = [
  { value: "1D", label: "1 Day" },
  { value: "1W", label: "1 Week" },
  { value: "2W", label: "2 Weeks" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
] as const

export type TimeWindowValue = (typeof TIME_WINDOW_OPTIONS)[number]["value"]

interface CompanyTimeWindowSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CompanyTimeWindowSelect({
  value,
  onChange,
  className,
}: CompanyTimeWindowSelectProps) {
  const current = value ?? "1W"
  const validValue = TIME_WINDOW_OPTIONS.some((o) => o.value === current)
    ? current
    : "1W"

  return (
    <Select value={validValue} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[140px]", className)}>
        <SelectValue placeholder="Time window" />
      </SelectTrigger>
      <SelectContent>
        {TIME_WINDOW_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
