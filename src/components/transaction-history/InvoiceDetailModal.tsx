import { useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Download } from "lucide-react"
import type { Invoice } from "@/types/invoice"

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency ?? "USD",
  }).format(Number.isFinite(amount) ? amount : 0)
}

interface InvoiceDetailModalProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
  onDownload: (invoice: Invoice, format: "pdf" | "csv") => void
}

export function InvoiceDetailModal({
  invoice,
  open,
  onClose,
  onDownload,
}: InvoiceDetailModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, handleEscape])

  const items = invoice?.items ?? []
  const addr = invoice?.billingAddress
  const subtotal = items.reduce((sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0), 0)
  const total = invoice
    ? (Number.isFinite(invoice.amount) ? invoice.amount : subtotal)
    : 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showClose
      >
        {!invoice ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Invoice {invoice.id}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <dt className="text-muted-foreground">Date</dt>
                <dd>{format(new Date(invoice.date), "MMM d, yyyy")}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{invoice.status}</dd>
                <dt className="text-muted-foreground">Description</dt>
                <dd>{invoice.description ?? "No description"}</dd>
                {invoice.planName && (
                  <>
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd>{invoice.planName}</dd>
                  </>
                )}
                {invoice.paymentMethod && (
                  <>
                    <dt className="text-muted-foreground">Payment method</dt>
                    <dd>{invoice.paymentMethod}</dd>
                  </>
                )}
                {invoice.lastPaymentDate && (
                  <>
                    <dt className="text-muted-foreground">Last payment</dt>
                    <dd>{format(new Date(invoice.lastPaymentDate), "MMM d, yyyy")}</dd>
                  </>
                )}
              </dl>

              {addr && (
            <div>
              <h4 className="mb-2 font-medium">Billing address</h4>
              <address className="not-italic text-sm text-muted-foreground">
                {addr.line1}
                {addr.line2 && <br />}
                {addr.line2}
                {(addr.city ?? addr.state ?? addr.postalCode) && (
                  <>
                    <br />
                    {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ")}
                  </>
                )}
                {addr.country && (
                  <>
                    <br />
                    {addr.country}
                  </>
                )}
              </address>
            </div>
          )}

          {items.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Line items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Unit price</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-2">{item.description ?? "—"}</td>
                      <td className="py-2 text-right">{item.quantity ?? 1}</td>
                      <td className="py-2 text-right">
                        {formatCurrency(item.unitPrice ?? 0, invoice.currency)}
                      </td>
                      <td className="py-2 text-right">
                        {formatCurrency(item.amount ?? 0, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total</span>
                <span>{formatCurrency(total, invoice?.currency ?? "USD")}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => invoice && onDownload(invoice, "pdf")}
                  className="gap-2 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => invoice && onDownload(invoice, "csv")}
                  className="gap-2 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
