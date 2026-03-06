/**
 * SearchBar — Typeahead company search; on select triggers companyId update / navigation.
 */

import { TypeaheadSearch } from "@/components/search"
import { cn } from "@/lib/utils"
import type { Company } from "@/types/company"

export interface SearchBarProps {
  onSelectCompany?: (company: Company) => void
  placeholder?: string
  className?: string
  /** When true, navigate to company view on select (default when onSelectCompany not set). */
  navigateOnSelect?: boolean
}

export function SearchBar({
  onSelectCompany,
  placeholder = "Search companies...",
  className,
  navigateOnSelect = true,
}: SearchBarProps) {
  return (
    <TypeaheadSearch
      className={cn("max-w-[280px]", className)}
      placeholder={placeholder}
      onSelect={onSelectCompany}
      navigateOnSelect={!onSelectCompany && navigateOnSelect}
      aria-label="Search companies"
    />
  )
}
