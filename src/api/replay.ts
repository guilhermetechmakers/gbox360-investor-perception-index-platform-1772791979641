/**
 * Replay API — POST /api/replay/payload, POST /api/replay/window.
 * Idempotent replay with audit trail.
 */

import { api } from "@/lib/api"

export interface ReplayPayloadInput {
  payload_id: string
}

export interface ReplayWindowInput {
  company_id: string
  start_time: string
  end_time: string
}

export interface ReplayResponse {
  job_id: string
  status: string
  events_processed?: number
  message?: string
}

function safeReplayResponse(res: unknown): ReplayResponse | null {
  if (res && typeof res === "object" && "job_id" in res) return res as ReplayResponse
  const r = res as { data?: ReplayResponse }
  return r?.data ?? null
}

export async function replayPayload(input: ReplayPayloadInput): Promise<ReplayResponse> {
  try {
    const res = await api.post<ReplayResponse | { data?: ReplayResponse }>("/replay/payload", input)
    const out = safeReplayResponse(res)
    if (out) return out
  } catch (e) {
    return {
      job_id: "",
      status: "failed",
      message: e instanceof Error ? e.message : "Replay failed",
    }
  }
  return { job_id: "", status: "failed", message: "No response" }
}

export async function replayWindow(input: ReplayWindowInput): Promise<ReplayResponse> {
  try {
    const res = await api.post<ReplayResponse | { data?: ReplayResponse }>("/replay/window", input)
    const out = safeReplayResponse(res)
    if (out) return out
  } catch (e) {
    return {
      job_id: "",
      status: "failed",
      message: e instanceof Error ? e.message : "Replay failed",
    }
  }
  return { job_id: "", status: "failed", message: "No response" }
}

export const replayApi = {
  replayPayload,
  replayWindow,
}
