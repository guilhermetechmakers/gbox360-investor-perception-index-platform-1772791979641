import { TypeaheadSearch } from "@/components/search"
import { cn } from "@/lib/utils"
import type { Company } from "@/types/company"

interface QuickCompanySelectorProps {
  className?: string
  placeholder?: string
  onSelect?: (company: Company) => void
}

/** Dashboard header company selector — uses shared TypeaheadSearch (keyboard nav, highlight). */
export function QuickCompanySelector({
  className,
  placeholder = "Search companies...",
  onSelect,
}: QuickCompanySelectorProps) {
  return (
    <TypeaheadSearch
      className={cn("max-w-[280px]", className)}
      placeholder={placeholder}
      onSelect={onSelect}
      navigateOnSelect={!onSelect}
      aria-label="Quick company search"
    />
  )
}
