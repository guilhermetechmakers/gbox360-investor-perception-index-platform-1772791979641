/**
 * Rule-based topic classification: keywords, entities, phrases → narrative topic ids.
 * Returns candidate_topic_ids with confidence scores for hybrid classification.
 */

export interface TopicRule {
  id: string
  name: string
  keywords: string[]
  phrases?: string[]
  /** Optional: speaker role or audience class boost */
  speakerRoleHint?: string[]
  audienceClassHint?: string[]
}

/** Default rule set for MVP (can be loaded from config later). */
const DEFAULT_TOPIC_RULES: TopicRule[] = [
  {
    id: "growth-outlook",
    name: "Growth & Outlook",
    keywords: ["growth", "outlook", "revenue", "guidance", "expectations", "trajectory", "confidence"],
    phrases: ["exceed expectations", "strong results", "growth trajectory"],
  },
  {
    id: "earnings-results",
    name: "Earnings & Results",
    keywords: ["earnings", "quarterly", "results", "beat", "miss", "eps", "revenue"],
    phrases: ["quarterly results", "earnings call", "reported results"],
  },
  {
    id: "risk-volatility",
    name: "Risk & Volatility",
    keywords: ["risk", "volatility", "uncertainty", "headwinds", "challenges", "concern"],
    phrases: ["market volatility", "macro headwinds", "geopolitical risk"],
  },
  {
    id: "governance-esg",
    name: "Governance & ESG",
    keywords: ["governance", "esg", "sustainability", "board", "compliance", "ethics"],
    phrases: ["board of directors", "sustainability report", "esg metrics"],
  },
]

const normalizedCache = new Map<string, string>()

function normalize(text: string): string {
  const key = text
  if (normalizedCache.has(key)) return normalizedCache.get(key)!
  const n = text.toLowerCase().trim().replace(/\s+/g, " ")
  normalizedCache.set(key, n)
  return n
}

export interface CandidateTopic {
  topic_id: string
  topic_name: string
  confidence: number
  matched_keywords: string[]
}

/**
 * Run rule-based topic extraction on text and optional speaker/audience context.
 * Returns up to maxCandidates candidate topics sorted by confidence.
 */
export function ruleBasedTopicExtraction(
  text: string | null | undefined,
  options?: {
    speakerRole?: string
    audienceClass?: string
    rules?: TopicRule[]
    maxCandidates?: number
  }
): CandidateTopic[] {
  const raw = String(text ?? "").trim()
  if (!raw) return []

  const rules = options?.rules ?? DEFAULT_TOPIC_RULES
  const maxCandidates = options?.maxCandidates ?? 5
  const normalized = normalize(raw)
  const speakerRole = options?.speakerRole ?? ""
  const audienceClass = options?.audienceClass ?? ""

  const scored: Array<CandidateTopic & { score: number }> = []

  for (const rule of rules) {
    const matched_keywords: string[] = []
    let score = 0

    for (const kw of rule.keywords ?? []) {
      const nkw = normalize(kw)
      if (normalized.includes(nkw)) {
        matched_keywords.push(kw)
        score += 0.3
      }
    }
    for (const phrase of rule.phrases ?? []) {
      const nph = normalize(phrase)
      if (normalized.includes(nph)) {
        score += 0.5
      }
    }
    if (rule.speakerRoleHint?.length && speakerRole) {
      const sr = normalize(speakerRole)
      if (rule.speakerRoleHint.some((h) => normalize(h) === sr || sr.includes(normalize(h)))) {
        score += 0.1
      }
    }
    if (rule.audienceClassHint?.length && audienceClass) {
      const ac = normalize(audienceClass)
      if (rule.audienceClassHint.some((h) => normalize(h) === ac || ac.includes(normalize(h)))) {
        score += 0.1
      }
    }

    if (score > 0) {
      const confidence = Math.min(1, score)
      scored.push({
        topic_id: rule.id,
        topic_name: rule.name,
        confidence,
        matched_keywords,
        score: confidence,
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, maxCandidates).map(({ score: _s, ...rest }) => rest)
}

/**
 * Get best single topic id for assignment (highest confidence above threshold).
 */
export function getBestTopicId(
  text: string | null | undefined,
  options?: { threshold?: number; speakerRole?: string; audienceClass?: string; rules?: TopicRule[] }
): string | null {
  const candidates = ruleBasedTopicExtraction(text, {
    speakerRole: options?.speakerRole,
    audienceClass: options?.audienceClass,
    rules: options?.rules,
    maxCandidates: 1,
  })
  const threshold = options?.threshold ?? 0.2
  const best = candidates[0]
  return best && best.confidence >= threshold ? best.topic_id : null
}
