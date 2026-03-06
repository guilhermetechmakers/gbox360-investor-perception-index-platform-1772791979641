import { useState, useCallback, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { companiesApi } from "@/api/companies"
import { companyKeys } from "@/hooks/useCompanies"

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useCompanySearch() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)
  const isTypingRef = useRef(false)

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: companyKeys.search(debouncedQuery),
    queryFn: () => companiesApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: 1000 * 60,
  })

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []

  const handleQueryChange = useCallback((value: string) => {
    isTypingRef.current = true
    setQuery(value ?? "")
  }, [])

  const clearQuery = useCallback(() => {
    setQuery("")
    isTypingRef.current = false
  }, [])

  return {
    query,
    setQuery: handleQueryChange,
    debouncedQuery,
    suggestions: safeSuggestions,
    isLoading,
    clearQuery,
    hasSuggestions: safeSuggestions.length > 0,
    showSuggestions: debouncedQuery.length >= MIN_QUERY_LENGTH,
  }
}
