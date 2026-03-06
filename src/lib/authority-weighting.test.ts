import { describe, it, expect } from "vitest"
import {
  getAuthorityWeight,
  normalizeWeights,
  serializeAuthorityMapping,
} from "./authority-weighting"

describe("Authority Weighting Engine", () => {
  describe("getAuthorityWeight", () => {
    it("returns Analyst > Media > Retail", () => {
      expect(getAuthorityWeight("Analyst")).toBe(0.9)
      expect(getAuthorityWeight("Media")).toBe(0.6)
      expect(getAuthorityWeight("Retail")).toBe(0.3)
    })

    it("returns 0.1 for unknown source type", () => {
      expect(getAuthorityWeight("unknown")).toBe(0.1)
      expect(getAuthorityWeight("")).toBe(0.1)
      expect(getAuthorityWeight(null)).toBe(0.1)
      expect(getAuthorityWeight(undefined)).toBe(0.1)
    })

    it("applies integration override for earnings_transcript", () => {
      expect(getAuthorityWeight("Analyst", "earnings_transcript")).toBe(0.95)
    })

    it("applies integration override for news_wire", () => {
      expect(getAuthorityWeight("Media", "news_wire")).toBe(0.7)
    })

    it("returns deterministic results for same inputs", () => {
      expect(getAuthorityWeight("Analyst")).toBe(getAuthorityWeight("Analyst"))
      expect(getAuthorityWeight("Media", "news_wire")).toBe(
        getAuthorityWeight("Media", "news_wire")
      )
    })
  })

  describe("normalizeWeights", () => {
    it("normalizes weights to sum to 1", () => {
      const result = normalizeWeights([1, 1, 1])
      expect(result.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    })

    it("returns empty array for empty input", () => {
      expect(normalizeWeights([])).toEqual([])
    })

    it("handles null/undefined safely", () => {
      expect(normalizeWeights(null as unknown as number[])).toEqual([])
    })
  })

  describe("serializeAuthorityMapping", () => {
    it("returns serialization-friendly object", () => {
      const result = serializeAuthorityMapping("Analyst", 0.9, "earnings")
      expect(result.source_type).toBe("Analyst")
      expect(result.base_weight).toBe(0.9)
      expect(result.overrides).toEqual({ earnings: 0.9 })
    })
  })
})
