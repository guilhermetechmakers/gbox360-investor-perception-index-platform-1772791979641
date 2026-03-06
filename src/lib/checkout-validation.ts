/**
 * Checkout validation helpers — resilient to null/undefined.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return false
  return EMAIL_REGEX.test(value.trim())
}

export function isNotEmpty(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return false
  return value.trim().length > 0
}

export function isValidVAT(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return true
  const trimmed = value.trim()
  if (trimmed.length === 0) return true
  return /^[A-Z]{2}[0-9A-Z]{8,12}$/i.test(trimmed)
}

export function isPastDate(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return true
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date < new Date()
}

export function isValidCardNumber(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return false
  const digits = value.replace(/\D/g, "")
  return digits.length >= 13 && digits.length <= 19
}

export function isValidExpiry(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return false
  const [mm, yy] = value.split("/").map((s) => s.trim())
  const month = parseInt(mm ?? "0", 10)
  const year = parseInt(yy ?? "0", 10)
  const fullYear = year < 100 ? 2000 + year : year
  const now = new Date()
  if (month < 1 || month > 12) return false
  if (fullYear < now.getFullYear()) return false
  if (fullYear === now.getFullYear() && month < now.getMonth() + 1) return false
  return true
}

export function isValidCvc(value: string | null | undefined): boolean {
  if (value == null || typeof value !== "string") return false
  const digits = value.replace(/\D/g, "")
  return digits.length >= 3 && digits.length <= 4
}
