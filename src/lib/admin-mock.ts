/**
 * Mock data for admin dashboard when API is unavailable.
 * Used for development and demo.
 */

import type {
  DashboardHealth,
  AuditLogsResponse,
  AdminUser,
  Tenant,
} from "@/types/admin"

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

export const mockAuditLogs: AuditLogsResponse = {
  items: [
    {
      id: "log1",
      eventType: "INGESTION",
      source: "news-api",
      actor: "system",
      timestamp: new Date().toISOString(),
      payloadRef: "evt-001",
      tenantId: "t1",
    },
    {
      id: "log2",
      eventType: "EXPORT",
      source: "user-action",
      actor: "user@acme.com",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      payloadRef: "evt-002",
      tenantId: "t1",
    },
    {
      id: "log3",
      eventType: "WEIGHT_SIMULATION",
      source: "user-action",
      actor: "user@beta.com",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      tenantId: "t2",
    },
    {
      id: "log4",
      eventType: "REPLAY",
      source: "admin",
      actor: "admin@gbox360.com",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      payloadRef: "evt-003",
      tenantId: "t1",
    },
  ],
  count: 4,
  page: 1,
  pageSize: 25,
}

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
