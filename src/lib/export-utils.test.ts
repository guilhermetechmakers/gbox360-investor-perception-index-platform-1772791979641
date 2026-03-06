import { describe, it, expect } from "vitest"
import {
  exportNarrativesToCsv,
  exportEventsToCsv,
  exportToJson,
} from "@/lib/export-utils"

describe("export-utils", () => {
  describe("exportNarrativesToCsv", () => {
    it("returns header and rows for array of objects", () => {
      const rows = [
        { id: "1", source: "news", platform: "web", rawText: "Text", timestamp: "2025-01-01", weight: 0.5 },
      ]
      const csv = exportNarrativesToCsv(rows)
      expect(csv).toContain("id,source,platform,rawText,timestamp,weight")
      expect(csv).toContain("1,news,web,Text,2025-01-01,0.5")
    })

    it("returns only header for empty array", () => {
      const csv = exportNarrativesToCsv([])
      expect(csv).toBe("id,source,platform,rawText,timestamp,weight\n")
    })

    it("handles null/undefined as empty array", () => {
      const csv = exportNarrativesToCsv(null as unknown as Array<Record<string, unknown>>)
      expect(csv).toContain("id,")
    })

    it("escapes commas in cells", () => {
      const rows = [{ id: "1", source: "a, b", platform: "", rawText: "", timestamp: "", weight: 0 }]
      const csv = exportNarrativesToCsv(rows)
      expect(csv).toContain('"a, b"')
    })
  })

  describe("exportEventsToCsv", () => {
    it("returns header and rows for events", () => {
      const rows = [
        { id: "e1", narrativeId: "n1", type: "news", timestamp: "2025-01-01T00:00:00Z", payloadRef: "ref1" },
      ]
      const csv = exportEventsToCsv(rows)
      expect(csv).toContain("id,narrativeId,type,timestamp,payloadRef")
      expect(csv).toContain("e1,n1,news,")
    })

    it("returns only header for empty array", () => {
      const csv = exportEventsToCsv([])
      expect(csv).toBe("id,narrativeId,type,timestamp,payloadRef\n")
    })
  })

  describe("exportToJson", () => {
    it("returns formatted JSON for object", () => {
      const data = { a: 1, b: [2, 3] }
      const json = exportToJson(data)
      expect(JSON.parse(json)).toEqual(data)
    })

    it("handles null", () => {
      expect(exportToJson(null)).toBe("null")
    })
  })
})
