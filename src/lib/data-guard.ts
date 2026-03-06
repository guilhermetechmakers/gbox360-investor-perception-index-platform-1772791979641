/**
 * DataGuard utilities — safe access and validation for API data.
 * Use data ?? [] for arrays; guard all array operations and optional chaining.
 */

/**
 * Returns the value if it is a non-null array; otherwise returns an empty array.
 */
export function safeArray<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

/**
 * Type guard: true if value is a non-null array.
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Coalesce to default when value is null or undefined.
 */
export function coalesce<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback
}

/**
 * Safe number: returns fallback when value is NaN, null, or undefined.
 */
export function safeNumber(value: number | null | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) return fallback
  return value
}

/**
 * Extract array from response with optional chaining and default.
 */
export function getArrayFromResponse<T>(
  response: { data?: T[] | null } | null | undefined
): T[] {
  const data = response?.data
  return Array.isArray(data) ? data : []
}

/**
 * Destructure with safe defaults for common response shapes.
 */
export function withDefaults<T extends Record<string, unknown>>(
  response: T | null | undefined,
  defaults: Partial<T>
): T {
  const base = (response ?? {}) as T
  return { ...defaults, ...base } as T
}
