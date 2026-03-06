import { describe, it, expect } from "vitest"

/**
 * Exponential decay: weight = base_weight * exp(-lambda * delta_seconds)
 * Matches Edge Function logic for narrative persistence.
 */
function computeDecayedWeight(
  baseWeight: number,
  lastDecayTime: string | null | undefined,
  lambda = 0.01
): number {
  if (!lastDecayTime) return baseWeight
  const deltaSeconds = (Date.now() - new Date(lastDecayTime).getTime()) / 1000
  return Math.max(0, baseWeight * Math.exp(-lambda * deltaSeconds))
}

describe("narrative decay", () => {
  it("returns base weight when lastDecayTime is null", () => {
    expect(computeDecayedWeight(1, null)).toBe(1)
    expect(computeDecayedWeight(5, undefined)).toBe(5)
  })

  it("returns base weight when lastDecayTime is now", () => {
    const now = new Date().toISOString()
    expect(computeDecayedWeight(1, now)).toBeCloseTo(1, 0)
  })

  it("decays over time", () => {
    // Use smaller lambda so 1 hour ago still yields positive weight
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const weight = computeDecayedWeight(1, oneHourAgo, 0.0001)
    expect(weight).toBeLessThan(1)
    expect(weight).toBeGreaterThan(0)
  })

  it("never returns negative", () => {
    const longAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    const weight = computeDecayedWeight(1, longAgo, 0.1)
    expect(weight).toBeGreaterThanOrEqual(0)
  })
})
