/**
 * ExportButton — Export CSV/JSON with Loading and Success modals.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileJson, FileSpreadsheet } from "lucide-react"
import { useModals } from "@/components/modals"
import { ipiApi } from "@/api/ipi"

export interface ExportButtonProps {
  companyId: string
  timeWindow: string
  dataEndpoint?: string
  format?: "csv" | "json"
  className?: string
}

export function ExportButton({
  companyId,
  timeWindow,
  className,
}: ExportButtonProps) {
  const modals = useModals()
  const [loading, setLoading] = useState(false)

  const runExport = async (format: "csv" | "json") => {
    if (!companyId) return
    setLoading(true)
    modals.showLoading({
      title: "Exporting…",
      subtitle: `Preparing your ${format.toUpperCase()} export.`,
    })
    try {
      const result = await ipiApi.requestExport(companyId, timeWindow, format)
      modals.hideLoading()
      const exportUrl = (result?.url ?? "").trim()
      const hasDownloadUrl = exportUrl && exportUrl !== "#"
      modals.showSuccess({
        title: "Export complete",
        message: `Your IPI data has been exported as ${format.toUpperCase()} successfully.`,
        primaryAction: hasDownloadUrl
          ? {
              label: "Download",
              onClick: () => {
                window.open(exportUrl, "_blank")
                modals.hideSuccess()
              },
            }
          : {
              label: "Dismiss",
              onClick: modals.hideSuccess,
            },
        secondaryAction: hasDownloadUrl
          ? { label: "Dismiss", onClick: modals.hideSuccess }
          : undefined,
        showViewResults: false,
        resultsHref: undefined,
      })
    } catch (err) {
      modals.hideLoading()
      modals.showError({
        title: "Export failed",
        errorMessage: err instanceof Error ? err.message : "Could not complete export.",
        retryAction: {
          label: "Retry",
          onClick: () => {
            modals.hideError()
            runExport(format)
          },
        },
        supportLink: "/about-help",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Export"
          disabled={loading}
          aria-label="Export data"
          className={className}
        >
          <Download className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl shadow-card">
        <DropdownMenuItem
          onClick={() => runExport("csv")}
          disabled={loading}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => runExport("json")}
          disabled={loading}
          className="gap-2"
        >
          <FileJson className="h-4 w-4" aria-hidden />
          Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
