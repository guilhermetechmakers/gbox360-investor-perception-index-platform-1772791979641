/**
 * Events API — GET /api/events (list), GET /api/events/:event_id (single).
 * Canonical NarrativeEvent model; all responses use null-safe shapes.
 */

import { api } from "@/lib/api"
import type { NarrativeEvent, NarrativeEventSpec } from "@/types/narrative"

export interface EventsListParams {
  company_id?: string
  companyId?: string
  start?: string
  end?: string
  since?: string
  until?: string
  limit?: number
  source_id?: string
  source?: string
  platform?: string
  ticker?: string
  page?: number
}

export interface EventsListResponse {
  data: NarrativeEvent[]
  count: number
}

function safeEventsList(raw: unknown): NarrativeEvent[] {
  if (Array.isArray(raw)) return raw as NarrativeEvent[]
  const obj = raw as { data?: unknown[] }
  const arr = obj?.data ?? []
  return Array.isArray(arr) ? (arr as NarrativeEvent[]) : []
}

/**
 * GET /api/events?company_id=&start=&end=&source=&since=&until=&ticker=&limit=
 */
export async function getEvents(params: EventsListParams): Promise<EventsListResponse> {
  try {
    const q = new URLSearchParams()
    const companyId = params.company_id ?? params.companyId
    if (companyId) q.set("company_id", companyId)
    if (params.start) q.set("start", params.start)
    if (params.end) q.set("end", params.end)
    if (params.since) q.set("since", params.since)
    if (params.until) q.set("until", params.until)
    if (params.limit != null) q.set("limit", String(params.limit))
    if (params.source_id) q.set("source_id", params.source_id)
    if (params.source) q.set("source", params.source)
    if (params.platform) q.set("platform", params.platform)
    if (params.ticker) q.set("ticker", params.ticker)
    if (params.page != null) q.set("page", String(params.page))
    const res = await api.get<EventsListResponse | { data?: NarrativeEvent[]; count?: number }>(
      `/events?${q.toString()}`
    )
    const data = safeEventsList((res as { data?: unknown })?.data ?? res)
    const count = (res as { count?: number })?.count ?? data.length
    return { data, count }
  } catch {
    return { data: [], count: 0 }
  }
}

/**
 * GET /api/events/:event_id
 */
export async function getEventById(eventId: string): Promise<NarrativeEvent | NarrativeEventSpec | null> {
  try {
    const res = await api.get<NarrativeEvent | NarrativeEventSpec | { data?: NarrativeEvent | NarrativeEventSpec }>(
      `/events/${encodeURIComponent(eventId)}`
    )
    const item = (res as { data?: NarrativeEvent })?.data ?? res
    if (item && typeof item === "object" && "event_id" in item) return item as NarrativeEvent
    return null
  } catch {
    return null
  }
}

export const eventsApi = {
  getEvents,
  getEventById,
}
