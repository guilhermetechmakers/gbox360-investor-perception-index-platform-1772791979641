import { useQuery } from "@tanstack/react-query"
import { companiesApi } from "@/api/companies"

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
  search: (q: string) => [...companyKeys.all, "search", q] as const,
}

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: companiesApi.getAll,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  })
}

export function useCompanySearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: companyKeys.search(query),
    queryFn: () => companiesApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60,
  })
}
