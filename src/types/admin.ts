/**
 * Admin dashboard data models — aligned to API spec.
 * All list fields should be consumed with data ?? [] or safeArray().
 */

export type BillingStatus = "PAID" | "DUE" | "OVERDUE"
export type TenantStatus = "ACTIVE" | "SUSPENDED"
export type UserStatus = "ACTIVE" | "DEACTIVATED"
export type ReplayStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

export interface TenantUsage {
  transactions: number
  storageGB: number
}

export interface Tenant {
  id: string
  name: string
  usage: TenantUsage
  billingStatus: BillingStatus
  status: TenantStatus
}

export interface AdminUserTenant {
  tenantId: string
  tenantName?: string
  roleIds: string[]
}

export interface AdminUser {
  id: string
  email: string
  name?: string
  roles: string[]
  tenantId?: string
  tenants?: AdminUserTenant[]
  status: UserStatus
  lastLogin?: string
  created_at?: string
  updated_at?: string
}

export interface AdminRole {
  id: string
  name: string
  permissions?: string[]
}

export interface UserTenantRole {
  id: string
  user_id: string
  tenant_id: string
  role_id: string
  assigned_at: string
}

export interface TenantRoleAssignment {
  tenantId: string
  roleId: string
}

export interface Invitation {
  id: string
  email: string
  tenant_id: string
  role_ids: string[]
  invited_by: string
  expires_at: string
  status: "pending" | "accepted" | "expired"
  created_at: string
}

/** Event type taxonomy for audit logs */
export type AuditLogEventType = "INGESTION" | "EXPORT" | "WEIGHT_SIM" | "REPLAY"

/** Retention status for exported/archived data */
export type RetentionStatus = "RETAINED" | "EVICTED"

/** Full audit log entry — immutable, read-only */
export interface AuditLogEntry {
  id: string
  timestamp: string
  event_type: AuditLogEventType
  actor_id: string
  actor_email: string
  tenant_id: string
  tenant_name: string
  event_id: string
  payload_id: string
  description: string
  retention_status: RetentionStatus
  payload_reference_uri: string
  raw_payload_present: boolean
  /** Alias for raw_payload_present */
  payload_present?: boolean
  /** Optional hash for integrity checks */
  payload_hash?: string
}

/** Legacy shape for backward compatibility with API responses */
export interface AuditLog {
  id: string
  eventType: string
  source?: string
  actor?: string
  timestamp: string
  payloadRef?: string
  tenantId?: string
  /** Mapped from event_type */
  event_type?: AuditLogEventType
  actor_email?: string
  tenant_name?: string
  event_id?: string
  payload_id?: string
  description?: string
  retention_status?: string
  payload_reference_uri?: string
  raw_payload_present?: boolean
  /** Hash of payload for integrity checks. Optional. */
  payloadHash?: string
  /** Short preview of payload (e.g. first 200 chars). Optional. */
  payloadPreview?: string
}

export interface IngestionEvent {
  id: string
  type: string
  timestamp: string
  status: string
  message?: string
  payloadRef?: string
  tenantId?: string
}

export interface Payload {
  id: string
  payloadRef: string
  data: string | null
  createdAt: string
}

export interface Replay {
  id: string
  targetEventId: string
  status: ReplayStatus
  createdAt: string
  updatedAt: string
}

export type WorkerStatus = "HEALTHY" | "DEGRADED" | "DOWN"
export type AlertSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

export interface SystemHealth {
  ingestionQueueLength: number
  workerStatus: WorkerStatus
  lastSuccessfulJobAt: string | null
  /** Ingestion uptime percentage (0–100). Optional from API. */
  uptime?: number
  /** Error rate (e.g. errors per 1k events). Optional from API. */
  errorRate?: number
  /** P95 latency in ms. Optional from API. */
  latencyMs?: number
  /** Status label for ingestion pipeline. Optional. */
  ingestionStatus?: "healthy" | "degraded" | "down"
}

export interface DashboardHealth {
  health: SystemHealth
  tenants: Tenant[]
  alerts: AdminAlert[]
}

export interface AdminAlert {
  id: string
  severity: AlertSeverity
  message: string
  timestamp: string
  source?: string
}


export interface AuditLogsParams {
  tenantId?: string
  eventType?: string
  eventTypes?: AuditLogEventType[]
  actor?: string
  search?: string
  start?: string
  end?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  retentionStatus?: string
}

export interface AuditLogsResponse {
  data?: AuditLog[]
  items?: AuditLog[]
  count: number
  page: number
  pageSize: number
}

export interface AuditLogExportParams {
  startDate?: string
  endDate?: string
  eventTypes?: AuditLogEventType[]
  tenantId?: string
  actor?: string
  search?: string
  /** Export format: CSV or JSON */
  format?: "csv" | "json"
}

export interface AuditLogExportResponse {
  url?: string
  error?: string
}

export interface InviteUserInput {
  email: string
  name?: string
  role?: string
  tenantId?: string
  tenantRoles?: TenantRoleAssignment[]
  ssoEnabled?: boolean
  expiresAt?: string
  message?: string
}

export interface AdminUsersParams {
  tenantId?: string
  roleId?: string
  status?: UserStatus | ""
  q?: string
  page?: number
  pageSize?: number
}

export interface AdminUsersResponse {
  items?: AdminUser[]
  data?: AdminUser[]
  count: number
  page: number
  pageSize: number
}

/** Audit event for user management actions */
export interface UserAuditEvent {
  id: string
  actor_id: string
  actor_email?: string
  action: string
  target_type: "user" | "invitation"
  target_id: string
  timestamp: string
  payload?: Record<string, unknown>
}

/** Data Replay — ReplayJob status */
export type ReplayJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused"

/** Data Replay — Replay mode */
export type ReplayMode = "dry-run" | "execute"

/** Data Replay — Resource estimates */
export interface ResourceEstimate {
  cpuCores?: number
  memoryMB?: number
  networkIoMB?: number
}

/** Dry-run batch for preflight */
export interface DryRunBatch {
  batchIndex: number
  eventCount: number
  estimatedDurationMs?: number
}

/** Data Replay — ReplayJob */
export interface ReplayJob {
  id: string
  tenantId: string
  tenantName?: string
  windowStart: string
  windowEnd: string
  mode: ReplayMode
  status: ReplayJobStatus
  startedAt: string
  endedAt?: string
  estimatedResources?: ResourceEstimate
  actualResources?: ResourceEstimate
  summary?: string
  createdBy?: string
  progressPercent?: number
  currentBatch?: number
  etaSeconds?: number
}

/** Data Replay — Ingestion health per tenant */
export interface ReplayHealth {
  tenantId?: string
  status: "healthy" | "degraded" | "down"
  backlogSize: number
  streamingLagSeconds?: number
  streamingLagMs?: number
  retryCount?: number
  retryCountPerTenant?: number
  idempotencyEnabled: boolean
  retryPolicy?: string
}

/** Data Replay — Preflight result */
export interface PreflightResult {
  valid: boolean
  estimatedEventCount?: number
  estimatedEvents?: number
  estimatedResources?: ResourceEstimate
  resourceEstimate?: ResourceEstimate
  batchEstimates?: { batchIndex: number; eventCount: number }[]
  dryRunBatches?: { batchIndex: number; eventCount: number; estimatedDurationMs: number }[]
  idempotencyStatus?: string
  backlogHealth?: string
  retryPolicy?: string
}

/** Data Replay — Dry-run result */
export interface DryRunResult {
  jobId: string
  estimatedEventCount: number
  estimatedResources: ResourceEstimate
  batchEstimates?: { batchIndex: number; eventCount: number }[]
  summary?: string
}

/** Replay run request */
export interface ReplayRunParams {
  tenantId: string
  windowStart: string
  windowEnd: string
  mode: ReplayMode
}

/** Replay run response */
export interface ReplayRunResponse {
  jobId: string
  status: ReplayJobStatus
  message?: string
}

/** Job progress */
export interface ReplayJobProgress {
  jobId: string
  status: ReplayJobStatus
  progressPercent: number
  currentBatch?: number
  etaSeconds?: number
  eventsProcessed?: number
  totalEvents?: number
}

/** Audit log preview for replay context */
export interface AuditLogPreview {
  id: string
  timestamp: string
  actionType: string
  description: string
  payloadRef?: string
}
