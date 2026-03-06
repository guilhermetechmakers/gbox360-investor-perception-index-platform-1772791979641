/**
 * Drill-down & Explainability Toolkit — data models and API shapes.
 * All types support null-safe access; use optional chaining and defaults.
 */

/** NarrativeEvent schema (explainability API) */
export interface ExplainabilityNarrativeEvent {
  id: string
  source: string
  platform: string
  speakerName: string | null
  speakerRole: string | null
  audienceClass: string
  rawText: string
  timestamp: string
  payloadRef: string | null
  metadata?: Record<string, unknown>
  weight?: number
  eventIds?: string[]
}

/** Underlying event for a narrative */
export interface ExplainabilityEvent {
  id: string
  narrativeId: string
  type: string
  timestamp: string
  details?: Record<string, unknown>
  payloadRef: string | null
}

/** Authority source with weight (static weights with dynamic context) */
export interface AuthoritySource {
  id: string
  name: string
  weight: number
}

/** Credibility proxy indicator */
export interface CredibilityProxy {
  id: string
  name: string
  value: number
}

/** IPI result with components and delta */
export interface IPIResult {
  companyId: string
  windowStart: string
  windowEnd: string
  currentScore: number
  delta: number
  components: {
    narrativeScore: number
    credibilityScore: number
    riskProxyScore: number
  }
}

/** Raw payload reference for presigned URL access */
export interface RawPayload {
  id: string
  payloadRef: string
  s3Key?: string
  mimeType?: string
  size?: number
  createdAt: string
  accessControl?: string
}

/** Audit log entry */
export interface ExplainabilityAuditLog {
  id: string
  userId: string
  companyId: string
  eventId: string
  action: string
  note?: string
  timestamp: string
  payload?: Record<string, unknown>
}

/** GET /ipi/explainability/top-narratives response */
export interface TopNarrativesResponse {
  narratives: ExplainabilityNarrativeEvent[]
  total: number
}

/** GET /ipi/explainability/events response */
export interface ExplainabilityEventsResponse {
  events: ExplainabilityEvent[]
}

/** GET /ipi/explainability/authority-breakdown response */
export interface AuthorityBreakdownResponse {
  sources: AuthoritySource[]
}

/** GET /ipi/explainability/credibility-proxy response */
export interface CredibilityProxyResponse {
  proxies: CredibilityProxy[]
}

/** POST /ipi/explainability/experiments request */
export interface ExperimentRequest {
  companyId: string
  start: string
  end: string
  provisionalWeights: Record<string, number>
}

/** POST /ipi/explainability/experiments response */
export interface ExperimentResponse {
  currentScore: number
  delta: number
  components: IPIResult["components"]
}

/** GET /payload/search response */
export interface PayloadSearchResponse {
  payloads: RawPayload[]
}
