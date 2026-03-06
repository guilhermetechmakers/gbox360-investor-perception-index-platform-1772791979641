import { useState, useCallback } from "react"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import {
  FiltersBar,
  ExportBar,
  InvoiceListTable,
  InvoiceDetailModal,
} from "@/components/transaction-history"
import { useDebounce } from "@/hooks/useDebounce"
import { useTransactionHistory } from "@/hooks/useTransactionHistory"
import { invoiceApi } from "@/api/invoice"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Invoice, FilterState } from "@/types/invoice"

const DEFAULT_FILTER: FilterState = {
  query: "",
  startDate: null,
  endDate: null,
  status: [],
}

const PAGE_SIZE = 10

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function TransactionHistory() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [page, setPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const debouncedQuery = useDebounce(filter.query, 250)

  const { data, isLoading, error } = useTransactionHistory({
    query: debouncedQuery,
    startDate: filter.startDate,
    endDate: filter.endDate,
    status: filter.status.length > 0 ? filter.status : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const invoices = Array.isArray(data?.data) ? data.data : []
  const total = Number.isFinite(data?.total) ? (data?.total ?? 0) : 0
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  const handleFilterChange = useCallback((next: FilterState) => {
    setFilter(next)
    setPage(1)
  }, [])

  const handleView = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowDetailModal(true)
  }, [])

  const handleDownload = useCallback(
    async (invoice: Invoice, format: "pdf" | "csv") => {
      try {
        const blob = await invoiceApi.downloadInvoice(invoice.id, format)
        const ext = format === "pdf" ? "pdf" : "csv"
        triggerDownload(blob, `invoice_${invoice.id}.${ext}`)
        toast.success(`Downloaded ${format.toUpperCase()}`)
      } catch {
        toast.error("Download failed. Please try again.")
      }
    },
    []
  )

  const handleExport = useCallback(
    async (format: "pdf" | "csv") => {
      const ids = invoices.map((i) => i.id)
      if (ids.length === 0) {
        toast.error("No invoices to export")
        return
      }
      try {
        const blob = await invoiceApi.exportView(ids, format, invoices)
        const ext = format === "pdf" ? "pdf" : "csv"
        triggerDownload(blob, `invoices_export.${ext}`)
        toast.success(`Exported ${ids.length} invoice(s) as ${format.toUpperCase()}`)
      } catch {
        toast.error("Export failed. Please try again.")
      }
    },
    [invoices]
  )

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
    setSelectedInvoice(null)
  }, [])

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-8">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link
              to="/dashboard/subscription-management"
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to subscription
            </Link>
          </Button>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Order & Transaction History
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and download past invoices. Filter by date, status, or search.
          </p>
        </div>

        <FiltersBar
          filter={filter}
          onFilterChange={handleFilterChange}
          actions={
            <ExportBar
              invoices={invoices}
              onExport={handleExport}
              disabled={isLoading}
            />
          }
        />

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load invoices. Please try again.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <p className="text-muted-foreground">
              No invoices found. Try adjusting your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilter(DEFAULT_FILTER)
                setPage(1)
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <InvoiceListTable
              invoices={invoices}
              onView={handleView}
              onDownload={handleDownload}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <InvoiceDetailModal
          invoice={selectedInvoice}
          open={showDetailModal}
          onClose={handleCloseModal}
          onDownload={handleDownload}
        />
      </div>
    </AnimatedPage>
  )
}
