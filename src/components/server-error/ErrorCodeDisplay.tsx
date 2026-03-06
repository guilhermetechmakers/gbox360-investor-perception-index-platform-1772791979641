/**
 * ErrorCodeDisplay — Monospaced error reference code with copy-to-clipboard.
 */

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ErrorCodeDisplayProps {
  errorCode: string
  label?: string
  className?: string
}

export function ErrorCodeDisplay({
  errorCode,
  label = "Error reference",
  className,
}: ErrorCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const code = errorCode ?? "UNKNOWN_ERROR"
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Reference code copied", {
        description: "Share this with support for faster diagnostics.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy", {
        description: "Please manually copy the reference code.",
      })
    }
  }, [errorCode])

  const displayCode = errorCode ?? "UNKNOWN_ERROR"

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:justify-center sm:gap-4",
        className
      )}
      role="region"
      aria-label="Error reference code"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <code
          className="font-mono text-base font-semibold tracking-wider text-foreground"
          aria-live="polite"
        >
          {displayCode}
        </code>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="rounded-lg border-secondary/50 hover:bg-secondary/10"
        aria-label="Copy error reference to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-primary" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  )
}
