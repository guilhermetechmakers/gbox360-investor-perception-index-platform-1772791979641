/**
 * Error logging and status API for 500 page telemetry.
 * Lightweight, non-blocking; fails gracefully when backend is unavailable.
 * No PII is transmitted.
 */

const base = typeof window !== "undefined"
  ? (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api")
  : ""

export interface ErrorLogPayload {
  timestamp: string
  errorCode: string
  path?: string
  route?: string
  environment?: string
  userAgentHash?: string
}

export interface StatusResponse {
  status: "ok" | "degraded" | "down"
  lastUpdated?: string
}

function sanitizePayload(payload: ErrorLogPayload | Record<string, unknown>): ErrorLogPayload {
  const raw = payload as Record<string, unknown>
  const sanitized: ErrorLogPayload = {
    timestamp:
      typeof raw.timestamp === "string"
        ? raw.timestamp
        : new Date().toISOString(),
    errorCode:
      typeof raw.errorCode === "string" ? raw.errorCode : "UNKNOWN",
  }
  if (typeof raw.path === "string") sanitized.path = raw.path
  if (typeof raw.route === "string") sanitized.route = raw.route
  if (typeof raw.environment === "string")
    sanitized.environment = raw.environment
  if (typeof raw.userAgentHash === "string")
    sanitized.userAgentHash = raw.userAgentHash
  return sanitized
}

/**
 * POST minimal error telemetry to logging endpoint.
 * Non-blocking; does not throw. Fails silently when endpoint unavailable.
 */
export async function postErrorLog(payload: ErrorLogPayload): Promise<void> {
  if (typeof window === "undefined") return
  try {
    const sanitized = sanitizePayload(payload)
    await fetch(`${base}/logs/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    /* Non-blocking; fail silently */
  }
}

/**
 * GET system status. Returns null when endpoint unavailable.
 */
export async function fetchStatus(): Promise<StatusResponse | null> {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch(`${base}/status`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as unknown
    if (data && typeof data === "object" && "status" in data) {
      const status = (data as { status?: string }).status
      if (status === "ok" || status === "degraded" || status === "down") {
        return {
          status,
          lastUpdated: (data as { lastUpdated?: string }).lastUpdated,
        }
      }
    }
    return null
  } catch {
    return null
  }
}
