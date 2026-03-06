/**
 * TypeaheadSearchModule — Company search with autosuggest for 404 discovery.
 * Uses shared TypeaheadSearch (debounce, keyboard nav, highlight). Gracefully degrades when API is unavailable.
 */
import { TypeaheadSearch } from "@/components/search"

interface TypeaheadSearchModuleProps {
  className?: string
  placeholder?: string
}

export function TypeaheadSearchModule({
  className,
  placeholder = "Search companies to find IPI data...",
}: TypeaheadSearchModuleProps) {
  return (
    <TypeaheadSearch
      className={className}
      placeholder={placeholder}
      navigateOnSelect={true}
      aria-label="Search companies to find IPI data"
    />
  )
}
