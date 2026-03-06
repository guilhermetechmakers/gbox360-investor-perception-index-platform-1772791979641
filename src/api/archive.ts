/**
 * Archive & Replay API — raw payload archival, presigned URLs, replay by event.
 * All responses consumed with data ?? [] and Array.isArray().
 */

import { api } from "@/lib/api"
import type {
  ArchiveAuditParams,
  ArchiveAuditResponse,
  DrilldownResponse,
  PresignedUrlResponse,
  ReplayRequest,
  ReplayResponse,
  ReplayJobEvent,
  ArchiveIndexEntry,
} from "@/types/archive"

const safeArray = <T>(data: T[] | null | undefined): T[] =>
  Array.isArray(data) ? data : []

/** Archive a raw payload (creates NarrativeEvent + ArchiveIndex + S3 object) */
export async function archivePayload(body: {
  tenantId: string
  companyId: string
  eventId: string
  source: string
  platform: string
  speakerEntity: string
  speakerRole: string
  audienceClass: string
  rawText: string
  provenance?: Record<string, unknown>
}): Promise<{ eventId: string; s3Key: string; archiveTimestamp: string; checksum: string }> {
  const res = await api.post<{ eventId: string; s3Key: string; archiveTimestamp: string; checksum: string }>(
    "/archive-payload",
    body
  )
  return res ?? { eventId: body.eventId, s3Key: "", archiveTimestamp: new Date().toISOString(), checksum: "" }
}

/** Get presigned URL for read-only access to raw payload */
export async function getPresignedUrl(params: {
  s3Key: string
  role?: string
  expiresSeconds?: number
}): Promise<PresignedUrlResponse> {
  const q = new URLSearchParams()
  q.set("s3Key", params.s3Key)
  if (params.role) q.set("role", params.role)
  if (params.expiresSeconds != null) q.set("expiresSeconds", String(params.expiresSeconds))
  const res = await api.get<PresignedUrlResponse>(`/presigned-url?${q.toString()}`)
  if (res?.url) return res
  return {
    url: `#mock-presigned-${params.s3Key}`,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    expiresInSeconds: 3600,
  }
}

/** Replay single event: dry-run or execute */
export async function replayEvent(body: ReplayRequest): Promise<ReplayResponse> {
  const res = await api.post<ReplayResponse>("/replay", body)
  if (res?.jobId != null) return res
  return {
    jobId: `job-${Date.now()}`,
    status: body.mode === "DRY_RUN" ? "COMPLETED" : "PENDING",
    message: body.mode === "DRY_RUN" ? "Dry-run completed (mock)" : "Job enqueued (mock)",
    predictedEffects: body.mode === "DRY_RUN" ? "Would reprocess 1 event; no side effects." : undefined,
  }
}

/** Get replay job status */
export async function getReplayJobStatus(jobId: string): Promise<ReplayJobEvent | null> {
  const res = await api.get<ReplayJobEvent>(`/replay/jobs/${jobId}`)
  return res ?? null
}

/** List archive audit entries (archival index with filters) */
export async function getArchiveAuditLogs(params: ArchiveAuditParams = {}): Promise<ArchiveAuditResponse> {
  const q = new URLSearchParams()
  if (params.tenantId) q.set("tenantId", params.tenantId)
  if (params.source) q.set("source", params.source)
  if (params.eventId) q.set("eventId", params.eventId)
  if (params.start) q.set("start", params.start)
  if (params.end) q.set("end", params.end)
  if (params.page != null) q.set("page", String(params.page))
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize))
  const query = q.toString()
  try {
    const res = await api.get<ArchiveAuditResponse & { data?: ArchiveIndexEntry[]; items?: ArchiveIndexEntry[] }>(
      `/audit-logs/archive${query ? `?${query}` : ""}`
    )
    const rawItems = safeArray(res?.items ?? res?.data)
    return {
      data: rawItems,
      items: rawItems,
      count: res?.count ?? rawItems.length,
      page: res?.page ?? params.page ?? 1,
      pageSize: res?.pageSize ?? params.pageSize ?? 25,
    }
  } catch {
    return {
      data: [],
      items: [],
      count: 0,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 25,
    }
  }
}

/** Drilldown: NarrativeEvent by id with archive index and raw payload snippet */
export async function getDrilldown(eventId: string): Promise<DrilldownResponse | null> {
  try {
    const res = await api.get<DrilldownResponse>(`/drilldown/${encodeURIComponent(eventId)}`)
    if (res?.event) return res
  } catch {
    /* fallback mock */
  }
  return {
    event: {
      id: eventId,
      source: "—",
      platform: "—",
      speaker_entity: "—",
      speaker_role_heuristic: "—",
      audience_class: "—",
      raw_text: "",
      created_at: new Date().toISOString(),
      provenance: null,
      checksum: "",
      archived_at: null,
      provenance_chain: null,
    },
    archiveIndex: null,
    rawPayloadSnippet: null,
  }
}
