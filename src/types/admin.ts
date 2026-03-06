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

export interface AuditLog {
  id: string
  eventType: string
  source: string
  actor: string
  timestamp: string
  payloadRef?: string
  tenantId?: string
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
  start?: string
  end?: string
  page?: number
  pageSize?: number
}

export interface AuditLogsResponse {
  items: AuditLog[]
  data?: AuditLog[]
  count: number
  page: number
  pageSize: number
}

export interface InviteUserInput {
  email: string
  name?: string
  role: string
  tenantId: string
}
