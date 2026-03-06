/**
 * Admin API validators — Zod schemas for replay, audit export, and health-check.
 * Use for client-side validation and type-safe API payloads.
 */

import { z } from "zod"

const auditLogEventTypeEnum = z.enum([
  "INGESTION",
  "EXPORT",
  "WEIGHT_SIM",
  "REPLAY",
])

/** Replay run request body: startTime <= endTime, batchSize > 0, concurrency > 0 */
export const replayRunSchema = z
  .object({
    tenantId: z.string().min(1, "Tenant is required"),
    sourceStream: z.string().optional(),
    targetPipeline: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    windowStart: z.string().min(1, "Start date is required"),
    windowEnd: z.string().min(1, "End date is required"),
    batchSize: z.number().int().positive().optional().default(100),
    concurrency: z.number().int().positive().optional().default(2),
    mode: z.enum(["dry-run", "execute"]),
  })
  .refine(
    (data) => {
      const start = data.windowStart ?? data.startTime
      const end = data.windowEnd ?? data.endTime
      if (!start || !end) return true
      const startDate = new Date(start)
      const endDate = new Date(end)
      return !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate <= endDate
    },
    { message: "Start time must be before or equal to end time", path: ["windowEnd"] }
  )

export type ReplayRunInput = z.infer<typeof replayRunSchema>

/** Audit log export params */
export const auditLogExportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventTypes: z.array(auditLogEventTypeEnum).optional(),
  tenantId: z.string().optional(),
  actor: z.string().optional(),
  search: z.string().optional(),
  format: z.enum(["csv", "json"]).optional().default("csv"),
})

export type AuditLogExportInput = z.infer<typeof auditLogExportSchema>

/** Audit logs list query params */
export const auditLogsQuerySchema = z.object({
  tenantId: z.string().optional(),
  eventTypes: z.array(auditLogEventTypeEnum).optional(),
  actor: z.string().optional(),
  search: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(500).optional().default(25),
  retentionStatus: z.string().optional(),
})

export type AuditLogsQueryInput = z.infer<typeof auditLogsQuerySchema>

/** Health-check response (for client-side validation of API response) */
export const dashboardHealthSchema = z.object({
  health: z.object({
    ingestionQueueLength: z.number(),
    workerStatus: z.enum(["HEALTHY", "DEGRADED", "DOWN"]),
    lastSuccessfulJobAt: z.string().nullable().optional(),
    uptime: z.number().optional(),
    errorRate: z.number().optional(),
    latencyMs: z.number().optional(),
    ingestionStatus: z.enum(["healthy", "degraded", "down"]).optional(),
  }),
  tenants: z.array(z.unknown()).default([]),
  alerts: z.array(z.unknown()).default([]),
})

export type DashboardHealthOutput = z.infer<typeof dashboardHealthSchema>

/**
 * Validate replay run input. Returns { success: true, data } or { success: false, error }.
 */
export function validateReplayRun(
  input: unknown
): { success: true; data: ReplayRunInput } | { success: false; error: z.ZodError } {
  const result = replayRunSchema.safeParse(input)
  if (result.success) return { success: true, data: result.data }
  return { success: false, error: result.error }
}

/**
 * Validate audit log export params.
 */
export function validateAuditLogExport(
  input: unknown
): { success: true; data: AuditLogExportInput } | { success: false; error: z.ZodError } {
  const result = auditLogExportSchema.safeParse(input)
  if (result.success) return { success: true, data: result.data }
  return { success: false, error: result.error }
}

/**
 * Validate audit logs query params.
 */
export function validateAuditLogsQuery(
  input: unknown
): { success: true; data: AuditLogsQueryInput } | { success: false; error: z.ZodError } {
  const result = auditLogsQuerySchema.safeParse(input)
  if (result.success) return { success: true, data: result.data }
  return { success: false, error: result.error }
}
