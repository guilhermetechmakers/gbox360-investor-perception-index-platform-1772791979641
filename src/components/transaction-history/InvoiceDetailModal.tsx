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
import { Download, Copy, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { BillingMetadataPanel } from "@/components/transaction-history/BillingMetadataPanel"
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
  const subtotal = items.reduce(
    (sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0),
    0
  )
  const total = invoice
    ? (Number.isFinite(invoice.amount) ? invoice.amount : subtotal)
    : 0
  const currency = invoice?.currency ?? "USD"

  const handleCopyId = useCallback(() => {
    if (!invoice?.id) return
    navigator.clipboard.writeText(invoice.id).then(
      () => toast.success("Invoice ID copied"),
      () => toast.error("Copy failed")
    )
  }, [invoice?.id])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        showClose
        aria-describedby={invoice ? "invoice-detail-description" : undefined}
      >
        {!invoice ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Invoice details
              </DialogTitle>
            </DialogHeader>

            <div id="invoice-detail-description" className="space-y-6">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <dt className="text-muted-foreground">Invoice ID</dt>
                <dd className="flex items-center gap-2">
                  <span className="font-mono text-xs">{invoice.id}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopyId}
                    aria-label="Copy invoice ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </dd>
                <dt className="text-muted-foreground">Date</dt>
                <dd>{format(new Date(invoice.date), "MMM d, yyyy")}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{invoice.status?.replace("_", " ") ?? "—"}</dd>
                <dt className="text-muted-foreground">Description</dt>
                <dd>{invoice.description ?? "No description"}</dd>
                {invoice.planName != null && invoice.planName !== "" && (
                  <>
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd>{invoice.planName}</dd>
                  </>
                )}
                {invoice.paymentMethod != null && invoice.paymentMethod !== "" && (
                  <>
                    <dt className="text-muted-foreground">Payment method</dt>
                    <dd>{invoice.paymentMethod}</dd>
                  </>
                )}
                {invoice.lastPaymentDate != null && invoice.lastPaymentDate !== "" && (
                  <>
                    <dt className="text-muted-foreground">Last payment</dt>
                    <dd>{format(new Date(invoice.lastPaymentDate), "MMM d, yyyy")}</dd>
                  </>
                )}
              </dl>

              {addr != null && (
                <div>
                  <h4 className="mb-2 font-medium">Billing address</h4>
                  <address className="not-italic text-sm text-muted-foreground">
                    {addr.line1}
                    {addr.line2 != null && addr.line2 !== "" && <br />}
                    {addr.line2}
                    {(addr.city ?? addr.state ?? addr.postalCode) && (
                      <>
                        <br />
                        {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ")}
                      </>
                    )}
                    {addr.country != null && addr.country !== "" && (
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
                            {formatCurrency(item.unitPrice ?? 0, currency)}
                          </td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount ?? 0, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                {items.length > 0 && Number.isFinite(subtotal) && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>

              <BillingMetadataPanel invoice={invoice} />

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(invoice, "pdf")}
                  className="gap-2 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(invoice, "csv")}
                  className="gap-2 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Link to="/admin/audit-logs" className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    aria-label="View audit trail"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View audit trail
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
