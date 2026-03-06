import { api } from "@/lib/api"
import type { DashboardData } from "@/types/dashboard"

const MOCK_WATCHED = [
  { id: "1", name: "Acme Corp", ticker: "ACME", ipi: 72, changeDirection: "up" as const, changeValue: 3 },
  { id: "2", name: "TechFlow Inc", ticker: "TFLW", ipi: 58, changeDirection: "down" as const, changeValue: -5 },
  { id: "3", name: "Global Industries", ticker: "GLB", ipi: 81, changeDirection: "neutral" as const },
]

const MOCK_IPI_CHANGES = [
  { id: "c1", companyId: "1", companyName: "Acme Corp", companyTicker: "ACME", ipiDelta: 3, ipiValue: 72, timestamp: new Date().toISOString(), narrativeSummary: "Strong earnings guidance" },
  { id: "c2", companyId: "2", companyName: "TechFlow Inc", companyTicker: "TFLW", ipiDelta: -5, ipiValue: 58, timestamp: new Date(Date.now() - 3600000).toISOString(), narrativeSummary: "Supply chain concerns" },
  { id: "c3", companyId: "3", companyName: "Global Industries", companyTicker: "GLB", ipiDelta: 0, ipiValue: 81, timestamp: new Date(Date.now() - 7200000).toISOString(), narrativeSummary: "Stable outlook" },
]

const MOCK_ALERTS = [
  { id: "a1", level: "info" as const, message: "IPI threshold alert: Acme Corp moved +3 points", timestamp: new Date().toISOString() },
  { id: "a2", level: "warning" as const, message: "TechFlow Inc IPI dropped 5 points in 1W", timestamp: new Date(Date.now() - 3600000).toISOString() },
]

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const data = await api.get<DashboardData>("/dashboard")
      const watched = Array.isArray(data?.watched) ? data.watched : []
      const ipiChanges = Array.isArray(data?.ipiChanges) ? data.ipiChanges : []
      const alerts = Array.isArray(data?.alerts) ? data.alerts : []
      return {
        watched: watched ?? [],
        ipiChanges: ipiChanges ?? [],
        alerts: alerts ?? [],
        companies: Array.isArray(data?.companies) ? data.companies : [],
      }
    } catch {
      return {
        watched: MOCK_WATCHED,
        ipiChanges: MOCK_IPI_CHANGES,
        alerts: MOCK_ALERTS,
        companies: [],
      }
    }
  },
}
