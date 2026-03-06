/**
 * Client-side export helpers for narratives and events (CSV/JSON).
 * Safe against null/undefined; uses (items ?? []) before mapping.
 */

function escapeCsvCell(value: string): string {
  const s = String(value ?? "")
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportNarrativesToCsv(
  rows: Array<Record<string, unknown>>,
  columns: string[] = ["id", "source", "platform", "rawText", "timestamp", "weight"]
): string {
  const items = Array.isArray(rows) ? rows : []
  const header = columns.join(",")
  const body = items
    .map((row) =>
      columns
        .map((col) => escapeCsvCell(String(row?.[col] ?? "")))
        .join(",")
    )
    .join("\n")
  return `${header}\n${body}`
}

export function exportEventsToCsv(
  rows: Array<Record<string, unknown>>,
  columns: string[] = ["id", "narrativeId", "type", "timestamp", "payloadRef"]
): string {
  const items = Array.isArray(rows) ? rows : []
  const header = columns.join(",")
  const body = items
    .map((row) =>
      columns
        .map((col) => escapeCsvCell(String(row?.[col] ?? "")))
        .join(",")
    )
    .join("\n")
  return `${header}\n${body}`
}

export function exportToJson<T>(data: T): string {
  return JSON.stringify(data ?? null, null, 2)
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCsv(content: string, baseName: string): void {
  downloadBlob(content, `${baseName}.csv`, "text/csv;charset=utf-8")
}

export function downloadJson(content: string, baseName: string): void {
  downloadBlob(content, `${baseName}.json`, "application/json")
}
