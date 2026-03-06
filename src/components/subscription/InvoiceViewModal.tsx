import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useInvoice } from "@/hooks/useSubscription"
import { format } from "date-fns"
import { Download } from "lucide-react"

interface InvoiceViewModalProps {
  invoiceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceViewModal({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceViewModalProps) {
  const { data, isLoading } = useInvoice(invoiceId)

  if (!invoiceId) return null

  const inv = data?.invoiceDetails
  const pdfUrl = data?.pdfUrl
  const csvUrl = data?.csvUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" showClose>
        <DialogHeader>
          <DialogTitle>Invoice details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : inv ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">
                {inv.currency} {inv.amountDue.toFixed(2)}
              </dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{inv.status}</dd>
              <dt className="text-muted-foreground">Due date</dt>
              <dd>{format(new Date(inv.dueDate), "MMM d, yyyy")}</dd>
              <dt className="text-muted-foreground">Issued</dt>
              <dd>{format(new Date(inv.issuedAt), "MMM d, yyyy")}</dd>
            </dl>
            <div className="flex flex-wrap gap-2 pt-2">
              {pdfUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={pdfUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </a>
                </Button>
              )}
              {csvUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={csvUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Invoice not found.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
