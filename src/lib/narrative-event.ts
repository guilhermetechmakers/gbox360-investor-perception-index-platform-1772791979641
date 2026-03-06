/**
 * NarrativeEvent canonical model & persistence helpers
 * Maps between API shape and canonical schema; computes authority_weight and credibility_proxy
 */

import { getAuthorityWeight } from "@/lib/authority-weighting"
import { computeCredibilityProxy } from "@/lib/credibility-proxy"
import type { NarrativeEvent, NarrativeEventCanonical } from "@/types/narrative"
import type { NarrativeEventInput } from "@/lib/ipi-scoring"

/** Map API NarrativeEvent to canonical with computed fields */
export function toCanonical(event: NarrativeEvent | null | undefined): NarrativeEventCanonical | null {
  if (!event) return null

  const ev = event as unknown as Record<string, unknown>
  const sourceType = (ev.source_type as string | undefined) ?? inferSourceType(event.source, event.platform)
  const integrationId = ev.integration_id as string | undefined

  const authority_weight =
    event.authority_weight ??
    getAuthorityWeight(sourceType, integrationId)

  const credibility_proxy =
    event.credibility_proxy ??
    computeCredibilityProxy(
      event.raw_text,
      event.published_at ?? event.created_at,
      "medium"
    )

  const now = new Date()
  const published = event.published_at ? new Date(event.published_at) : now
  const daysSince = (now.getTime() - published.getTime()) / (24 * 60 * 60 * 1000)
  const decay = Math.pow(0.5, daysSince / 14)

  return {
    id: event.event_id,
    company_id: event.company_id ?? "",
    source_platform: event.platform ?? event.source ?? "unknown",
    speaker_entity: event.speaker?.entity ?? "unknown",
    speaker_role: event.speaker?.inferred_role,
    audience_class: event.audience_class,
    raw_text: event.raw_text ?? "",
    created_at: event.created_at ?? new Date().toISOString(),
    updated_at: event.created_at,
    authority_weight,
    credibility_proxy,
    topic_classification: event.topic_classification ?? (event.narrative_topic_ids?.[0] ?? ""),
    decay_score: event.decay_score ?? decay,
    is_persistent: true,
    raw_payload: undefined,
    source_type: sourceType,
    published_at: event.published_at,
    ingested_at: event.ingested_at,
  }
}

function inferSourceType(source: string, platform?: string): string {
  const s = String(source ?? "").toLowerCase()
  const p = String(platform ?? "").toLowerCase()
  if (s.includes("analyst") || p.includes("earnings") || p.includes("transcript")) return "Analyst"
  if (s.includes("news") || s.includes("reuters") || s.includes("bloomberg")) return "Media"
  return "Retail"
}

/** Map canonical/API events to IPI scoring input */
export function toIPIInput(events: (NarrativeEvent | NarrativeEventCanonical)[] | null | undefined): NarrativeEventInput[] {
  const list = Array.isArray(events) ? events : []
  return list.map((e) => {
    const auth = "authority_weight" in e ? e.authority_weight : (e as NarrativeEvent).authority_score
    const cred = "credibility_proxy" in e ? e.credibility_proxy : (e as NarrativeEvent).credibility_proxy
    const decay = "decay_score" in e ? (e as NarrativeEventCanonical).decay_score : (e as NarrativeEvent).decay_score
    const raw = "raw_text" in e ? e.raw_text : ""
    return {
      authority_weight: Number(auth) || 0,
      credibility_proxy: Number(cred) ?? 0.5,
      decay_score: Number(decay) ?? 1,
      raw_text: raw,
    }
  })
}
