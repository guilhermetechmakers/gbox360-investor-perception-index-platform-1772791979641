/**
 * IPI (Investor Perception Index) types
 */

export interface IPIWeights {
  narrative: number
  credibility: number
  risk: number
}

/** Spec-aligned IPI record for Company View / API responses */
export interface IPIRecord {
  id: string
  companyId: string
  windowStart: string
  windowEnd: string
  score: number
  direction: "up" | "down" | "flat"
  topNarratives: Array<{ narrativeId: string; scoreImpact: number; summary: string }>
  credibilityProxy: number
  riskProxy: number
}

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

/** POST /ipi/calculate request */
export interface IPICalculateInput {
  companyId: string
  timeWindowStart: string
  timeWindowEnd: string
  weights?: Partial<IPIWeights>
}

/** POST /ipi/calculate response */
export interface IPICalculateResult {
  totalScore: number
  narrativeScore: number
  credibilityScore: number
  riskScore: number
  weightsUsed: IPIWeights
  breakdown: {
    narrative: { score: number; contribution: number; explanation: string }
    credibility: { score: number; contribution: number; explanation: string }
    risk: { score: number; contribution: number; explanation: string }
  }
  explainability: string[]
  provisionalNotice?: string
}

/** POST /ipi/sandbox request */
export interface IPISandboxInput {
  companyId: string
  timeWindowStart: string
  timeWindowEnd: string
  provisionalWeights: IPIWeights
  scenarioName?: string
  iterations?: number
  scenarios?: Array<{ name: string; weights: IPIWeights }>
}

/** POST /ipi/sandbox response item */
export interface IPISandboxResult {
  scenarioName: string
  totalScore: number
  narrativeScore: number
  credibilityScore: number
  riskScore: number
  weightsUsed: IPIWeights
  breakdown: IPICalculateResult["breakdown"]
  explanation?: string
}
