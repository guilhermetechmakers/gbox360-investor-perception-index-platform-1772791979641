/**
 * Highlights matching segments of text (fuzzy-style: case-insensitive substring).
 * Returns array of segments; matching runs are wrapped in <mark> for accessibility.
 */
export function getHighlightSegments(
  text: string,
  query: string
): Array<{ type: "match" | "text"; value: string }> {
  if (!query || !text) {
    return text ? [{ type: "text" as const, value: text }] : []
  }
  const q = query.trim().toLowerCase()
  if (q.length === 0) return [{ type: "text", value: text }]
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx < 0) return [{ type: "text", value: text }]
  const segments: Array<{ type: "match" | "text"; value: string }> = []
  if (idx > 0) {
    segments.push({ type: "text", value: text.slice(0, idx) })
  }
  segments.push({ type: "match", value: text.slice(idx, idx + q.length) })
  if (idx + q.length < text.length) {
    segments.push({ type: "text", value: text.slice(idx + q.length) })
  }
  return segments
}
