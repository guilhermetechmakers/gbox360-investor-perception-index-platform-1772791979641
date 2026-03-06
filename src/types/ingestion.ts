/**
 * Resilient Data Ingestion — types for status, DLQ, replay, and source health.
 * All list fields consumed with data ?? [] or safeArray().
 */

export type IngestionSourceId = "news" | "social" | "earnings_transcripts"

export interface IngestionSourceStatus {
  source: IngestionSourceId
  status: "healthy" | "degraded" | "down"
  lastIngestedAt: string | null
  lastRunAt: string | null
  throughput24h: number
  errorCount24h: number
  dlqCount: number
}

export interface IngestionStatusResponse {
  sources: IngestionSourceStatus[]
  overallStatus: "healthy" | "degraded" | "down"
  lastUpdated: string
}

export interface DlqEntry {
  id: string
  source: string
  idempotencyKey: string
  payloadRef: string | null
  errorMessage: string | null
  errorCode: string | null
  retryCount: number
  lastAttemptedAt: string
  createdAt: string
  metadata: Record<string, unknown> | null
}

export interface DlqListResponse {
  items: DlqEntry[]
  count: number
}

export interface SocialTwitterReadParams {
  companyTicker: string
  since?: string
  limit?: number
}

export interface SocialTwitterItem {
  id: string
  text: string
  author: string
  createdAt: string
  url: string | null
  metrics?: { likeCount?: number; retweetCount?: number; replyCount?: number }
}

export interface SocialTwitterReadResponse {
  items: SocialTwitterItem[]
}

export interface TranscriptItem {
  id: string
  company: string
  period: string
  rawPayload?: string
  rawPayloadUrl?: string
  publishedAt: string
  sourceUrl?: string
  metadata?: Record<string, unknown>
}

export interface EarningsTranscriptsPayload {
  batchId: string
  provider: string
  transcripts: TranscriptItem[]
}

export interface EarningsTranscriptsResponse {
  batchStatus: string
  processedCount: number
  failedCount: number
  dlqCount: number
}

export interface NewsIngestionParams {
  source?: string
  since?: string
  limit?: number
}

export interface NewsIngestionResponse {
  status: string
  ingestedCount: number
  items?: Array<{ id: string; url?: string; publishedAt?: string }>
}

export interface NarrativeEventsListParams {
  source?: string
  since?: string
  until?: string
  ticker?: string
  company_id?: string
  companyId?: string
  page?: number
  limit?: number
}

export interface ReplayEventsParams {
  since: string
  source?: string
  eventId?: string
}

export interface ReplayEventsResponse {
  jobId: string
  status: string
  message?: string
  eventCount?: number
}
