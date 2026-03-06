import { describe, it, expect } from "vitest"
import {
  validateReplayRun,
  validateAuditLogExport,
  validateAuditLogsQuery,
  dashboardHealthSchema,
} from "@/lib/admin-validators"

describe("admin-validators", () => {
  describe("replayRunSchema / validateReplayRun", () => {
    it("accepts valid replay run input with window dates", () => {
      const input = {
        tenantId: "t1",
        windowStart: "2025-01-01",
        windowEnd: "2025-01-07",
        mode: "dry-run" as const,
      }
      const result = validateReplayRun(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tenantId).toBe("t1")
        expect(result.data.windowStart).toBe("2025-01-01")
        expect(result.data.windowEnd).toBe("2025-01-07")
        expect(result.data.mode).toBe("dry-run")
        expect(result.data.batchSize).toBe(100)
        expect(result.data.concurrency).toBe(2)
      }
    })

    it("accepts execute mode and optional batchSize/concurrency", () => {
      const input = {
        tenantId: "t2",
        windowStart: "2025-02-01",
        windowEnd: "2025-02-28",
        mode: "execute" as const,
        batchSize: 50,
        concurrency: 4,
      }
      const result = validateReplayRun(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.mode).toBe("execute")
        expect(result.data.batchSize).toBe(50)
        expect(result.data.concurrency).toBe(4)
      }
    })

    it("rejects when windowEnd is before windowStart", () => {
      const input = {
        tenantId: "t1",
        windowStart: "2025-01-07",
        windowEnd: "2025-01-01",
        mode: "dry-run" as const,
      }
      const result = validateReplayRun(input)
      expect(result.success).toBe(false)
    })

    it("rejects when tenantId is empty", () => {
      const result = validateReplayRun({
        tenantId: "",
        windowStart: "2025-01-01",
        windowEnd: "2025-01-07",
        mode: "dry-run",
      })
      expect(result.success).toBe(false)
    })

    it("rejects when windowStart or windowEnd is missing", () => {
      expect(validateReplayRun({ tenantId: "t1", windowEnd: "2025-01-07", mode: "dry-run" }).success).toBe(false)
      expect(validateReplayRun({ tenantId: "t1", windowStart: "2025-01-01", mode: "dry-run" }).success).toBe(false)
    })
  })

  describe("auditLogExportSchema / validateAuditLogExport", () => {
    it("accepts minimal export params and defaults format to csv", () => {
      const result = validateAuditLogExport({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.format).toBe("csv")
      }
    })

    it("accepts full export params with format json", () => {
      const input = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        eventTypes: ["INGESTION", "EXPORT"] as const,
        tenantId: "t1",
        actor: "user@example.com",
        search: "test",
        format: "json" as const,
      }
      const result = validateAuditLogExport(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.format).toBe("json")
        expect(result.data.eventTypes).toEqual(["INGESTION", "EXPORT"])
      }
    })

    it("rejects invalid event type", () => {
      const result = validateAuditLogExport({ eventTypes: ["INVALID"], format: "csv" })
      expect(result.success).toBe(false)
    })
  })

  describe("auditLogsQuerySchema / validateAuditLogsQuery", () => {
    it("accepts empty object and applies defaults", () => {
      const result = validateAuditLogsQuery({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.pageSize).toBe(25)
      }
    })

    it("accepts full query params", () => {
      const input = {
        tenantId: "t1",
        eventTypes: ["REPLAY"],
        actor: "admin@example.com",
        start: "2025-01-01",
        end: "2025-01-31",
        page: 2,
        pageSize: 50,
      }
      const result = validateAuditLogsQuery(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.pageSize).toBe(50)
      }
    })

    it("rejects pageSize over 500", () => {
      const result = validateAuditLogsQuery({ pageSize: 501 })
      expect(result.success).toBe(false)
    })
  })

  describe("dashboardHealthSchema", () => {
    it("parses valid health response", () => {
      const res = dashboardHealthSchema.parse({
        health: {
          ingestionQueueLength: 5,
          workerStatus: "HEALTHY",
          lastSuccessfulJobAt: "2025-01-01T00:00:00Z",
          uptime: 99.9,
          errorRate: 0.1,
          latencyMs: 100,
        },
        tenants: [],
        alerts: [],
      })
      expect(res.health.workerStatus).toBe("HEALTHY")
      expect(res.health.uptime).toBe(99.9)
    })
  })
})
