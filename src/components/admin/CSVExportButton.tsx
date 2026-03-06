import { Button } from "@/components/ui/button"
import { FileDown, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuditLogExportParams } from "@/types/admin"

export type ExportStatus = "idle" | "in_progress" | "complete" | "failed"

interface CSVExportButtonProps {
  onExport: (params: AuditLogExportParams) => void
  status: ExportStatus
  params: AuditLogExportParams
  disabled?: boolean
  className?: string
}

export function CSVExportButton({
  onExport,
  status,
  params,
  disabled = false,
  className,
}: CSVExportButtonProps) {
  const isBusy = status === "in_progress"

  const label =
    status === "in_progress"
      ? "Exporting…"
      : status === "complete"
        ? "Exported"
        : status === "failed"
          ? "Export failed"
          : "Export CSV"

  return (
    <Button
      variant="default"
      size="sm"
      className={cn("gap-2", className)}
      onClick={() => onExport(params)}
      disabled={disabled || isBusy}
      aria-busy={isBusy}
      aria-label={isBusy ? "Export in progress" : "Export audit logs to CSV"}
    >
      {status === "in_progress" ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : status === "complete" ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
      ) : status === "failed" ? (
        <XCircle className="h-4 w-4 text-red-600" aria-hidden />
      ) : (
        <FileDown className="h-4 w-4" aria-hidden />
      )}
      {label}
    </Button>
  )
}
