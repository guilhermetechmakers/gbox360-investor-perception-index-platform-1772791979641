/**
 * Company View (IPI Summary) — spec-aligned data models for frontend and API contracts.
 * Use data ?? [] and Array.isArray() when consuming these types from API responses.
 */

/** Speaker for NarrativeEvent (name/role object or string) */
export type SpeakerView =
  | { name?: string; role?: string }
  | string

/** NarrativeEvent as used in Company View timeline (spec-aligned) */
export interface NarrativeEventView {
  id: string
  companyId?: string
  source: string
  platform?: string
  speaker: SpeakerView
  audienceClass?: string
  text?: string
  timestamp: string
  amplitude?: number
  rawPayload?: unknown
  /** Brief rationale for why this event was included in IPI */
  whyIncluded?: string
}

/** NarrativeSummary for top narratives list (spec-aligned) */
export interface NarrativeSummaryView {
  id: string
  title: string
  summary: string
  authorityScore?: number
  credibilityProxy?: number
}

/** IPI result for Company View (current score, delta, direction) */
export interface IPIResult {
  score: number
  delta: number
  direction?: "up" | "down" | "flat"
  window?: string
  timestamp?: string
}

/** Company with optional audit fields */
export interface CompanyView {
  id: string
  ticker: string
  name: string
  lastIngestAt?: string
}

/** API error shape */
export interface APIError {
  code: string
  message: string
}

/** Export request/response */
export interface ExportRequest {
  type: "csv" | "json"
  companyId: string
  window: string
  status?: "queued" | "in-progress" | "completed" | "failed"
  payload?: unknown
}

/** Sparkline point for IPI history */
export interface SparklinePoint {
  timestamp: string
  score: number
}
