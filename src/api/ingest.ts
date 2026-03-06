/**
 * Ingestion API — POST /api/ingest/news, /ingest/social, /ingest/transcripts.
 * Idempotent; returns event_id and payload reference.
 */

import { api } from "@/lib/api"

export interface IngestPayloadBase {
  company_id: string
  source_id?: string
  platform: string
  speaker_entity?: string
  speaker_role_inferred?: string
  audience_class?: string
  raw_text: string
  published_at: string
  payload_id?: string
}

export interface IngestResponse {
  event_id: string
  source_payload_id?: string
  ingested_at: string
  error?: string
}

function safeIngestResponse(res: unknown): IngestResponse | null {
  if (res && typeof res === "object" && "event_id" in res) return res as IngestResponse
  const r = res as { data?: IngestResponse }
  return r?.data ?? null
}

export async function ingestNews(payload: IngestPayloadBase): Promise<IngestResponse> {
  try {
    const res = await api.post<IngestResponse | { data?: IngestResponse }>("/ingest/news", payload)
    const out = safeIngestResponse(res)
    if (out) return out
  } catch (e) {
    return {
      event_id: "",
      ingested_at: new Date().toISOString(),
      error: e instanceof Error ? e.message : "Ingest failed",
    }
  }
  return { event_id: "", ingested_at: new Date().toISOString(), error: "No response" }
}

export async function ingestSocial(payload: IngestPayloadBase): Promise<IngestResponse> {
  try {
    const res = await api.post<IngestResponse | { data?: IngestResponse }>("/ingest/social", payload)
    const out = safeIngestResponse(res)
    if (out) return out
  } catch (e) {
    return {
      event_id: "",
      ingested_at: new Date().toISOString(),
      error: e instanceof Error ? e.message : "Ingest failed",
    }
  }
  return { event_id: "", ingested_at: new Date().toISOString(), error: "No response" }
}

export async function ingestTranscripts(payload: IngestPayloadBase): Promise<IngestResponse> {
  try {
    const res = await api.post<IngestResponse | { data?: IngestResponse }>("/ingest/transcripts", payload)
    const out = safeIngestResponse(res)
    if (out) return out
  } catch (e) {
    return {
      event_id: "",
      ingested_at: new Date().toISOString(),
      error: e instanceof Error ? e.message : "Ingest failed",
    }
  }
  return { event_id: "", ingested_at: new Date().toISOString(), error: "No response" }
}

export const ingestApi = {
  ingestNews,
  ingestSocial,
  ingestTranscripts,
}
