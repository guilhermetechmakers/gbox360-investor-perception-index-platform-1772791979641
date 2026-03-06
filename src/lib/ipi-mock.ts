/**
 * IPI mock/fallback layer
 * Uses client-side engines when API is unavailable.
 * Generates deterministic mock narrative events for demo.
 */

import { computeIPI } from "@/lib/ipi-scoring"
import { toIPIInput } from "@/lib/narrative-event"
import type { NarrativeEvent } from "@/types/narrative"
import type {
  IPICalculateInput,
  IPICalculateResult,
  IPISandboxInput,
  IPISandboxResult,
} from "@/types/ipi"

const MOCK_EVENTS: NarrativeEvent[] = [
  {
    event_id: "ev-1",
    company_id: "",
    source: "Analyst",
    platform: "earnings_transcript",
    speaker: { entity: "CEO", inferred_role: "Executive" },
    audience_class: "investors",
    raw_text: "We are confident in our growth trajectory. I believe we will exceed expectations. Our team has delivered strong results.",
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
    authority_score: 0.9,
    narrative_topic_ids: ["growth"],
    created_at: new Date().toISOString(),
  },
  {
    event_id: "ev-2",
    company_id: "",
    source: "Media",
    platform: "news_wire",
    speaker: { entity: "Reuters", inferred_role: "Journalist" },
    audience_class: "public",
    raw_text: "The company reported quarterly earnings. Management suggested potential headwinds. Perhaps margins could improve.",
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
    authority_score: 0.6,
    narrative_topic_ids: ["earnings"],
    created_at: new Date().toISOString(),
  },
  {
    event_id: "ev-3",
    company_id: "",
    source: "Retail",
    platform: "social_x",
    speaker: { entity: "User", inferred_role: "Retail" },
    audience_class: "retail",
    raw_text: "Maybe the stock will go up. I think we should hold. Could be a good buy.",
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
    authority_score: 0.3,
    narrative_topic_ids: ["sentiment"],
    created_at: new Date().toISOString(),
  },
]

function mockEventsForCompany(companyId: string, _start: string, _end: string): NarrativeEvent[] {
  return MOCK_EVENTS.map((e, i) => ({
    ...e,
    company_id: companyId,
    authority_weight: e.authority_score,
    credibility_proxy: 0.6 + (i % 3) * 0.1,
  }))
}

export function mockCalculate(input: IPICalculateInput): IPICalculateResult {
  const events = mockEventsForCompany(
    input.companyId,
    input.timeWindowStart,
    input.timeWindowEnd
  )
  const inputs = toIPIInput(events)
  const result = computeIPI(inputs, input.weights)
  return {
    totalScore: result.totalScore,
    narrativeScore: result.narrativeScore,
    credibilityScore: result.credibilityScore,
    riskScore: result.riskScore,
    weightsUsed: result.weightsUsed,
    breakdown: result.breakdown,
    explainability: result.explainability,
    provisionalNotice: result.provisionalNotice,
  }
}

export function mockSandbox(input: IPISandboxInput): IPISandboxResult[] {
  const events = mockEventsForCompany(
    input.companyId,
    input.timeWindowStart,
    input.timeWindowEnd
  )
  const inputs = toIPIInput(events)

  const defaultScenarios = [
    { name: "Default", weights: { narrative: 0.4, credibility: 0.4, risk: 0.2 } },
    { name: "Narrative-heavy", weights: { narrative: 0.5, credibility: 0.35, risk: 0.15 } },
    { name: "Credibility-heavy", weights: { narrative: 0.35, credibility: 0.5, risk: 0.15 } },
  ]

  const scenarios =
    input.scenarios ??
    (input.provisionalWeights
      ? [
          { name: input.scenarioName ?? "Custom", weights: input.provisionalWeights },
          ...defaultScenarios,
        ]
      : defaultScenarios)

  return scenarios.map((s) => {
    const r = computeIPI(inputs, s.weights)
    return {
      scenarioName: s.name,
      totalScore: r.totalScore,
      narrativeScore: r.narrativeScore,
      credibilityScore: r.credibilityScore,
      riskScore: r.riskScore,
      weightsUsed: r.weightsUsed,
      breakdown: r.breakdown,
      explanation: r.explainability?.[0],
    }
  })
}
