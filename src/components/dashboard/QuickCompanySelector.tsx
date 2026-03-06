import { useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { useCompanySearch } from "@/hooks/useCompanySearch"
import { Search, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Company } from "@/types/company"

interface QuickCompanySelectorProps {
  className?: string
  placeholder?: string
  onSelect?: (company: Company) => void
}

export function QuickCompanySelector({
  className,
  placeholder = "Search companies...",
  onSelect,
}: QuickCompanySelectorProps) {
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

  const handleSelect = useCallback(
    (company: Company) => {
      clearQuery()
      if (onSelect) {
        onSelect(company)
      } else {
        navigate(`/dashboard/company/${company.id}`)
      }
    },
    [navigate, onSelect, clearQuery]
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
    <div ref={containerRef} className={cn("relative w-full max-w-xs", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-4"
          aria-label="Search companies"
          aria-autocomplete="list"
          aria-controls={showDropdown ? "company-suggestions" : undefined}
          aria-expanded={showDropdown}
        />
      </div>
      {showDropdown && (
        <ul
          id="company-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card animate-in fade-in-0 slide-in-from-top-2"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Searching...
            </li>
          ) : (suggestions ?? []).length > 0 ? (
            (suggestions ?? []).map((company) => (
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
              No companies found
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
