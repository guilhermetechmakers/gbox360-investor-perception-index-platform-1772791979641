export interface WatchedCompany {
  id: string
  name: string
  ticker: string
  ipi: number
  changeDirection: "up" | "down" | "neutral"
  changeValue?: number
}

export interface IPIChange {
  id: string
  companyId: string
  companyName?: string
  companyTicker?: string
  ipiDelta: number
  ipiValue?: number
  timestamp: string
  narrativeSummary?: string
}

export interface Alert {
  id: string
  level: "info" | "warning" | "error" | "success"
  message: string
  timestamp: string
}

export interface DashboardData {
  watched: WatchedCompany[]
  ipiChanges: IPIChange[]
  alerts: Alert[]
  companies?: { id: string; name: string; ticker: string }[]
}
