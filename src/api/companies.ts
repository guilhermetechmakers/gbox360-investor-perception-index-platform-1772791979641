import { api } from "@/lib/api"
import type { Company } from "@/types/company"

export const companiesApi = {
  getAll: (): Promise<Company[]> => api.get<Company[]>("/companies"),
  getById: (id: string): Promise<Company> => api.get<Company>(`/companies/${id}`),
  search: (query: string): Promise<Company[]> =>
    api.get<Company[]>(`/companies/search?q=${encodeURIComponent(query)}`),
}
