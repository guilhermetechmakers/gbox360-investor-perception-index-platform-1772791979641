import { describe, it, expect } from "vitest"
import {
  detectManagementLanguage,
  computeCredibilityProxy,
  repetitionScoreWithDecay,
  getSourceCredibilityModifier,
} from "./credibility-proxy"

describe("Credibility Proxy Engine", () => {
  describe("detectManagementLanguage", () => {
    it("returns higher score for first-person and certainty words", () => {
      const text = "We are confident in our growth. I believe we will exceed expectations."
      const score = detectManagementLanguage(text)
      expect(score).toBeGreaterThan(0.5)
    })

    it("returns lower score for hedges", () => {
      const text = "Maybe we could perhaps improve somewhat."
      const score = detectManagementLanguage(text)
      expect(score).toBeLessThanOrEqual(0.5)
    })

    it("returns 0.5 for empty or very short text", () => {
      expect(detectManagementLanguage("")).toBe(0.5)
      expect(detectManagementLanguage("Hi")).toBe(0.5)
      expect(detectManagementLanguage(null)).toBe(0.5)
    })

    it("guards against null/undefined", () => {
      expect(detectManagementLanguage(null)).toBe(0.5)
      expect(detectManagementLanguage(undefined)).toBe(0.5)
    })
  })

  describe("repetitionScoreWithDecay", () => {
    it("returns 0.5 when lastSeenAt is null", () => {
      expect(repetitionScoreWithDecay(null)).toBe(0.5)
    })

    it("returns higher score for recent dates", () => {
      const now = new Date()
      const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const score = repetitionScoreWithDecay(recent.toISOString(), now)
      expect(score).toBeGreaterThan(0.5)
    })
  })

  describe("getSourceCredibilityModifier", () => {
    it("returns 1.2 for high tier", () => {
      expect(getSourceCredibilityModifier("high")).toBe(1.2)
    })
    it("returns 0.7 for low tier", () => {
      expect(getSourceCredibilityModifier("low")).toBe(0.7)
    })
    it("returns 1.0 for medium or unknown", () => {
      expect(getSourceCredibilityModifier("medium")).toBe(1.0)
      expect(getSourceCredibilityModifier(null)).toBe(1.0)
    })
  })

  describe("computeCredibilityProxy", () => {
    it("returns 0-1 normalized score", () => {
      const score = computeCredibilityProxy(
        "We are confident. I believe we will succeed."
      )
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it("handles null text", () => {
      const score = computeCredibilityProxy(null)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })
})
