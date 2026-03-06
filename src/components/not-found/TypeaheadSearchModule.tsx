/**
 * TypeaheadSearchModule — Company search with autosuggest for 404 discovery.
 * Debounced fetch, null-safe rendering, keyboard navigable.
 * Gracefully degrades when API is unavailable.
 */
import { useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { useCompanySearch } from "@/hooks/useCompanySearch"
import { Search, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Company } from "@/types/company"

interface TypeaheadSearchModuleProps {
  className?: string
  placeholder?: string
}

export function TypeaheadSearchModule({
  className,
  placeholder = "Search companies to find IPI data...",
}: TypeaheadSearchModuleProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    showSuggestions,
    hasSuggestions,
    clearQuery,
  } = useCompanySearch()

  const safeSuggestions: Company[] = Array.isArray(suggestions) ? suggestions : []

  const handleSelect = useCallback(
    (company: Company) => {
      clearQuery()
      navigate(`/dashboard/company/${company.id}`)
    },
    [navigate, clearQuery]
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearQuery()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [clearQuery])

  const showDropdown = showSuggestions && (hasSuggestions || isLoading)

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value ?? "")}
          className="pl-9 pr-4 rounded-xl border-border focus-visible:ring-primary/50"
          aria-label="Search companies"
          aria-autocomplete="list"
          aria-controls={showDropdown ? "not-found-company-suggestions" : undefined}
          aria-expanded={showDropdown}
        />
      </div>
      {showDropdown && (
        <ul
          id="not-found-company-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-border bg-card py-1 shadow-card animate-fade-in"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Searching...
            </li>
          ) : safeSuggestions.length > 0 ? (
            safeSuggestions.map((company) => (
              <li
                key={company.id}
                role="option"
                tabIndex={0}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                onClick={() => handleSelect(company)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelect(company)
                  }
                }}
              >
                <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.ticker}</p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No companies found. Try a different search.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
