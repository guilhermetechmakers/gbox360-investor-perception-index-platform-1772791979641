import { describe, it, expect } from "vitest"
import {
  toCanonicalFromPayload,
  ingestWithRetry,
  runMockIngestionCycle,
  mockNewsFetch,
  mockEarningsBatch,
} from "@/lib/ingestion"

describe("Integration layer (ingestion)", () => {
  describe("toCanonicalFromPayload", () => {
    it("computes authority_weight and credibility_proxy and preserves raw_payload", () => {
      const payload = {
        id: "ev-1",
        source: "Earnings Call",
        platform: "earnings_transcript",
        source_type: "Analyst" as const,
        raw_text: "We are confident in our growth.",
        speaker_entity: "CEO",
        published_at: new Date().toISOString(),
        company_id: "co-1",
        raw_payload: { foo: "bar", source: "test" },
      }
      const canonical = toCanonicalFromPayload(payload, "co-1")
      expect(canonical.authority_weight).toBeGreaterThan(0.5)
      expect(canonical.credibility_proxy).toBeGreaterThanOrEqual(0)
      expect(canonical.credibility_proxy).toBeLessThanOrEqual(1)
      expect(canonical.raw_payload).toEqual({ foo: "bar", source: "test" })
      expect(canonical.company_id).toBe("co-1")
    })

    it("infers Analyst from platform earnings_transcript", () => {
      const payload = {
        source: "Unknown",
        platform: "earnings_transcript",
        raw_text: "Text",
        raw_payload: {},
      }
      const canonical = toCanonicalFromPayload(payload, "c1")
      expect(canonical.authority_weight).toBeGreaterThanOrEqual(0.9)
    })
  })

  describe("ingestWithRetry", () => {
    it("returns data on first success", async () => {
      const { data, retryCount } = await ingestWithRetry(() => Promise.resolve("ok"))
      expect(data).toBe("ok")
      expect(retryCount).toBe(0)
    })

    it("retries and succeeds on second attempt", async () => {
      let attempts = 0
      const { data, retryCount } = await ingestWithRetry(() => {
        attempts++
        if (attempts < 2) throw new Error("fail")
        return Promise.resolve("ok")
      }, { maxRetries: 2, retryDelayMs: 10 })
      expect(data).toBe("ok")
      expect(retryCount).toBe(1)
    })

    it("returns error after max retries", async () => {
      const { data, error, retryCount } = await ingestWithRetry(
        () => Promise.reject(new Error("nope")),
        { maxRetries: 1, retryDelayMs: 5 }
      )
      expect(data).toBeNull()
      expect(error).toBe("nope")
      expect(retryCount).toBe(1)
    })
  })

  describe("runMockIngestionCycle", () => {
    it("returns at least one successful result with preserved raw_payload", async () => {
      const results = await runMockIngestionCycle("company-1", "key-123")
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThanOrEqual(1)
      const success = results.filter((r) => r.success)
      expect(success.length).toBeGreaterThanOrEqual(1)
      const withPayload = success.find((r) => r.canonical?.raw_payload != null)
      expect(withPayload?.canonical?.raw_payload).toBeDefined()
    })

    it("is idempotent for same key (same payload shape)", async () => {
      const a = await runMockIngestionCycle("c1", "same-key")
      const b = await runMockIngestionCycle("c1", "same-key")
      expect(a.length).toBe(b.length)
      const aIds = (a ?? []).map((r) => r.canonical?.id ?? r.eventId).filter(Boolean)
      const bIds = (b ?? []).map((r) => r.canonical?.id ?? r.eventId).filter(Boolean)
      expect(aIds.length).toBe(bIds.length)
    })
  })

  describe("mockNewsFetch / mockEarningsBatch", () => {
    it("returns null without idempotencyKey", async () => {
      expect(await mockNewsFetch("c1", "")).toBeNull()
      expect(await mockEarningsBatch("c1", "")).toBeNull()
    })

    it("returns payload with raw_payload for audit", async () => {
      const p = await mockNewsFetch("c1", "", "k1")
      expect(p).not.toBeNull()
      expect(p?.raw_payload).toEqual({ source: "mock_news", key: "k1" })
    })
  })
})
