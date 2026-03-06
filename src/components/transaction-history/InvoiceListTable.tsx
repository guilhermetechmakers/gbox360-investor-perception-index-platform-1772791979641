import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Download, FileText, ChevronUp, ChevronDown } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/types/invoice"

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency ?? "USD",
  }).format(Number.isFinite(amount) ? amount : 0)
}

function getStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "paid":
      return "Paid"
    case "unpaid":
      return "Unpaid"
    case "past_due":
      return "Past Due"
    case "refunded":
      return "Refunded"
    case "canceled":
      return "Canceled"
    default:
      return String(status ?? "")
  }
}

function getStatusVariant(status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default"
    case "unpaid":
    case "past_due":
      return "destructive"
    case "refunded":
    case "canceled":
      return "secondary"
    default:
      return "outline"
  }
}

interface InvoiceListTableProps {
  invoices: Invoice[]
  onView: (invoice: Invoice) => void
  onDownload: (invoice: Invoice, format: "pdf" | "csv") => void
}

type SortKey = "date" | "amount" | "status"
type SortDir = "asc" | "desc"

export function InvoiceListTable({
  invoices,
  onView,
  onDownload,
}: InvoiceListTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const list = Array.isArray(invoices) ? invoices : []

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...list].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case "date":
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "amount":
        cmp = (a.amount ?? 0) - (b.amount ?? 0)
        break
      case "status":
        cmp = (a.status ?? "").localeCompare(b.status ?? "")
        break
      default:
        break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" aria-hidden />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" aria-hidden />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card">
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[720px] text-sm"
          role="table"
          aria-label="Invoice and transaction history"
        >
          <thead>
            <tr className="sticky top-0 z-10 border-b border-border bg-muted/50">
              <th
                className="cursor-pointer px-4 py-3 text-left font-medium"
                onClick={() => handleSort("date")}
                scope="col"
                aria-sort={sortKey === "date" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                <span className="flex items-center">
                  Date
                  <SortIcon column="date" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-medium" scope="col">
                Invoice ID
              </th>
              <th className="px-4 py-3 text-left font-medium" scope="col">
                Description
              </th>
              <th className="px-4 py-3 text-left font-medium" scope="col">
                Plan
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-medium"
                onClick={() => handleSort("amount")}
                scope="col"
                aria-sort={sortKey === "amount" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                <span className="flex items-center">
                  Amount
                  <SortIcon column="amount" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-medium" scope="col">
                Currency
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-medium"
                onClick={() => handleSort("status")}
                scope="col"
                aria-sort={sortKey === "status" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                <span className="flex items-center">
                  Status
                  <SortIcon column="status" />
                </span>
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-border transition-colors hover:bg-muted/30 last:border-b-0"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onView(inv)
                  }
                }}
                onClick={() => onView(inv)}
                role="button"
                aria-label={`View invoice ${inv.id}`}
              >
                <td className="px-4 py-3">
                  {format(new Date(inv.date), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                <td className="px-4 py-3">
                  {inv.description ?? "No description"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {inv.planName ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(inv.amount ?? 0, inv.currency ?? "USD")}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {inv.currency ?? "USD"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(inv.status)}>
                    {getStatusLabel(inv.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(inv)}
                      aria-label="View invoice details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownload(inv, "pdf")}
                      aria-label="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownload(inv, "csv")}
                      aria-label="Download CSV"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
