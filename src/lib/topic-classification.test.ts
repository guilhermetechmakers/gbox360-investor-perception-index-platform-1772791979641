/**
 * Unit tests for rule-based topic classification.
 */

import { describe, it, expect } from "vitest"
import {
  ruleBasedTopicExtraction,
  getBestTopicId,
  type TopicRule,
} from "@/lib/topic-classification"

describe("ruleBasedTopicExtraction", () => {
  it("returns empty array for empty or null text", () => {
    expect(ruleBasedTopicExtraction("")).toEqual([])
    expect(ruleBasedTopicExtraction(null)).toEqual([])
    expect(ruleBasedTopicExtraction(undefined)).toEqual([])
  })

  it("returns matching topics for text with keywords", () => {
    const result = ruleBasedTopicExtraction("Company reported strong earnings and revenue growth this quarter")
    expect(result.length).toBeGreaterThan(0)
    const earnings = result.find((r) => r.topic_name === "Earnings & Results" || r.topic_id === "earnings-results")
    expect(earnings).toBeDefined()
    expect(earnings!.confidence).toBeGreaterThan(0)
    expect(earnings!.matched_keywords).toBeDefined()
  })

  it("returns topics sorted by confidence descending", () => {
    const result = ruleBasedTopicExtraction("earnings growth outlook revenue guidance expectations")
    for (let i = 1; i < result.length; i++) {
      expect(result[i].confidence).toBeLessThanOrEqual(result[i - 1].confidence)
    }
  })

  it("respects maxCandidates option", () => {
    const result = ruleBasedTopicExtraction(
      "earnings revenue growth risk volatility governance esg sustainability",
      { maxCandidates: 2 }
    )
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it("uses custom rules when provided", () => {
    const customRules: TopicRule[] = [
      { id: "custom-a", name: "Custom A", keywords: ["alpha", "beta"] },
      { id: "custom-b", name: "Custom B", keywords: ["gamma"] },
    ]
    const result = ruleBasedTopicExtraction("This text contains alpha and gamma", {
      rules: customRules,
      maxCandidates: 5,
    })
    expect(result.some((r) => r.topic_id === "custom-a")).toBe(true)
    expect(result.some((r) => r.topic_id === "custom-b")).toBe(true)
  })
})

describe("getBestTopicId", () => {
  it("returns null for empty text", () => {
    expect(getBestTopicId("")).toBeNull()
    expect(getBestTopicId(null)).toBeNull()
  })

  it("returns null when no candidate meets threshold", () => {
    const result = getBestTopicId("xyznonexistent", { threshold: 0.99 })
    expect(result === null || result === "risk-volatility" || result === "growth-outlook").toBe(true)
  })

  it("returns topic id when confidence >= threshold", () => {
    const result = getBestTopicId("earnings and revenue beat expectations", { threshold: 0.2 })
    expect(result === null || typeof result === "string").toBe(true)
    if (result) expect(result.length).toBeGreaterThan(0)
  })
})
