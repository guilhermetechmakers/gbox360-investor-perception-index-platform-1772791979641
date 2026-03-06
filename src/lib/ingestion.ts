/**
 * Integration layer: ingestion connectors for news, social, and earnings.
 * Idempotent ingestion with retry logic; preserves raw payloads for audit.
 * All connectors are read-only and rate-limited when calling external APIs.
 */

import { getAuthorityWeight } from "@/lib/authority-weighting"
import { computeCredibilityProxy } from "@/lib/credibility-proxy"
import type { NarrativeEventCanonical } from "@/types/narrative"

export type SourceType = "Analyst" | "Media" | "Retail"

export interface IngestionPayload {
  id?: string
  source: string
  platform?: string
  source_type?: SourceType
  raw_text: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  published_at?: string
  company_id?: string
  /** Preserved for audit; never destructively transformed */
  raw_payload: Record<string, unknown>
}

export interface IngestionResult {
  success: boolean
  eventId?: string
  canonical?: NarrativeEventCanonical
  error?: string
  retryCount?: number
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Derive canonical narrative event from payload; compute authority_weight and credibility_proxy.
 * Preserves raw_payload for audit.
 */
export function toCanonicalFromPayload(
  payload: IngestionPayload,
  companyId: string
): NarrativeEventCanonical {
  const sourceType = payload.source_type ?? inferSourceType(payload.source, payload.platform)
  const integrationId = payload.platform
  const authority_weight = getAuthorityWeight(sourceType, integrationId)
  const credibility_proxy = computeCredibilityProxy(
    payload.raw_text ?? "",
    payload.published_at,
    "medium"
  )
  const created_at = payload.published_at ?? new Date().toISOString()
  const daysSince =
    (Date.now() - new Date(created_at).getTime()) / (24 * 60 * 60 * 1000)
  const decay_score = Math.pow(0.5, daysSince / 14)

  return {
    id: payload.id ?? `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    company_id: companyId,
    source_platform: payload.platform ?? payload.source ?? "unknown",
    speaker_entity: payload.speaker_entity ?? "unknown",
    speaker_role: payload.speaker_role,
    audience_class: payload.audience_class,
    raw_text: String(payload.raw_text ?? "").trim() || "(no text)",
    created_at,
    updated_at: created_at,
    authority_weight,
    credibility_proxy,
    topic_classification: "",
    decay_score,
    is_persistent: true,
    raw_payload: payload.raw_payload ?? {},
  }
}

function inferSourceType(source: string, platform?: string): string {
  const s = String(source ?? "").toLowerCase()
  const p = String(platform ?? "").toLowerCase()
  if (
    s.includes("analyst") ||
    p.includes("earnings") ||
    p.includes("transcript")
  )
    return "Analyst"
  if (
    s.includes("news") ||
    s.includes("reuters") ||
    s.includes("bloomberg") ||
    p.includes("news")
  )
    return "Media"
  return "Retail"
}

/**
 * Idempotent ingest: run fn with retries; return result with canonical event.
 * Preserves raw payload in canonical.raw_payload.
 */
export async function ingestWithRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; retryDelayMs?: number }
): Promise<{ data: T | null; retryCount: number; error?: string }> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES
  const retryDelayMs = options?.retryDelayMs ?? RETRY_DELAY_MS
  let lastError: Error | null = null
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const data = await fn()
      return { data: data ?? null, retryCount: i }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (i < maxRetries) await sleep(retryDelayMs * (i + 1))
    }
  }
  return {
    data: null,
    retryCount: maxRetries,
    error: lastError?.message ?? "Unknown error",
  }
}

/** Mock news source: returns a single payload for testing. Idempotent for same key. */
export async function mockNewsFetch(
  _companyId: string,
  _since: string,
  idempotencyKey?: string
): Promise<IngestionPayload | null> {
  if (!idempotencyKey) return null
  return {
    id: `news-${idempotencyKey}`,
    source: "Reuters",
    platform: "news_wire",
    source_type: "Media",
    raw_text: "Company reported quarterly results. Management expressed confidence in outlook.",
    speaker_entity: "Reuters",
    audience_class: "public",
    published_at: new Date().toISOString(),
    company_id: _companyId,
    raw_payload: { source: "mock_news", key: idempotencyKey },
  }
}

/** Mock social source: returns a single payload. Read-only, rate-limited in production. */
export async function mockSocialFetch(
  _companyId: string,
  _since: string,
  idempotencyKey?: string
): Promise<IngestionPayload | null> {
  if (!idempotencyKey) return null
  return {
    id: `social-${idempotencyKey}`,
    source: "X",
    platform: "social_x",
    source_type: "Retail",
    raw_text: "Maybe the stock will go up. I think we should hold.",
    speaker_entity: "User",
    audience_class: "retail",
    published_at: new Date().toISOString(),
    company_id: _companyId,
    raw_payload: { source: "mock_social", key: idempotencyKey },
  }
}

/** Mock earnings transcript batch: returns one payload. Idempotent for same key. */
export async function mockEarningsBatch(
  _companyId: string,
  _since: string,
  idempotencyKey?: string
): Promise<IngestionPayload | null> {
  if (!idempotencyKey) return null
  return {
    id: `earnings-${idempotencyKey}`,
    source: "Earnings Call",
    platform: "earnings_transcript",
    source_type: "Analyst",
    raw_text:
      "We are confident in our growth trajectory. I believe we will exceed expectations. Our team has delivered strong results.",
    speaker_entity: "CEO",
    speaker_role: "Executive",
    audience_class: "investors",
    published_at: new Date().toISOString(),
    company_id: _companyId,
    raw_payload: { source: "mock_earnings", key: idempotencyKey },
  }
}

/**
 * Run one mock ingestion cycle: news + social + earnings, with retry and raw payload preservation.
 * Returns array of canonical events for store (or audit).
 */
export async function runMockIngestionCycle(
  companyId: string,
  idempotencyKey: string
): Promise<IngestionResult[]> {
  const results: IngestionResult[] = []
  const sources: Array<() => Promise<IngestionPayload | null>> = [
    () => mockNewsFetch(companyId, "", idempotencyKey),
    () => mockSocialFetch(companyId, "", idempotencyKey),
    () => mockEarningsBatch(companyId, "", idempotencyKey),
  ]
  for (const fetchFn of sources) {
    const { data, retryCount, error } = await ingestWithRetry(fetchFn)
    const payload = data ?? null
    if (payload) {
      const canonical = toCanonicalFromPayload(payload, companyId)
      results.push({
        success: true,
        eventId: canonical.id,
        canonical,
        retryCount,
      })
    } else {
      results.push({
        success: false,
        error: error ?? "No payload",
        retryCount,
      })
    }
  }
  return results
}
