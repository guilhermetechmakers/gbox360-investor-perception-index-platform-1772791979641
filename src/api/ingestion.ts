/**
 * Ingestion API — status, social read, earnings batch, news trigger, DLQ, replay.
 * All responses use null-safe shapes; arrays default to [].
 */

import { api } from "@/lib/api"
import type {
  IngestionStatusResponse,
  SocialTwitterReadParams,
  SocialTwitterReadResponse,
  SocialTwitterItem,
  EarningsTranscriptsPayload,
  EarningsTranscriptsResponse,
  NewsIngestionParams,
  NewsIngestionResponse,
  DlqListResponse,
  DlqEntry,
  ReplayEventsParams,
  ReplayEventsResponse,
} from "@/types/ingestion"

const safeArray = <T>(data: T[] | null | undefined): T[] =>
  Array.isArray(data) ? data : []

const defaultIngestionStatus: IngestionStatusResponse = {
  sources: [
    { source: "news", status: "healthy", lastIngestedAt: null, lastRunAt: null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
    { source: "social", status: "healthy", lastIngestedAt: null, lastRunAt: null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
    { source: "earnings_transcripts", status: "healthy", lastIngestedAt: null, lastRunAt: null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
  ],
  overallStatus: "healthy",
  lastUpdated: new Date().toISOString(),
}

export async function getIngestionStatus(): Promise<IngestionStatusResponse> {
  try {
    const res = await api.get<IngestionStatusResponse | { sources?: unknown[] }>(
      "/ingestion/status"
    )
    const r = res as IngestionStatusResponse & { sources?: unknown[] }
    if (r?.sources && Array.isArray(r.sources)) {
      return {
        sources: r.sources,
        overallStatus: r.overallStatus ?? "healthy",
        lastUpdated: r.lastUpdated ?? new Date().toISOString(),
      }
    }
  } catch {
    /* fall through to default */
  }
  return defaultIngestionStatus
}

export async function getSocialTwitterRead(
  params: SocialTwitterReadParams
): Promise<SocialTwitterReadResponse> {
  try {
    const q = new URLSearchParams()
    q.set("companyTicker", params.companyTicker)
    if (params.since) q.set("since", params.since)
    if (params.limit != null) q.set("limit", String(Math.min(100, Math.max(1, params.limit))))
    const res = await api.get<SocialTwitterReadResponse | { data?: unknown[]; items?: unknown[] }>(
      `/social/twitter/read?${q.toString()}`
    )
    const r = res as SocialTwitterReadResponse & { data?: unknown[]; items?: unknown[] }
    const items = safeArray(r?.items ?? r?.data) as SocialTwitterItem[]
    return { items }
  } catch {
    return { items: [] }
  }
}

export async function postEarningsTranscripts(
  payload: EarningsTranscriptsPayload
): Promise<EarningsTranscriptsResponse> {
  try {
    const res = await api.post<EarningsTranscriptsResponse>(
      "/ingest/earnings-transcripts",
      payload
    )
    if (res && typeof res.batchStatus === "string") {
      return {
        batchStatus: res.batchStatus,
        processedCount: res.processedCount ?? 0,
        failedCount: res.failedCount ?? 0,
        dlqCount: res.dlqCount ?? 0,
      }
    }
  } catch (e) {
    return {
      batchStatus: "error",
      processedCount: 0,
      failedCount: (payload?.transcripts ?? []).length,
      dlqCount: 0,
    }
  }
  return {
    batchStatus: "error",
    processedCount: 0,
    failedCount: (payload?.transcripts ?? []).length,
    dlqCount: 0,
  }
}

export async function triggerNewsIngestion(
  params?: NewsIngestionParams
): Promise<NewsIngestionResponse> {
  try {
    const q = new URLSearchParams()
    if (params?.source) q.set("source", params.source)
    if (params?.since) q.set("since", params.since)
    if (params?.limit != null) q.set("limit", String(params.limit))
    const query = q.toString()
    const res = await api.get<NewsIngestionResponse>(
      `/ingest/news${query ? `?${query}` : ""}`
    )
    if (res && typeof res.status === "string") {
      return {
        status: res.status,
        ingestedCount: res.ingestedCount ?? 0,
        items: Array.isArray(res.items) ? res.items : undefined,
      }
    }
  } catch {
    /* fall through */
  }
  return { status: "error", ingestedCount: 0 }
}

export async function getDlq(source: string): Promise<DlqListResponse> {
  try {
    const res = await api.get<DlqListResponse | { data?: unknown[]; items?: unknown[] }>(
      `/dlq/${encodeURIComponent(source)}`
    )
    const r = res as DlqListResponse & { data?: unknown[]; items?: unknown[] }
    const items = safeArray(r?.items ?? r?.data) as DlqEntry[]
    return { items, count: r?.count ?? items.length }
  } catch {
    return { items: [], count: 0 }
  }
}

export async function retryDlqItem(
  source: string,
  key: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.post<{ success?: boolean; message?: string }>(
      `/dlq/${encodeURIComponent(source)}/retry/${encodeURIComponent(key)}`,
      {}
    )
    return {
      success: res?.success ?? false,
      message: res?.message,
    }
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Retry failed",
    }
  }
}

export async function postReplayEvents(
  params: ReplayEventsParams
): Promise<ReplayEventsResponse> {
  try {
    const q = new URLSearchParams()
    q.set("since", params.since)
    if (params.source) q.set("source", params.source)
    if (params.eventId) q.set("eventId", params.eventId)
    const res = await api.post<ReplayEventsResponse>(
      `/replay/events?${q.toString()}`,
      {}
    )
    if (res && (res.jobId ?? res.status)) {
      return {
        jobId: res.jobId ?? "",
        status: res.status ?? "queued",
        message: res.message,
        eventCount: res.eventCount,
      }
    }
  } catch (e) {
    return {
      jobId: "",
      status: "failed",
      message: e instanceof Error ? e.message : "Replay failed",
    }
  }
  return { jobId: "", status: "failed", message: "No response" }
}

export const ingestionApi = {
  getIngestionStatus,
  getSocialTwitterRead,
  postEarningsTranscripts,
  triggerNewsIngestion,
  getDlq,
  retryDlqItem,
  postReplayEvents,
}
