import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { billingApi } from "./billing"

describe("billingApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token-xyz"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("getSubscriptions", () => {
    it("returns empty array when response has no data", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const result = await billingApi.getSubscriptions()
      expect(result).toEqual([])
    })
    it("returns data array when response has data", async () => {
      const data = [{ id: "sub-1", planId: "pro", status: "active" }]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data }),
      })
      const result = await billingApi.getSubscriptions()
      expect(result).toEqual(data)
    })
    it("returns empty array on fetch error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await billingApi.getSubscriptions()
      expect(result).toEqual([])
    })
  })

  describe("getInvoices", () => {
    it("returns data and total with safe defaults", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      })
      const result = await billingApi.getInvoices()
      expect(result).toEqual({ data: [], total: 0 })
    })
    it("returns parsed data and total", async () => {
      const data = [{ id: "inv-1", amount: 99, currency: "USD", status: "paid" }]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data, total: 1 }),
      })
      const result = await billingApi.getInvoices({ page: 1, pageSize: 10 })
      expect(result.data).toEqual(data)
      expect(result.total).toBe(1)
    })
    it("returns empty data and zero total on error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Failed"))
      const result = await billingApi.getInvoices()
      expect(result).toEqual({ data: [], total: 0 })
    })
  })

  describe("getInvoice", () => {
    it("returns null when response is null", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })
      const result = await billingApi.getInvoice("inv-1")
      expect(result).toBeNull()
    })
    it("returns invoice when present", async () => {
      const inv = { id: "inv-1", amount: 99, currency: "USD", status: "paid" }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => inv,
      })
      const result = await billingApi.getInvoice("inv-1")
      expect(result).toEqual(inv)
    })
  })

  describe("checkEntitlements", () => {
    it("returns allowed true when backend allows", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: true, action: "export", resource: "reports" }),
      })
      const result = await billingApi.checkEntitlements("export", "reports")
      expect(result.allowed).toBe(true)
      expect(result.action).toBe("export")
      expect(result.resource).toBe("reports")
    })
    it("returns allowed false with reason when backend denies", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ allowed: false, reason: "Plan limit", planId: "starter" }),
      })
      const result = await billingApi.checkEntitlements("export", "reports")
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe("Plan limit")
    })
    it("returns safe default on fetch error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await billingApi.checkEntitlements("export", "reports")
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe("Check failed")
      expect(result.action).toBe("export")
      expect(result.resource).toBe("reports")
    })
  })

  describe("cancelSubscription", () => {
    it("returns status from response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "canceled" }),
      })
      const result = await billingApi.cancelSubscription("sub-1", true)
      expect(result.status).toBe("canceled")
    })
    it("uses cancelAtPeriodEnd in URL", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      await billingApi.cancelSubscription("sub-1", false)
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("cancelAtPeriodEnd=false"),
        expect.any(Object)
      )
    })
  })

  describe("fetchBillingMetadata", () => {
    it("returns null on error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Not found"))
      const result = await billingApi.fetchBillingMetadata("inv-1")
      expect(result).toBeNull()
    })
    it("returns metadata when present", async () => {
      const meta = { billingAccountId: "ba-1", customerId: "cus_1" }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => meta,
      })
      const result = await billingApi.fetchBillingMetadata("inv-1")
      expect(result).toEqual(meta)
    })
  })
})
