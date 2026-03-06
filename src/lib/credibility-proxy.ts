/**
 * Credibility Proxy Engine
 * Derives a credibility proxy score per narrative/event using heuristics:
 * - Management language detection (first-person, certainty, hedges, directive, confidence)
 * - Repetition consistency (cross-source, time-aware with decay)
 * - Source credibility adjustments
 */

export interface CredibilityConfig {
  /** Half-life in days for time decay */
  halfLifeDays?: number
  /** Min score for certainty words */
  certaintyThreshold?: number
  /** Penalty for conflicting narratives */
  conflictPenalty?: number
}

const DEFAULT_CONFIG: Required<CredibilityConfig> = {
  halfLifeDays: 14,
  certaintyThreshold: 0.3,
  conflictPenalty: 0.2,
}

/** First-person pronouns (management language) */
const FIRST_PERSON = /\b(I|we|our|us|my|our)\b/gi

/** Certainty words */
const CERTAINTY_WORDS =
  /\b(definitely|certainly|absolutely|clearly|obviously|undoubtedly|guarantee|will|must)\b/gi

/** Hedges (reduce credibility) */
const HEDGES = /\b(maybe|perhaps|possibly|might|could|somewhat|roughly|approximately)\b/gi

/** Directive language */
const DIRECTIVE = /\b(should|must|need to|have to|recommend|suggest)\b/gi

/** Confidence cues */
const CONFIDENCE = /\b(confident|optimistic|strong|robust|solid)\b/gi

function safeLower(s: string | null | undefined): string {
  return String(s ?? "").toLowerCase().trim()
}

function countMatches(text: string, regex: RegExp): number {
  const t = safeLower(text)
  if (!t) return 0
  const matches = t.match(regex)
  return Array.isArray(matches) ? matches.length : 0
}

/**
 * Management language detection score (0–1).
 * Higher for first-person, certainty, directive, confidence; lower for hedges.
 */
export function detectManagementLanguage(
  rawText: string | null | undefined
): number {
  const text = safeLower(rawText)
  if (!text || text.length < 10) return 0.5

  const firstPerson = countMatches(text, FIRST_PERSON)
  const certainty = countMatches(text, CERTAINTY_WORDS)
  const hedges = countMatches(text, HEDGES)
  const directive = countMatches(text, DIRECTIVE)
  const confidence = countMatches(text, CONFIDENCE)

  const positive = firstPerson + certainty + directive + confidence
  const negative = hedges * 2
  const raw = Math.max(0, positive - negative)
  const normalized = Math.min(1, raw / 8)
  return Math.round(normalized * 100) / 100
}

/**
 * Time-aware repetition score with decay.
 * @param lastSeenAt - timestamp of last occurrence
 * @param now - current timestamp
 * @param halfLifeDays - half-life for decay
 */
export function repetitionScoreWithDecay(
  lastSeenAt: string | number | Date | null | undefined,
  now: Date = new Date(),
  halfLifeDays: number = DEFAULT_CONFIG.halfLifeDays
): number {
  if (!lastSeenAt) return 0.5
  const last = new Date(lastSeenAt).getTime()
  const n = now.getTime()
  const daysSince = (n - last) / (24 * 60 * 60 * 1000)
  const decay = Math.pow(0.5, daysSince / halfLifeDays)
  return Math.min(1, Math.max(0, decay))
}

/**
 * Source credibility modifier (0.5–1.2).
 * Tier: high=1.2, medium=1.0, low=0.7
 */
export function getSourceCredibilityModifier(
  tier: "high" | "medium" | "low" | string | null | undefined
): number {
  const t = String(tier ?? "medium").toLowerCase()
  if (t === "high") return 1.2
  if (t === "low") return 0.7
  return 1.0
}

/**
 * Compute credibility proxy score for a single narrative/event.
 * Returns 0–1 normalized score.
 */
export function computeCredibilityProxy(
  rawText: string | null | undefined,
  lastSeenAt?: string | number | Date | null,
  sourceTier?: "high" | "medium" | "low" | string | null,
  config?: CredibilityConfig
): number {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const mgmt = detectManagementLanguage(rawText)
  const decay = repetitionScoreWithDecay(lastSeenAt, new Date(), cfg.halfLifeDays)
  const modifier = getSourceCredibilityModifier(sourceTier)

  const raw = (mgmt * 0.5 + decay * 0.5) * modifier
  const clamped = Math.min(1, Math.max(0, raw))
  return Math.round(clamped * 100) / 100
}
