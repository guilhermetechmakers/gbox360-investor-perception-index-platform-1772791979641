/**
 * Lightweight telemetry hook for 500 error page.
 * Sends non-PII diagnostic payload on render and on retry.
 * Non-blocking; fails silently when endpoint unavailable.
 */

import { useCallback, useRef } from "react"
import { postErrorLog } from "@/api/errors"

export interface TelemetryPayload {
  errorCode: string
  path?: string
  route?: string
  isRetry?: boolean
}

function getEnvironment(): string {
  if (typeof window === "undefined") return "unknown"
  const env = import.meta.env.MODE ?? "unknown"
  return env === "production" ? "production" : env === "development" ? "development" : env
}

/**
 * Sends minimal telemetry payload. No PII.
 */
export function useErrorTelemetry() {
  const hasLoggedRef = useRef(false)

  const sendTelemetry = useCallback((payload: TelemetryPayload) => {
    if (typeof window === "undefined") return
    const env = getEnvironment()
    const path = payload.path ?? window.location?.pathname ?? ""
    const route = payload.route ?? path
    postErrorLog({
      timestamp: new Date().toISOString(),
      errorCode: payload.errorCode ?? "UNKNOWN_ERROR",
      path,
      route,
      environment: env,
    })
  }, [])

  const logOnMount = useCallback(
    (errorCode: string) => {
      if (hasLoggedRef.current) return
      hasLoggedRef.current = true
      sendTelemetry({
        errorCode,
        path: window.location?.pathname ?? "",
        route: window.location?.pathname ?? "",
        isRetry: false,
      })
    },
    [sendTelemetry]
  )

  const logOnRetry = useCallback(
    (errorCode: string) => {
      sendTelemetry({
        errorCode,
        path: window.location?.pathname ?? "",
        route: window.location?.pathname ?? "",
        isRetry: true,
      })
    },
    [sendTelemetry]
  )

  return { logOnMount, logOnRetry }
}
