/**
 * Raw Payload Archival & Replay — data models.
 * Use data ?? [] and Array.isArray() when consuming API responses.
 */

/** Immutable canonical narrative event (archival model) */
export interface NarrativeEventArchival {
  id: string
  source: string
  platform: string
  speaker_entity: string
  speaker_role_heuristic: string
  audience_class: string
  raw_text: string
  created_at: string
  provenance: Record<string, unknown> | null
  checksum: string
  archived_at: string | null
  provenance_chain: Record<string, unknown>[] | null
  tenant_id?: string
  company_id?: string
}

/** Archive index row: event_id -> s3_key with metadata */
export interface ArchiveIndexEntry {
  event_id: string
  s3_key: string
  archive_timestamp: string
  checksum: string
  tenant_id: string
  source: string
  provenance: Record<string, unknown> | null
}

/** Replay job (single event or batch) */
export type ReplayJobMode = "DRY_RUN" | "EXECUTE"
export type ReplayJobStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

export interface ReplayJobEvent {
  id: string
  event_id: string
  mode: ReplayJobMode
  status: ReplayJobStatus
  enqueued_at: string
  progressed_at: string | null
  result_summary: string | null
}

/** Audit log / archive list params */
export interface ArchiveAuditParams {
  tenantId?: string
  source?: string
  eventId?: string
  start?: string
  end?: string
  page?: number
  pageSize?: number
}

/** Archive audit list response */
export interface ArchiveAuditResponse {
  data?: ArchiveIndexEntry[]
  items?: ArchiveIndexEntry[]
  count: number
  page: number
  pageSize: number
}

/** Drilldown response: NarrativeEvent + archive index + snippet */
export interface DrilldownResponse {
  event: NarrativeEventArchival
  archiveIndex: ArchiveIndexEntry | null
  rawPayloadSnippet: string | null
}

/** Presigned URL response */
export interface PresignedUrlResponse {
  url: string
  expiresAt: string
  expiresInSeconds: number
}

/** Replay request body */
export interface ReplayRequest {
  eventId: string
  mode: ReplayJobMode
}

/** Replay response */
export interface ReplayResponse {
  jobId: string
  status: ReplayJobStatus
  message?: string
  predictedEffects?: string
  potentialSideEffects?: string
}
