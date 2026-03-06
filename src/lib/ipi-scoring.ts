/**
 * IPI Scoring Engine
 * Computes Investor Perception Index using provisional weights:
 * Narrative 40%, Credibility 40%, Risk proxy 20%
 */

export interface IPIWeights {
  narrative: number
  credibility: number
  risk: number
}

export const DEFAULT_IPI_WEIGHTS: IPIWeights = {
  narrative: 0.4,
  credibility: 0.4,
  risk: 0.2,
}

export interface NarrativeEventInput {
  authority_weight: number
  credibility_proxy: number
  decay_score?: number
  raw_text?: string
}

export interface IPIBreakdown {
  narrative: { score: number; contribution: number; explanation: string }
  credibility: { score: number; contribution: number; explanation: string }
  risk: { score: number; contribution: number; explanation: string }
}

export interface IPIResult {
  totalScore: number
  narrativeScore: number
  credibilityScore: number
  riskScore: number
  weightsUsed: IPIWeights
  breakdown: IPIBreakdown
  explainability: string[]
  provisionalNotice?: string
}

function normalizeWeights(w: Partial<IPIWeights> | null | undefined): IPIWeights {
  const n = Number(w?.narrative) || 0
  const c = Number(w?.credibility) || 0
  const r = Number(w?.risk) || 0
  const sum = n + c + r
  if (sum <= 0) return { ...DEFAULT_IPI_WEIGHTS }
  return {
    narrative: n / sum,
    credibility: c / sum,
    risk: r / sum,
  }
}

/**
 * Aggregate narrative score from events (consider decay, weight, volume).
 */
function aggregateNarrativeScore(
  events: NarrativeEventInput[] | null | undefined
): number {
  const list = Array.isArray(events) ? events : []
  if (list.length === 0) return 0

  const weighted = list.map((e) => {
    const auth = Number(e.authority_weight) || 0
    const cred = Number(e.credibility_proxy) || 0
    const decayRaw = Number(e.decay_score)
    const decay = typeof decayRaw === "number" && !Number.isNaN(decayRaw) ? decayRaw : 1
    return (auth * 0.5 + cred * 0.5) * decay
  })

  const sum = weighted.reduce((a, b) => a + b, 0)
  const avg = sum / list.length
  return Math.min(100, Math.max(0, avg * 100))
}

/**
 * Aggregate credibility score from events.
 */
function aggregateCredibilityScore(
  events: NarrativeEventInput[] | null | undefined
): number {
  const list = Array.isArray(events) ? events : []
  if (list.length === 0) return 0

  const sum = list.reduce((a, e) => a + (Number(e.credibility_proxy) || 0), 0)
  const avg = sum / list.length
  return Math.min(100, Math.max(0, avg * 100))
}

/**
 * Risk proxy: volatility of credibility, variability across sources, or deterministic flag.
 */
function computeRiskProxy(
  events: NarrativeEventInput[] | null | undefined
): number {
  const list = Array.isArray(events) ? events : []
  if (list.length === 0) return 0

  const creds = list.map((e) => Number(e.credibility_proxy) || 0).filter(Boolean)
  if (creds.length === 0) return 0

  const mean = creds.reduce((a, b) => a + b, 0) / creds.length
  const variance =
    creds.reduce((a, c) => a + (c - mean) ** 2, 0) / creds.length
  const std = Math.sqrt(variance)

  // Higher std = higher risk; invert to 0–100 scale (lower risk = higher score)
  const riskRaw = Math.min(1, std * 2)
  const score = (1 - riskRaw) * 100
  return Math.min(100, Math.max(0, score))
}

/**
 * Compute IPI for a company and time window.
 * Deterministic given same inputs.
 */
export function computeIPI(
  events: NarrativeEventInput[] | null | undefined,
  weights?: Partial<IPIWeights> | null
): IPIResult {
  const list = Array.isArray(events) ? events : []
  const w = normalizeWeights(weights)

  const narrativeScore = aggregateNarrativeScore(list)
  const credibilityScore = aggregateCredibilityScore(list)
  const riskScore = computeRiskProxy(list)

  const totalScore =
    narrativeScore * w.narrative +
    credibilityScore * w.credibility +
    riskScore * w.risk

  const breakdown: IPIBreakdown = {
    narrative: {
      score: narrativeScore,
      contribution: narrativeScore * w.narrative,
      explanation: `Narrative derived from ${list.length} events (authority + credibility, decay).`,
    },
    credibility: {
      score: credibilityScore,
      contribution: credibilityScore * w.credibility,
      explanation: `Credibility proxy from ${list.length} events (management language, repetition).`,
    },
    risk: {
      score: riskScore,
      contribution: riskScore * w.risk,
      explanation: `Risk proxy from credibility variability across ${list.length} sources.`,
    },
  }

  const explainability = [
    `Total score: ${totalScore.toFixed(1)} (weighted sum)`,
    `Weights: Narrative ${(w.narrative * 100).toFixed(0)}%, Credibility ${(w.credibility * 100).toFixed(0)}%, Risk ${(w.risk * 100).toFixed(0)}%`,
    `Provisional weights. Subject to change.`,
  ]

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    narrativeScore: Math.round(narrativeScore * 10) / 10,
    credibilityScore: Math.round(credibilityScore * 10) / 10,
    riskScore: Math.round(riskScore * 10) / 10,
    weightsUsed: w,
    breakdown,
    explainability,
    provisionalNotice: "Weights are provisional and may be updated.",
  }
}
