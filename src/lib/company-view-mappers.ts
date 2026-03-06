/**
 * Map API narrative/event shapes to Company View spec-aligned types.
 * Guards all arrays and optional fields.
 */

import type { NarrativeEventView, NarrativeSummaryView, SpeakerView } from "@/types/company-view"
import type { NarrativeEvent, NarrativeSummary } from "@/types/narrative"
import type { NarrativeWithDecay, NarrativeTopicWithDecay } from "@/types/narrative"

export function mapToNarrativeEventView(ev: NarrativeEvent | Record<string, unknown>): NarrativeEventView {
  const e = ev as Record<string, unknown>
  const eventId = String(e?.event_id ?? e?.id ?? "")
  const rawText = String(e?.raw_text ?? e?.text ?? "")
  const publishedAt = String(
    e?.published_at ?? e?.ingested_at ?? e?.created_at ?? new Date().toISOString()
  )
  const speakerRaw = e?.speaker
  let speaker: SpeakerView = "—"
  if (typeof speakerRaw === "string") {
    speaker = speakerRaw
  } else if (speakerRaw && typeof speakerRaw === "object") {
    const s = speakerRaw as Record<string, unknown>
    speaker = {
      name: String(s?.entity ?? s?.name ?? ""),
      role: String(s?.inferred_role ?? s?.role ?? ""),
    }
  }
  const authorityWeight = Number(e?.authority_weight ?? e?.authority_score ?? 0)
  const credibilityProxy = Number(e?.credibility_proxy ?? 0)
  const rationale = e?.classification_rationale as
    | { rule_based?: { topic_name?: string; confidence?: number }; embedding_proximity?: { similarity?: number } }
    | undefined
  const whyIncluded =
    rationale?.rule_based?.topic_name != null
      ? `Matched topic: ${rationale.rule_based.topic_name} (confidence ${((rationale.rule_based.confidence ?? 0) * 100).toFixed(0)}%).`
      : rationale?.embedding_proximity?.similarity != null
        ? `Embedding similarity: ${(rationale.embedding_proximity.similarity * 100).toFixed(0)}%.`
        : "Included based on narrative relevance and authority/credibility weighting."

  return {
    id: eventId,
    companyId: String(e?.company_id ?? ""),
    source: String(e?.source ?? e?.source_platform ?? "—"),
    platform: e?.platform as string | undefined,
    speaker,
    audienceClass: e?.audience_class as string | undefined,
    text: rawText || undefined,
    timestamp: publishedAt,
    amplitude: authorityWeight || credibilityProxy ? (authorityWeight + credibilityProxy) / 2 : undefined,
    rawPayload: e?.raw_payload,
    whyIncluded,
  }
}

export function mapToNarrativeSummaryView(
  n: NarrativeSummary | NarrativeWithDecay | NarrativeTopicWithDecay | Record<string, unknown>
): NarrativeSummaryView {
  const x = n as Record<string, unknown>
  const id = String(x?.id ?? x?.topic_id ?? "")
  const title = String(x?.name ?? x?.summary ?? "Untitled narrative").slice(0, 120)
  const summary = String(x?.summary ?? x?.name ?? "")
  const authorityScore =
    typeof x?.authority_weight === "number"
      ? x.authority_weight
      : typeof x?.authority_score === "number"
        ? x.authority_score
        : undefined
  const credibilityProxy =
    typeof x?.credibility_proxy === "number" ? x.credibility_proxy : undefined

  return {
    id,
    title: title || "Untitled",
    summary: summary || "No summary.",
    authorityScore,
    credibilityProxy,
  }
}

export function mapEventsToViewList(
  events: NarrativeEvent[] | Record<string, unknown>[] | null | undefined
): NarrativeEventView[] {
  const list = Array.isArray(events) ? events : []
  return list.map((ev) => mapToNarrativeEventView(ev as NarrativeEvent))
}

export function mapNarrativesToViewList(
  narratives: (NarrativeSummary | NarrativeWithDecay | NarrativeTopicWithDecay)[] | null | undefined
): NarrativeSummaryView[] {
  const list = Array.isArray(narratives) ? narratives : []
  return list.map((n) => mapToNarrativeSummaryView(n))
}
