import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Download } from "lucide-react"

interface ExportBarProps {
  invoices: { id: string }[]
  onExport: (format: "pdf" | "csv") => void
  disabled?: boolean
}

export function ExportBar({
  invoices,
  onExport,
  disabled = false,
}: ExportBarProps) {
  const count = Array.isArray(invoices) ? invoices.length : 0
  const hasInvoices = count > 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || !hasInvoices}
                className="gap-2 transition-all hover:scale-[1.02]"
                aria-label="Export current view"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
              <DropdownMenuItem
                onClick={() => onExport("csv")}
                disabled={!hasInvoices}
                aria-label="Export as CSV"
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("pdf")}
                disabled={!hasInvoices}
                aria-label="Export as PDF"
              >
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Export current view as CSV or PDF
      </TooltipContent>
    </Tooltip>
  )
}
