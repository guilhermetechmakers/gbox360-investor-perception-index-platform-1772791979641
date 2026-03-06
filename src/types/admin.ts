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

export interface AdminUser {
  id: string
  email: string
  name: string
  roles: string[]
  tenantId: string
  status: UserStatus
  lastLogin?: string
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
}

export interface AuditLogExportResponse {
  url?: string
  error?: string
}

export interface InviteUserInput {
  email: string
  name?: string
  role: string
  tenantId: string
}
