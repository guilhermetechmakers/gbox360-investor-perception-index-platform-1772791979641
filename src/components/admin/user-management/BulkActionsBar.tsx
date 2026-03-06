import { Button } from "@/components/ui/button"
import { UserX, KeyRound, Download } from "lucide-react"

export type BulkAction = "deactivate" | "reset-password" | "export-csv" | "export-json"

interface BulkActionsBarProps {
  selectedCount: number
  /** Unified handler for bulk actions */
  onAction?: (action: BulkAction) => void
  /** Individual handlers (alternative to onAction) */
  onDeactivate?: () => void
  onResetPassword?: () => void
  onExport?: (format: "csv" | "json") => void
  isDeactivating?: boolean
  isResetting?: boolean
  isExporting?: boolean
  isLoading?: boolean
  disabled?: boolean
}

export function BulkActionsBar({
  selectedCount,
  onAction,
  onDeactivate,
  onResetPassword,
  onExport,
  isDeactivating = false,
  isResetting = false,
  isExporting = false,
  isLoading = false,
  disabled = false,
}: BulkActionsBarProps) {
  const loading = disabled || isLoading || isDeactivating || isResetting || isExporting

  const handleDeactivate = () => {
    if (onAction) onAction("deactivate")
    else onDeactivate?.()
  }
  const handleResetPassword = () => {
    if (onAction) onAction("reset-password")
    else onResetPassword?.()
  }
  const handleExportCsv = () => {
    if (onAction) onAction("export-csv")
    else onExport?.("csv")
  }
  const handleExportJson = () => {
    if (onAction) onAction("export-json")
    else onExport?.("json")
  }

  const hasSelection = selectedCount > 0

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
      {hasSelection && (
        <span className="text-sm font-medium">
          {selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeactivate}
          disabled={!hasSelection || loading}
          className="gap-1.5"
        >
          <UserX className="h-4 w-4" />
          {isDeactivating ? "Deactivating…" : "Deactivate"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetPassword}
          disabled={!hasSelection || loading}
          className="gap-1.5"
        >
          <KeyRound className="h-4 w-4" />
          {isResetting ? "Sending…" : "Reset password"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={loading}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          disabled={loading}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
      </div>
    </div>
  )
}
