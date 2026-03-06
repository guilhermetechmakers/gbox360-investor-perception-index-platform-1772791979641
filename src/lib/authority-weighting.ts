/**
 * Authority Weighting Engine
 * Produces per-narrative and per-event authority weights derived from source type
 * with a static base mapping and per-integration overrides.
 * Analyst > Media > Retail. Fallback for unknown: 0.1
 */

export type SourceType = "Analyst" | "Media" | "Retail" | string

export interface AuthorityMapping {
  source_type: string
  base_weight: number
  overrides?: Record<string, number>
}

const DEFAULT_UNKNOWN_WEIGHT = 0.1

/** Static base mapping: Analyst > Media > Retail */
const BASE_AUTHORITY_MAP: Record<string, number> = {
  Analyst: 0.9,
  Media: 0.6,
  Retail: 0.3,
}

/** Per-integration overrides (integration_id -> weight) */
const INTEGRATION_OVERRIDES: Record<string, Record<string, number>> = {
  earnings_transcript: { Analyst: 0.95 },
  news_wire: { Media: 0.7 },
  social_x: { Retail: 0.25 },
}

/**
 * Get authority weight for a source type, with optional integration override.
 * Returns deterministic value; unknown sources default to 0.1.
 */
export function getAuthorityWeight(
  sourceType: SourceType | null | undefined,
  integrationId?: string | null
): number {
  const normalized = String(sourceType ?? "").trim()
  if (!normalized) return DEFAULT_UNKNOWN_WEIGHT

  const integrationOverrides = integrationId
    ? INTEGRATION_OVERRIDES[integrationId]
    : undefined
  const override =
    integrationOverrides?.[normalized] ?? integrationOverrides?.[normalized]

  if (typeof override === "number" && override >= 0 && override <= 1) {
    return override
  }

  const base = BASE_AUTHORITY_MAP[normalized]
  return typeof base === "number" ? base : DEFAULT_UNKNOWN_WEIGHT
}

/**
 * Normalize weights across sources so total sums to a stable range (e.g., 0–1 per source).
 * For per-event use, each event gets its own weight; no cross-event normalization needed.
 */
export function normalizeWeights(weights: number[]): number[] {
  const list = Array.isArray(weights) ? weights : []
  if (list.length === 0) return []
  const sum = list.reduce((a, b) => a + b, 0)
  if (sum <= 0) return list.map(() => 0)
  return list.map((w) => w / sum)
}

/**
 * Serialization-friendly representation for audit trails.
 */
export function serializeAuthorityMapping(
  sourceType: SourceType,
  weight: number,
  integrationId?: string | null
): AuthorityMapping {
  return {
    source_type: String(sourceType ?? "unknown"),
    base_weight: weight,
    overrides: integrationId ? { [integrationId]: weight } : undefined,
  }
}
