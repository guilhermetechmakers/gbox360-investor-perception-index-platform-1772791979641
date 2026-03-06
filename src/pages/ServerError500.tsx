/**
 * 500 Server Error — Friendly, branded error page for internal server errors.
 * Provides retry, contact support, view status, error reference code, and
 * collapsible diagnostics. Lightweight telemetry with no PII.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { AnimatedPage } from "@/components/AnimatedPage"
import { useErrorTelemetry } from "@/hooks/useErrorTelemetry"
import { fetchStatus } from "@/api/errors"
import {
  ErrorHero500,
  ActionPanel500,
  ErrorCodeDisplay,
  DiagnosticsPanel,
  StatusBadge,
} from "@/components/server-error"

/** Generate a unique, readable error reference code */
function generateErrorCode(): string {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ERR-${t}-${r}`
}

interface ServerError500Props {
  errorCode?: string
  retryCallback?: () => void
}

export default function ServerError500({
  errorCode: propErrorCode,
  retryCallback,
}: ServerError500Props) {
  const [errorCode] = useState<string>(() => propErrorCode ?? generateErrorCode())
  const [isRetrying, setIsRetrying] = useState(false)
  const [statusData, setStatusData] = useState<{
    status: "ok" | "degraded" | "down"
    lastUpdated?: string
  } | null>(null)
  const { logOnMount, logOnRetry } = useErrorTelemetry()

  // Use prop if provided and stable
  const displayCode = propErrorCode ?? errorCode

  const diagnostics = useMemo(
    () => ({
      timestamp: new Date().toISOString(),
      route: typeof window !== "undefined" ? window.location?.pathname ?? "" : "",
      transientFlag: false,
    }),
    []
  )

  useEffect(() => {
    logOnMount(displayCode)
  }, [displayCode, logOnMount])

  useEffect(() => {
    let cancelled = false
    fetchStatus().then((res) => {
      if (!cancelled && res) {
        setStatusData({
          status: res.status,
          lastUpdated: res.lastUpdated ?? undefined,
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleRetry = useCallback(() => {
    setIsRetrying(true)
    logOnRetry(displayCode)
    retryCallback?.()
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }, [displayCode, logOnRetry, retryCallback])

  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))]">
      <Navbar />
      <AnimatedPage>
        <main className="container px-4 py-16 md:py-24">
          <section className="mx-auto max-w-[960px] space-y-8">
            <ErrorHero500 />

            {statusData && (
              <div className="flex justify-center" aria-live="polite">
                <StatusBadge
                  status={statusData.status}
                  lastUpdated={statusData.lastUpdated}
                />
              </div>
            )}

            <ActionPanel500
              onRetry={handleRetry}
              isRetrying={isRetrying}
              errorCode={displayCode}
              supportHref="/about-help#contact"
              statusHref="/about-help"
            />

            <ErrorCodeDisplay
              errorCode={displayCode}
              label="Error reference"
            />

            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <DiagnosticsPanel data={diagnostics} />
            </div>
          </section>

          <section className="mx-auto mt-12 max-w-[960px]">
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Tip:</strong> If this keeps
              happening, try again in a few minutes or contact support with the
              reference code above. Our team monitors these incidents and works
              to resolve them quickly.
            </div>
          </section>
        </main>
      </AnimatedPage>
    </div>
  )
}
