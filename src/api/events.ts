/**
 * Events API — GET /api/events (list), GET /api/events/:event_id (single).
 * Canonical NarrativeEvent model; all responses use null-safe shapes.
 */

import { api } from "@/lib/api"
import type { NarrativeEvent, NarrativeEventSpec } from "@/types/narrative"

export interface EventsListParams {
  company_id: string
  companyId?: string
  start?: string
  end?: string
  limit?: number
  source_id?: string
  source?: string
  platform?: string
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
 * GET /api/events?company_id=&start=&end=&limit=
 */
export async function getEvents(params: EventsListParams): Promise<EventsListResponse> {
  try {
    const q = new URLSearchParams()
    q.set("company_id", params.company_id)
    if (params.start) q.set("start", params.start)
    if (params.end) q.set("end", params.end)
    if (params.limit != null) q.set("limit", String(params.limit))
    if (params.source_id) q.set("source_id", params.source_id)
    if (params.platform) q.set("platform", params.platform)
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
