/**
 * TypeaheadSearch — Debounced company search with fuzzy match highlighting and keyboard navigation.
 * Uses data ?? [] and Array.isArray checks throughout. Integrates with dashboard and company views.
 */
import { useRef, useEffect, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { useCompanySearch } from "@/hooks/useCompanySearch"
import { Search, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getHighlightSegments } from "@/lib/highlight"
import type { Company } from "@/types/company"

export interface TypeaheadSearchProps {
  placeholder?: string
  className?: string
  /** When provided, called on select instead of navigating. */
  onSelect?: (company: Company) => void
  /** When true, navigates to /dashboard/company/:id on select (default when onSelect is not set). */
  navigateOnSelect?: boolean
  /** Input id for aria. */
  id?: string
  /** aria-label for the combobox. */
  "aria-label"?: string
}

export function TypeaheadSearch({
  placeholder = "Search companies...",
  className,
  onSelect,
  navigateOnSelect = true,
  id,
  "aria-label": ariaLabel = "Search companies",
}: TypeaheadSearchProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    showSuggestions,
    hasSuggestions,
    clearQuery,
  } = useCompanySearch()

  const safeSuggestions: Company[] = useMemo(
    () => (Array.isArray(suggestions) ? suggestions : []),
    [suggestions]
  )

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [safeSuggestions.length, query])

  const doSelect = useCallback(
    (company: Company) => {
      clearQuery()
      if (onSelect) {
        onSelect(company)
      } else if (navigateOnSelect) {
        navigate(`/dashboard/company/${company.id}`)
      }
    },
    [clearQuery, onSelect, navigateOnSelect, navigate]
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || safeSuggestions.length === 0) {
        if (e.key === "Escape") clearQuery()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((i) =>
          i < safeSuggestions.length - 1 ? i + 1 : 0
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((i) =>
          i <= 0 ? safeSuggestions.length - 1 : i - 1
        )
        return
      }
      if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < safeSuggestions.length) {
        e.preventDefault()
        const company = safeSuggestions[highlightedIndex]
        if (company) doSelect(company)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        clearQuery()
        setHighlightedIndex(-1)
      }
    },
    [showSuggestions, safeSuggestions, highlightedIndex, clearQuery, doSelect]
  )

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return
    const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [highlightedIndex])

  const showDropdown = showSuggestions && (hasSuggestions || isLoading)
  const listboxId = id ? `${id}-listbox` : "typeahead-company-listbox"

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value ?? "")}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-4 rounded-xl border-border focus-visible:ring-primary/50"
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-controls={showDropdown ? listboxId : undefined}
          aria-expanded={showDropdown}
          aria-activedescendant={
            showDropdown && highlightedIndex >= 0 && highlightedIndex < safeSuggestions.length
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
        />
      </div>
      {showDropdown && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl border border-border bg-card py-1 shadow-card animate-fade-in"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-muted-foreground" role="status">
              Searching...
            </li>
          ) : safeSuggestions.length > 0 ? (
            safeSuggestions.map((company, index) => {
              const segmentsName = getHighlightSegments(company.name, query)
              const segmentsTicker = getHighlightSegments(company.ticker ?? "", query)
              const isHighlighted = index === highlightedIndex
              return (
                <li
                  key={company.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isHighlighted}
                  tabIndex={-1}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted focus:outline-none",
                    isHighlighted && "bg-muted"
                  )}
                  onClick={() => doSelect(company)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      doSelect(company)
                    }
                  }}
                >
                  <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {segmentsName.map((seg, i) =>
                        seg.type === "match" ? (
                          <mark
                            key={i}
                            className="bg-primary/20 text-foreground rounded px-0.5 font-semibold"
                          >
                            {seg.value}
                          </mark>
                        ) : (
                          <span key={i}>{seg.value}</span>
                        )
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {segmentsTicker.map((seg, i) =>
                        seg.type === "match" ? (
                          <mark
                            key={i}
                            className="bg-primary/20 text-muted-foreground rounded px-0.5 font-medium"
                          >
                            {seg.value}
                          </mark>
                        ) : (
                          <span key={i}>{seg.value}</span>
                        )
                      )}
                    </p>
                  </div>
                </li>
              )
            })
          ) : (
            <li className="px-4 py-3 text-sm text-muted-foreground" role="status">
              No companies found. Try a different search.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
