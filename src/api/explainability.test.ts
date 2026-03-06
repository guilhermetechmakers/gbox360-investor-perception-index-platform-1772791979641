import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { explainabilityApi } from "./explainability"

describe("explainabilityApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("getTopNarratives", () => {
    it("returns narratives and total when API returns valid data", async () => {
      const narratives = [
        { id: "n1", source: "news", platform: "web", rawText: "x", timestamp: "2025-01-01", weight: 0.5 },
      ]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ narratives, total: 1 }),
      })
      const result = await explainabilityApi.getTopNarratives({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
      })
      expect(Array.isArray(result.narratives)).toBe(true)
      expect(result.narratives).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it("returns empty array and zero total when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await explainabilityApi.getTopNarratives({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
      })
      expect(Array.isArray(result.narratives)).toBe(true)
      expect(result.narratives).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it("coerces non-array narratives to empty array", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ narratives: null, total: 0 }),
      })
      const result = await explainabilityApi.getTopNarratives({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
      })
      expect(Array.isArray(result.narratives)).toBe(true)
      expect(result.narratives).toHaveLength(0)
    })
  })

  describe("getAuthorityBreakdown", () => {
    it("returns empty sources when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await explainabilityApi.getAuthorityBreakdown({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
      })
      expect(Array.isArray(result.sources)).toBe(true)
      expect(result.sources).toHaveLength(0)
    })
  })

  describe("getCredibilityProxy", () => {
    it("returns empty proxies when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await explainabilityApi.getCredibilityProxy({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
      })
      expect(Array.isArray(result.proxies)).toBe(true)
      expect(result.proxies).toHaveLength(0)
    })
  })

  describe("postExperiment", () => {
    it("returns safe defaults when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await explainabilityApi.postExperiment({
        companyId: "c1",
        start: "2025-01-01",
        end: "2025-01-07",
        provisionalWeights: {},
      })
      expect(typeof result.currentScore).toBe("number")
      expect(typeof result.delta).toBe("number")
      expect(result.components).toEqual({
        narrativeScore: 0,
        credibilityScore: 0,
        riskProxyScore: 0,
      })
    })
  })
})
