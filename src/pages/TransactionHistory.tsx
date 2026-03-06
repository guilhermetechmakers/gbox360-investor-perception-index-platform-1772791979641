import { useState, useCallback } from "react"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft, FileText } from "lucide-react"
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
      } catch (err) {
        const message = err instanceof Error ? err.message : ""
        if (message.includes("401") || message.includes("403")) {
          toast.error("Please sign in again to download.")
          return
        }
        toast.error("Download failed. Please try again.")
      }
    },
    []
  )

  const handleExport = useCallback(
    async (format: "pdf" | "csv") => {
      const ids = (invoices ?? []).map((i) => i.id)
      if (ids.length === 0) {
        toast.error("No invoices to export")
        return
      }
      try {
        const blob = await invoiceApi.exportView(ids, format, invoices)
        const ext = format === "pdf" ? "pdf" : "csv"
        triggerDownload(blob, `invoices_export.${ext}`)
        toast.success(`Exported ${ids.length} invoice(s) as ${format.toUpperCase()}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : ""
        if (message.includes("401") || message.includes("403")) {
          toast.error("Please sign in again to export.")
          return
        }
        toast.error("Export failed. Please try again.")
      }
    },
    [invoices]
  )

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
    setSelectedInvoice(null)
  }, [])

  const isAuthError =
    error instanceof Error &&
    (error.message.includes("401") || error.message.includes("403"))

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px]">
        {/* Hero / header — premium fintech, serif heading */}
        <section className="rounded-2xl bg-[rgb(var(--hero-bg))] px-6 py-8 shadow-card md:px-8">
          <Button variant="ghost" size="sm" asChild>
            <Link
              to="/dashboard/subscription-management"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              aria-label="Back to subscription management"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to subscription
            </Link>
          </Button>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[rgb(var(--foreground))] md:text-4xl">
            Order & Transaction History
          </h1>
          <p className="mt-2 max-w-[640px] text-base text-muted-foreground leading-relaxed">
            View and download past invoices. Filter by date, status, or search.
          </p>
        </section>

        <div className="mt-8 space-y-6">
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
            <div
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              {isAuthError
                ? "Please sign in again to view invoices."
                : "Failed to load invoices. Please try again."}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2 rounded-xl border border-border bg-card p-6 shadow-card">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center shadow-card">
              <FileText className="h-12 w-12 text-muted-foreground/60" aria-hidden />
              <p className="mt-4 text-muted-foreground">
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
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
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
      </div>
    </AnimatedPage>
  )
}
