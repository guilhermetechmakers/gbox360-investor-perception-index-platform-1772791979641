import { describe, it, expect } from "vitest"

/**
 * Defensive guards for narrative API responses.
 * Ensures runtime safety per mandatory coding standards.
 */
function safeNarrativeList<T>(data: unknown): T[] {
  const list = Array.isArray(data) ? data : (data as { data?: T[] })?.data
  return Array.isArray(list) ? list : []
}

function safeEventList<T>(response: unknown): T[] {
  const data = (response as { data?: T[] })?.data ?? (response as T[])
  return Array.isArray(data) ? data : []
}

describe("narrative data guards", () => {
  it("returns empty array for null", () => {
    expect(safeNarrativeList(null)).toEqual([])
  })

  it("returns empty array for undefined", () => {
    expect(safeNarrativeList(undefined)).toEqual([])
  })

  it("returns array when data is array", () => {
    const arr = [{ id: "1", name: "a" }]
    expect(safeNarrativeList(arr)).toEqual(arr)
  })

  it("extracts data from response shape", () => {
    const arr = [{ id: "1" }]
    expect(safeNarrativeList({ data: arr })).toEqual(arr)
  })

  it("returns empty array for non-array data", () => {
    expect(safeNarrativeList({ data: "not-array" })).toEqual([])
  })

  it("safeEventList returns empty for null", () => {
    expect(safeEventList(null)).toEqual([])
  })

  it("safeEventList returns array from response", () => {
    const arr = [{ id: "e1" }]
    expect(safeEventList({ data: arr })).toEqual(arr)
  })
})
