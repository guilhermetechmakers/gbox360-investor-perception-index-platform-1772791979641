import { describe, it, expect } from "vitest"
import {
  ipiWeightsSchema,
  ipiSandboxBodySchema,
  timeWindowSchema,
} from "./ipi"

describe("IPI validators", () => {
  describe("ipiWeightsSchema", () => {
    it("accepts valid provisional weights", () => {
      const result = ipiWeightsSchema.safeParse({
        narrative: 0.4,
        credibility: 0.4,
        risk: 0.2,
      })
      expect(result.success).toBe(true)
    })

    it("accepts weights that do not sum to 1 (provisional)", () => {
      const result = ipiWeightsSchema.safeParse({
        narrative: 0.5,
        credibility: 0.5,
        risk: 0.1,
      })
      expect(result.success).toBe(true)
    })

    it("rejects negative weight", () => {
      const result = ipiWeightsSchema.safeParse({
        narrative: -0.1,
        credibility: 0.5,
        risk: 0.5,
      })
      expect(result.success).toBe(false)
    })

    it("rejects weight > 1", () => {
      const result = ipiWeightsSchema.safeParse({
        narrative: 1.1,
        credibility: 0,
        risk: 0,
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-numeric weight", () => {
      const result = ipiWeightsSchema.safeParse({
        narrative: "0.4",
        credibility: 0.4,
        risk: 0.2,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("ipiSandboxBodySchema", () => {
    it("accepts valid sandbox body", () => {
      const result = ipiSandboxBodySchema.safeParse({
        companyId: "company-1",
        timeWindowStart: "2025-03-01T00:00:00.000Z",
        timeWindowEnd: "2025-03-06T23:59:59.999Z",
        provisionalWeights: { narrative: 0.4, credibility: 0.4, risk: 0.2 },
        scenarioName: "Custom",
      })
      expect(result.success).toBe(true)
    })

    it("rejects missing companyId", () => {
      const result = ipiSandboxBodySchema.safeParse({
        companyId: "",
        timeWindowStart: "2025-03-01T00:00:00.000Z",
        timeWindowEnd: "2025-03-06T23:59:59.999Z",
        provisionalWeights: { narrative: 0.4, credibility: 0.4, risk: 0.2 },
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid provisionalWeights", () => {
      const result = ipiSandboxBodySchema.safeParse({
        companyId: "c1",
        timeWindowStart: "2025-03-01T00:00:00.000Z",
        timeWindowEnd: "2025-03-06T23:59:59.999Z",
        provisionalWeights: { narrative: 2, credibility: 0, risk: 0 },
      })
      expect(result.success).toBe(false)
    })
  })

  describe("timeWindowSchema", () => {
    it("accepts start <= end", () => {
      const result = timeWindowSchema.safeParse({
        start: "2025-03-01",
        end: "2025-03-06",
      })
      expect(result.success).toBe(true)
    })

    it("accepts same start and end", () => {
      const result = timeWindowSchema.safeParse({
        start: "2025-03-01T00:00:00Z",
        end: "2025-03-01T23:59:59Z",
      })
      expect(result.success).toBe(true)
    })

    it("rejects start > end", () => {
      const result = timeWindowSchema.safeParse({
        start: "2025-03-06",
        end: "2025-03-01",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty start", () => {
      const result = timeWindowSchema.safeParse({
        start: "",
        end: "2025-03-06",
      })
      expect(result.success).toBe(false)
    })
  })
})
