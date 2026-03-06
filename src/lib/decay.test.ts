/**
 * Unit tests for exponential decay weight computation.
 */

import { describe, it, expect } from "vitest"
import {
  computeDecayWeight,
  getDeltaSeconds,
  DEFAULT_DECAY_LAMBDA,
  halfLifeDays,
} from "@/lib/decay"

describe("computeDecayWeight", () => {
  it("returns base weight when lastDecayTime is null", () => {
    expect(computeDecayWeight(1, 0.01, null)).toBe(1)
    expect(computeDecayWeight(5, 0.01, undefined)).toBe(5)
  })

  it("returns base weight when delta is 0 (same time)", () => {
    const now = new Date().toISOString()
    expect(computeDecayWeight(1, 0.01, now, new Date(now).getTime())).toBe(1)
  })

  it("decays weight over time", () => {
    const past = new Date(Date.now() - 10000).toISOString() // 10 seconds ago
    const w = computeDecayWeight(1, 0.01, past)
    expect(w).toBeLessThan(1)
    expect(w).toBeGreaterThan(0)
  })

  it("uses default lambda when negative lambda given", () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const w = computeDecayWeight(1, -1, past)
    expect(w).toBeGreaterThanOrEqual(0)
  })

  it("handles zero base weight", () => {
    expect(computeDecayWeight(0, 0.01, new Date().toISOString())).toBe(0)
  })
})

describe("getDeltaSeconds", () => {
  it("returns 0 when lastDecayTime is null or same as now", () => {
    expect(getDeltaSeconds(null)).toBe(0)
    const now = new Date().toISOString()
    expect(getDeltaSeconds(now, new Date(now).getTime())).toBe(0)
  })

  it("returns positive seconds for past timestamp", () => {
    const past = new Date(Date.now() - 5000).toISOString()
    const delta = getDeltaSeconds(past)
    expect(delta).toBeGreaterThanOrEqual(4)
    expect(delta).toBeLessThanOrEqual(6)
  })
})

describe("DEFAULT_DECAY_LAMBDA", () => {
  it("is a positive number", () => {
    expect(DEFAULT_DECAY_LAMBDA).toBe(0.01)
  })
})

describe("halfLifeDays", () => {
  it("returns Infinity for zero or negative lambda", () => {
    expect(halfLifeDays(0)).toBe(Infinity)
    expect(halfLifeDays(-0.01)).toBe(Infinity)
  })

  it("returns finite positive days for positive lambda", () => {
    const days = halfLifeDays(0.01)
    expect(days).toBeGreaterThan(0)
    expect(Number.isFinite(days)).toBe(true)
  })
})
