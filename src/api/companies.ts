import { api } from "@/lib/api"
import type { Company } from "@/types/company"

const MOCK_COMPANIES: Company[] = [
  { id: "1", ticker: "ACME", name: "Acme Corp", sector: "Technology", created_at: new Date().toISOString() },
  { id: "2", ticker: "TFLW", name: "TechFlow Inc", sector: "Technology", created_at: new Date().toISOString() },
  { id: "3", ticker: "GLB", name: "Global Industries", sector: "Industrial", created_at: new Date().toISOString() },
  { id: "4", ticker: "FNCE", name: "Finance Holdings", sector: "Financial", created_at: new Date().toISOString() },
  { id: "5", ticker: "HLTH", name: "HealthFirst Corp", sector: "Healthcare", created_at: new Date().toISOString() },
  { id: "6", ticker: "ENRG", name: "Energy Solutions", sector: "Energy", created_at: new Date().toISOString() },
]

export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    try {
      const data = await api.get<Company[]>("/companies")
      return Array.isArray(data) ? data : MOCK_COMPANIES
    } catch {
      return MOCK_COMPANIES
    }
  },
  getById: async (id: string): Promise<Company> => {
    try {
      return await api.get<Company>(`/companies/${id}`)
    } catch {
      const found = MOCK_COMPANIES.find((c) => c.id === id)
      if (found) return found
      throw new Error("Company not found")
    }
  },
  search: async (query: string, limit = 10): Promise<Company[]> => {
    try {
      const params = new URLSearchParams({ q: query, limit: String(limit) })
      const data = await api.get<Company[] | { data: Company[] }>(
        `/companies/search?${params.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: Company[] })?.data
      return Array.isArray(list) ? list.slice(0, limit) : []
    } catch {
      const q = query.toLowerCase()
      return MOCK_COMPANIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q)
      ).slice(0, limit)
    }
  },
}
