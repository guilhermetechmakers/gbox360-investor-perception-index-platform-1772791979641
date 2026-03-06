import { describe, it, expect } from "vitest"
import { computeIPI, DEFAULT_IPI_WEIGHTS } from "./ipi-scoring"

describe("IPI Scoring Engine", () => {
  const mockEvents = [
    { authority_weight: 0.9, credibility_proxy: 0.8, decay_score: 1 },
    { authority_weight: 0.6, credibility_proxy: 0.7, decay_score: 0.9 },
    { authority_weight: 0.3, credibility_proxy: 0.6, decay_score: 1 },
  ]

  describe("computeIPI", () => {
    it("returns total score and component scores", () => {
      const result = computeIPI(mockEvents)
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
      expect(result.narrativeScore).toBeDefined()
      expect(result.credibilityScore).toBeDefined()
      expect(result.riskScore).toBeDefined()
    })

    it("uses default weights when not provided", () => {
      const result = computeIPI(mockEvents)
      expect(result.weightsUsed).toEqual(DEFAULT_IPI_WEIGHTS)
    })

    it("accepts custom weights", () => {
      const result = computeIPI(mockEvents, {
        narrative: 0.5,
        credibility: 0.35,
        risk: 0.15,
      })
      expect(result.weightsUsed.narrative).toBe(0.5)
      expect(result.weightsUsed.credibility).toBe(0.35)
      expect(result.weightsUsed.risk).toBe(0.15)
    })

    it("normalizes weights that do not sum to 1", () => {
      const result = computeIPI(mockEvents, {
        narrative: 1,
        credibility: 1,
        risk: 1,
      })
      const sum = result.weightsUsed.narrative + result.weightsUsed.credibility + result.weightsUsed.risk
      expect(sum).toBeCloseTo(1)
    })

    it("returns empty breakdown for empty events", () => {
      const result = computeIPI([])
      expect(result.totalScore).toBe(0)
      expect(result.narrativeScore).toBe(0)
      expect(result.credibilityScore).toBe(0)
      expect(result.riskScore).toBe(0)
    })

    it("guards against null/undefined events", () => {
      const result = computeIPI(null)
      expect(result.totalScore).toBe(0)
      const result2 = computeIPI(undefined)
      expect(result2.totalScore).toBe(0)
    })

    it("is deterministic for same inputs", () => {
      const r1 = computeIPI(mockEvents)
      const r2 = computeIPI(mockEvents)
      expect(r1.totalScore).toBe(r2.totalScore)
      expect(r1.narrativeScore).toBe(r2.narrativeScore)
    })

    it("includes provisional notice", () => {
      const result = computeIPI(mockEvents)
      expect(result.provisionalNotice).toContain("provisional")
    })
  })
})
