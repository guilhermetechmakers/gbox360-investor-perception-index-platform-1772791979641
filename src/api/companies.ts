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
  /** GET /api/search/companies — spec-aligned search with pagination. Returns { data, count }. */
  searchCompanies: async (params: {
    query?: string
    page?: number
    limit?: number
    filters?: string
  }): Promise<{ data: Company[]; count: number }> => {
    try {
      const search = new URLSearchParams()
      if (params.query != null && params.query.trim() !== "")
        search.set("query", params.query.trim())
      if (params.page != null) search.set("page", String(params.page))
      if (params.limit != null) search.set("limit", String(params.limit))
      if (params.filters != null && params.filters !== "")
        search.set("filters", params.filters)
      const res = await api.get<{ data?: Company[]; count?: number }>(
        `/search/companies?${search.toString()}`
      )
      const data = Array.isArray(res?.data) ? res.data : []
      const count = typeof res?.count === "number" ? res.count : data.length
      return { data, count }
    } catch {
      const q = (params.query ?? "").toLowerCase().trim()
      const list =
        q.length >= 2
          ? MOCK_COMPANIES.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.ticker ?? "").toLowerCase().includes(q)
            )
          : [...MOCK_COMPANIES]
      const limit = params.limit ?? 10
      const page = Math.max(0, (params.page ?? 1) - 1)
      const start = page * limit
      return {
        data: list.slice(start, start + limit),
        count: list.length,
      }
    }
  },
}
