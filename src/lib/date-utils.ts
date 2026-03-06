import { subDays, subWeeks, subMonths, format } from "date-fns"

export function windowToDateRange(window: string): { start: string; end: string } {
  const end = new Date()
  let start: Date
  switch (window) {
    case "1D":
      start = subDays(end, 1)
      break
    case "2W":
      start = subWeeks(end, 2)
      break
    case "30d":
      start = subDays(end, 30)
      break
    case "90d":
      start = subDays(end, 90)
      break
    case "1M":
      start = subMonths(end, 1)
      break
    case "3M":
      start = subMonths(end, 3)
      break
    case "1W":
    default:
      start = subWeeks(end, 1)
      break
  }
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  }
}
