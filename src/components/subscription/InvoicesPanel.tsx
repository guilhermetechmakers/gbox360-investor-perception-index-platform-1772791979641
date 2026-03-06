import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, FileText, ArrowRight } from "lucide-react"
import { useInvoices } from "@/hooks/useSubscription"
import { safeArray } from "@/lib/data-guard"
import { format } from "date-fns"
import { InvoiceViewModal } from "./InvoiceViewModal"
import { useState } from "react"
import type { Invoice } from "@/types/subscription"

export function InvoicesPanel() {
  const { data: invoices = [], isLoading } = useInvoices()
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null)
  const list = safeArray(invoices)

  return (
    <>
      <Card className="card-elevated rounded-[1rem]">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <FileText className="h-5 w-5" />
                Invoices & transactions
              </CardTitle>
              <CardDescription>
                Download PDF or CSV for your records.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/dashboard/subscription-management/invoices"
                className="gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
              No invoices yet. Invoices appear here after your first billing cycle.
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((inv) => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  onView={() => setViewInvoiceId(inv.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <InvoiceViewModal
        invoiceId={viewInvoiceId}
        open={!!viewInvoiceId}
        onOpenChange={(open) => !open && setViewInvoiceId(null)}
      />
    </>
  )
}

function InvoiceRow({
  invoice,
  onView,
}: {
  invoice: Invoice
  onView: () => void
}) {
  const statusColor =
    invoice.status === "paid"
      ? "text-primary"
      : invoice.status === "past_due"
        ? "text-destructive"
        : "text-muted-foreground"
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div>
        <p className="font-medium">
          {invoice.currency} {invoice.amountDue.toFixed(2)} — {format(new Date(invoice.issuedAt), "MMM d, yyyy")}
        </p>
        <p className={`text-sm capitalize ${statusColor}`}>{invoice.status}</p>
      </div>
      <div className="flex items-center gap-2">
        {invoice.pdfUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={invoice.pdfUrl} download aria-label="Download PDF">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
        {invoice.csvUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={invoice.csvUrl} download aria-label="Download CSV">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onView} aria-label="View invoice">
          View
        </Button>
      </div>
    </div>
  )
}
