import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { adminApi } from "./admin"

describe("adminApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "Bearer token-xyz"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("getDashboardHealth", () => {
    it("returns API health when response has health and tenants", async () => {
      const health = {
        ingestionQueueLength: 3,
        workerStatus: "HEALTHY",
        lastSuccessfulJobAt: "2025-01-01T00:00:00Z",
        uptime: 99.9,
        errorRate: 0.1,
        latencyMs: 80,
      }
      const tenants = [{ id: "t1", name: "Tenant A", usage: { transactions: 100, storageGB: 10 }, billingStatus: "PAID", status: "ACTIVE" }]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ health, tenants, alerts: [] }),
      })
      const result = await adminApi.getDashboardHealth()
      expect(result.health).toEqual(health)
      expect(Array.isArray(result.tenants)).toBe(true)
      expect(result.tenants).toHaveLength(1)
      expect(result.tenants[0].id).toBe("t1")
    })

    it("returns mock data when fetch fails", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await adminApi.getDashboardHealth()
      expect(result).toBeDefined()
      expect(result.health).toBeDefined()
      expect(result.health.ingestionQueueLength).toBeDefined()
      expect(Array.isArray(result.tenants)).toBe(true)
      expect(Array.isArray(result.alerts)).toBe(true)
    })
  })

  describe("postHealthCheck", () => {
    it("returns API response when fetch succeeds", async () => {
      const health = {
        ingestionQueueLength: 0,
        workerStatus: "HEALTHY",
        lastSuccessfulJobAt: new Date().toISOString(),
      }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ health, tenants: [], alerts: [] }),
      })
      const result = await adminApi.postHealthCheck()
      expect(result.health).toEqual(health)
      expect(result.tenants).toEqual([])
    })

    it("returns mock data when fetch fails", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await adminApi.postHealthCheck()
      expect(result).toBeDefined()
      expect(result.health).toBeDefined()
      expect(Array.isArray(result.tenants)).toBe(true)
    })
  })

  describe("getAuditLogs", () => {
    it("returns items and count from API", async () => {
      const items = [
        {
          id: "log1",
          timestamp: new Date().toISOString(),
          eventType: "INGESTION",
          actor: "system@example.com",
          tenantId: "t1",
        },
      ]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: items, items, count: 1, page: 1, pageSize: 25 }),
      })
      const result = await adminApi.getAuditLogs({ page: 1, pageSize: 25 })
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toBeDefined()
      const data = result.data!
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe("log1")
      expect(result.count).toBe(1)
    })

    it("returns mock data when fetch fails", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await adminApi.getAuditLogs({})
      expect(result).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.count).toBe("number")
    })
  })

  describe("exportAuditLogs", () => {
    it("returns url when API returns url", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "blob:https://example.com/abc" }),
      })
      const result = await adminApi.exportAuditLogs({ format: "csv" })
      expect(result.url).toBe("blob:https://example.com/abc")
    })

    it("returns mock CSV url when fetch fails", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await adminApi.exportAuditLogs({ format: "csv" })
      expect(result).toBeDefined()
      expect(result.url).toBeDefined()
      expect(typeof result.url).toBe("string")
    })

    it("returns mock JSON url when fetch fails and format is json", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await adminApi.exportAuditLogs({ format: "json" })
      expect(result).toBeDefined()
      expect(result.url).toBeDefined()
    })
  })
})
