import { describe, it, expect } from "vitest"
import {
  safeArray,
  isArray,
  coalesce,
  safeNumber,
  getArrayFromResponse,
  withDefaults,
} from "@/lib/data-guard"

describe("data-guard", () => {
  describe("safeArray", () => {
    it("returns empty array for null", () => {
      expect(safeArray(null)).toEqual([])
    })
    it("returns empty array for undefined", () => {
      expect(safeArray(undefined)).toEqual([])
    })
    it("returns same array when given array", () => {
      const arr = [1, 2, 3]
      expect(safeArray(arr)).toBe(arr)
    })
    it("returns empty array for non-array", () => {
      expect(safeArray("x" as unknown as number[])).toEqual([])
      expect(safeArray({} as unknown as number[])).toEqual([])
    })
  })

  describe("isArray", () => {
    it("returns true for array", () => {
      expect(isArray([1])).toBe(true)
    })
    it("returns false for null", () => {
      expect(isArray(null)).toBe(false)
    })
    it("returns false for object", () => {
      expect(isArray({})).toBe(false)
    })
  })

  describe("coalesce", () => {
    it("returns value when non-null", () => {
      expect(coalesce("a", "b")).toBe("a")
    })
    it("returns fallback when null", () => {
      expect(coalesce(null, "b")).toBe("b")
    })
    it("returns fallback when undefined", () => {
      expect(coalesce(undefined, 0)).toBe(0)
    })
  })

  describe("safeNumber", () => {
    it("returns value when valid", () => {
      expect(safeNumber(42, 0)).toBe(42)
    })
    it("returns fallback when NaN", () => {
      expect(safeNumber(Number.NaN, 0)).toBe(0)
    })
    it("returns fallback when null", () => {
      expect(safeNumber(null, 10)).toBe(10)
    })
    it("returns fallback when undefined", () => {
      expect(safeNumber(undefined, 10)).toBe(10)
    })
  })

  describe("getArrayFromResponse", () => {
    it("returns data when response has array data", () => {
      const data = [{ id: "1" }]
      expect(getArrayFromResponse({ data })).toEqual(data)
    })
    it("returns empty array when response is null", () => {
      expect(getArrayFromResponse(null)).toEqual([])
    })
    it("returns empty array when data is not array", () => {
      expect(getArrayFromResponse({ data: "x" as unknown as unknown[] })).toEqual([])
    })
    it("returns empty array when data is undefined", () => {
      expect(getArrayFromResponse({})).toEqual([])
    })
  })

  describe("withDefaults", () => {
    it("merges defaults with response", () => {
      const res = { a: 1 } as { a: number; b: number }
      expect(withDefaults(res, { b: 2 })).toEqual({ a: 1, b: 2 })
    })
    it("uses response over defaults", () => {
      const res = { a: 1, b: 3 } as { a: number; b: number }
      expect(withDefaults(res, { b: 2 })).toEqual({ a: 1, b: 3 })
    })
    it("handles null response", () => {
      expect(withDefaults(null, { a: 1 } as Record<string, unknown>)).toEqual({ a: 1 })
    })
  })
})
