/**
 * Mock data for admin dashboard when API is unavailable.
 * Used for development and demo.
 */

import type {
  DashboardHealth,
  AuditLogsResponse,
  AuditLogEntry,
  AuditLog,
  AdminUser,
  Tenant,
  ReplayHealth,
  PreflightResult,
  ReplayJob,
  AuditLogPreview,
} from "@/types/admin"

function toAuditLog(e: AuditLogEntry): AuditLog {
  return {
    id: e.id,
    eventType: e.event_type,
    timestamp: e.timestamp,
    actor: e.actor_email,
    actor_email: e.actor_email,
    tenantId: e.tenant_id,
    tenant_name: e.tenant_name,
    event_id: e.event_id,
    payload_id: e.payload_id,
    payloadRef: e.payload_id || undefined,
    description: e.description,
    retention_status: e.retention_status,
    payload_reference_uri: e.payload_reference_uri,
    raw_payload_present: e.raw_payload_present,
  }
}

const MOCK_TENANTS: Tenant[] = [
  {
    id: "t1",
    name: "Acme Capital",
    usage: { transactions: 12500, storageGB: 42 },
    billingStatus: "PAID",
    status: "ACTIVE",
  },
  {
    id: "t2",
    name: "Beta Investments",
    usage: { transactions: 8200, storageGB: 28 },
    billingStatus: "DUE",
    status: "ACTIVE",
  },
  {
    id: "t3",
    name: "Gamma Research",
    usage: { transactions: 3400, storageGB: 12 },
    billingStatus: "PAID",
    status: "ACTIVE",
  },
]

export const mockDashboardHealth: DashboardHealth = {
  health: {
    ingestionQueueLength: 12,
    workerStatus: "HEALTHY",
    lastSuccessfulJobAt: new Date().toISOString(),
  },
  tenants: MOCK_TENANTS,
  alerts: [
    {
      id: "a1",
      severity: "WARNING",
      message: "Ingestion queue length above threshold",
      timestamp: new Date().toISOString(),
      source: "ingestion",
    },
    {
      id: "a2",
      severity: "INFO",
      message: "Scheduled maintenance in 24h",
      timestamp: new Date().toISOString(),
    },
  ],
}

const mockAuditEntries: AuditLogEntry[] = [
  {
    id: "log1",
    timestamp: new Date().toISOString(),
    event_type: "INGESTION",
    actor_id: "sys-1",
    actor_email: "system@gbox360.com",
    tenant_id: "t1",
    tenant_name: "Acme Capital",
    event_id: "evt-001",
    payload_id: "p-001",
    description: "News API ingestion completed",
    retention_status: "RETAINED",
    payload_reference_uri: "s3://bucket/evt-001.json",
    raw_payload_present: true,
  },
  {
    id: "log2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    event_type: "EXPORT",
    actor_id: "u1",
    actor_email: "user@acme.com",
    tenant_id: "t1",
    tenant_name: "Acme Capital",
    event_id: "evt-002",
    payload_id: "p-002",
    description: "CSV export requested",
    retention_status: "RETAINED",
    payload_reference_uri: "s3://bucket/evt-002.json",
    raw_payload_present: true,
  },
  {
    id: "log3",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    event_type: "WEIGHT_SIM",
    actor_id: "u3",
    actor_email: "user@beta.com",
    tenant_id: "t2",
    tenant_name: "Beta Investments",
    event_id: "evt-003",
    payload_id: "",
    description: "Weight sandbox simulation run",
    retention_status: "RETAINED",
    payload_reference_uri: "",
    raw_payload_present: false,
  },
  {
    id: "log4",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    event_type: "REPLAY",
    actor_id: "admin-1",
    actor_email: "admin@gbox360.com",
    tenant_id: "t1",
    tenant_name: "Acme Capital",
    event_id: "evt-004",
    payload_id: "p-004",
    description: "Data replay executed for tenant t1",
    retention_status: "RETAINED",
    payload_reference_uri: "s3://bucket/evt-004.json",
    raw_payload_present: true,
  },
]

const mockAuditLogItems = mockAuditEntries.map(toAuditLog)

export const mockAuditLogs: AuditLogsResponse = {
  data: mockAuditLogItems,
  items: mockAuditLogItems,
  count: mockAuditLogItems.length,
  page: 1,
  pageSize: 25,
}

/** Data Replay mock data */
export const mockReplayHealth: ReplayHealth = {
  tenantId: "t1",
  status: "healthy",
  backlogSize: 12,
  streamingLagSeconds: 0,
  retryCount: 0,
  idempotencyEnabled: true,
  retryPolicy: "exponential_backoff",
}

/** Data Replay — mock preflight result */
export const mockPreflightResult: PreflightResult = {
  valid: true,
  estimatedEventCount: 1247,
  estimatedResources: {
    cpuCores: 2,
    memoryMB: 512,
    networkIoMB: 48,
  },
  batchEstimates: [
    { batchIndex: 0, eventCount: 250 },
    { batchIndex: 1, eventCount: 250 },
    { batchIndex: 2, eventCount: 250 },
    { batchIndex: 3, eventCount: 247 },
  ],
  idempotencyStatus: "enabled",
  retryPolicy: "exponential_backoff",
}

/** Data Replay — mock preflight for tenant/window (variance for demo) */
export function getMockPreflight(
  tenantId: string,
  windowStart: string,
  _windowEnd: string
): PreflightResult {
  const base = mockPreflightResult.estimatedEventCount ?? mockPreflightResult.estimatedEvents ?? 1247
  const variance = (tenantId.length + windowStart.length) % 500
  return {
    ...mockPreflightResult,
    estimatedEventCount: Math.max(0, base + variance),
    estimatedEvents: Math.max(100, base + variance),
  }
}

export const mockReplayJobs: ReplayJob[] = [
  {
    id: "job-1",
    tenantId: "t1",
    tenantName: "Acme Capital",
    windowStart: new Date(Date.now() - 86400000 * 2).toISOString(),
    windowEnd: new Date(Date.now() - 86400000).toISOString(),
    mode: "execute",
    status: "completed",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    endedAt: new Date(Date.now() - 3000000).toISOString(),
    estimatedResources: { cpuCores: 2, memoryMB: 512, networkIoMB: 48 },
    actualResources: { cpuCores: 1.8, memoryMB: 480, networkIoMB: 45 },
    summary: "1,247 events replayed successfully",
    createdBy: "admin@gbox360.com",
  },
  {
    id: "job-2",
    tenantId: "t1",
    tenantName: "Acme Capital",
    windowStart: new Date(Date.now() - 86400000 * 7).toISOString(),
    windowEnd: new Date(Date.now() - 86400000 * 5).toISOString(),
    mode: "dry-run",
    status: "completed",
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    endedAt: new Date(Date.now() - 7180000).toISOString(),
    summary: "Dry-run: 3,421 events estimated",
    createdBy: "admin@gbox360.com",
  },
]

export const mockAuditLogsPreview: AuditLogPreview[] = [
  {
    id: "log1",
    timestamp: new Date().toISOString(),
    actionType: "REPLAY",
    description: "Data replay executed for tenant t1",
    payloadRef: "p-001",
  },
  {
    id: "log2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actionType: "DRY_RUN",
    description: "Dry-run simulation completed",
    payloadRef: "p-002",
  },
]

export const mockUsers: Record<string, AdminUser[]> = {
  t1: [
    {
      id: "u1",
      email: "analyst@acme.com",
      name: "Jane Analyst",
      roles: ["ANALYST"],
      tenantId: "t1",
      status: "ACTIVE",
      lastLogin: new Date().toISOString(),
    },
    {
      id: "u2",
      email: "admin@acme.com",
      name: "Admin User",
      roles: ["ENTERPRISE_ADMIN"],
      tenantId: "t1",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  t2: [
    {
      id: "u3",
      email: "pm@beta.com",
      name: "Portfolio Manager",
      roles: ["ANALYST", "VIEWER"],
      tenantId: "t2",
      status: "ACTIVE",
    },
  ],
  t3: [],
}
