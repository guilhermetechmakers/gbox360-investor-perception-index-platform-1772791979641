/**
 * TimeWindowDropdown — 1D, 1W, 1M, 3M, Custom.
 */

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
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "Custom", label: "Custom" },
] as const

export type TimeWindowValue = (typeof TIME_WINDOW_OPTIONS)[number]["value"]

export interface TimeWindowDropdownProps {
  value: string
  onChange: (value: string) => void
  onCustomRange?: () => void
  className?: string
}

export function TimeWindowDropdown({
  value,
  onChange,
  onCustomRange,
  className,
}: TimeWindowDropdownProps) {
  const current = value ?? "1W"
  const isCustom = current === "Custom"
  const validValue =
    TIME_WINDOW_OPTIONS.some((o) => o.value === current) && !isCustom
      ? current
      : "1W"

  const handleChange = (v: string) => {
    if (v === "Custom" && onCustomRange) {
      onCustomRange()
      return
    }
    onChange(v)
  }

  return (
    <Select
      value={isCustom ? "Custom" : validValue}
      onValueChange={handleChange}
    >
      <SelectTrigger
        className={cn("w-[140px] rounded-lg border-border focus:ring-primary", className)}
        aria-label="Time window"
      >
        <SelectValue placeholder="Time window" />
      </SelectTrigger>
      <SelectContent className="rounded-xl shadow-card">
        {TIME_WINDOW_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
