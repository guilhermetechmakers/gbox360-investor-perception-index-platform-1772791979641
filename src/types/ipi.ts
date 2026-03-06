export interface IPIScore {
  company_id: string
  score: number
  delta: number
  narrative_component: number
  credibility_component: number
  risk_component: number
  weights: { narrative: number; credibility: number; risk: number }
  window_start: string
  window_end: string
  computed_at: string
}

export interface IPITimeseriesPoint {
  timestamp: string
  score: number
  narrative: number
  credibility: number
  risk: number
}

export interface IPISimulateInput {
  company_id: string
  window_start: string
  window_end: string
  weights: { narrative: number; credibility: number; risk: number }
}
