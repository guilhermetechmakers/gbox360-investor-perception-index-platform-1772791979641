/**
 * Narratives API: ingestion, decay-weighted fetch, drill-down events, resolve.
 * All responses use null-safe shapes; arrays default to [].
 */

import { api } from "@/lib/api"
import type {
  NarrativeWithDecay,
  NarrativeEventSummary,
  IngestEventPayload,
  NarrativeApiItem,
} from "@/types/narrative"

export interface IngestEventResponse {
  success: boolean
  eventId?: string
  narrativeId?: string
  topicId?: string
  error?: string
}

export interface FetchNarrativesResponse {
  narratives: NarrativeApiItem[]
  totalWeight?: number
}

const safeList = <T>(x: T[] | { data?: T[] } | null | undefined): T[] =>
  Array.isArray(x) ? x : Array.isArray((x as { data?: T[] })?.data) ? (x as { data: T[] }).data : []

/**
 * POST /api/ingestEvent – Ingest event, run classification, persist NarrativeEvent + IngestionPayload.
 */
export async function ingestEvent(payload: IngestEventPayload): Promise<IngestEventResponse> {
  const res = await api.post<IngestEventResponse>("/ingestEvent", {
    companyId: payload.companyId,
    source: payload.source ?? "",
    platform: payload.platform,
    speakerEntity: payload.speakerEntity,
    speakerRole: payload.speakerRole,
    audienceClass: payload.audienceClass,
    text: String(payload.text ?? "").trim(),
    timestamp: payload.timestamp ?? new Date().toISOString(),
    metadata: payload.metadata ?? {},
  })
  return res ?? { success: false, error: "No response" }
}

/**
 * GET /api/narratives?companyId=&start=&end= – Narratives with decay-weighted scores and top events.
 */
export async function fetchNarratives(
  companyId: string,
  start: string,
  end: string
): Promise<NarrativeWithDecay[]> {
  try {
    const params = new URLSearchParams({ companyId, start, end })
    const data = await api.get<NarrativeApiItem[] | { narratives?: NarrativeApiItem[] }>(
      `/narratives?${params.toString()}`
    )
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { narratives?: NarrativeApiItem[] })?.narratives)
        ? (data as { narratives: NarrativeApiItem[] }).narratives
        : []
    return (list ?? []).map((n) => ({
      id: n.id,
      name: n.name ?? "Unnamed",
      weight: Number(n.weight) ?? 0,
      decay_lambda: Number(n.decay_lambda) ?? 0.01,
      lastUpdated: n.lastUpdated ?? n.updated_at ?? new Date().toISOString(),
      topEvents: Array.isArray(n.topEvents) ? n.topEvents : [],
      is_embedding_cluster: n.is_embedding_cluster,
      event_count: n.event_count ?? 0,
    }))
  } catch {
    return []
  }
}

/**
 * GET /api/narratives/:id/events?start=&end= – Events for a narrative (drill-down).
 */
export async function getNarrativeEvents(
  narrativeId: string,
  start?: string,
  end?: string
): Promise<NarrativeEventSummary[]> {
  try {
    const params = new URLSearchParams()
    if (start) params.set("start", start)
    if (end) params.set("end", end)
    const q = params.toString()
    const url = `/narratives/${encodeURIComponent(narrativeId)}/events${q ? `?${q}` : ""}`
    const data = await api.get<NarrativeEventSummary[] | { data?: NarrativeEventSummary[] }>(url)
    return safeList(data)
  } catch {
    return []
  }
}

/**
 * POST /api/narratives/:id/resolve – Manual adjustment/tagging (admin).
 */
export async function resolveNarrative(
  narrativeId: string,
  body: { tag?: string; mergeIntoId?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<{ success?: boolean; error?: string }>(
      `/narratives/${encodeURIComponent(narrativeId)}/resolve`,
      body ?? {}
    )
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Request failed",
    }
  }
}

/** Named export for api index */
export const narrativesApi = {
  ingestEvent,
  fetchNarratives,
  getNarrativeEvents,
  resolveNarrative,
}
