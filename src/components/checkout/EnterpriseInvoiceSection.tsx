import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InvoiceDetails } from "@/types/subscription"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnterpriseInvoiceSectionProps {
  details: InvoiceDetails
  onChange: (details: Partial<InvoiceDetails>) => void
  errors?: Partial<Record<keyof InvoiceDetails, string>>
  disabled?: boolean
}

const PAYMENT_TERMS = [
  { value: "net15", label: "Net 15" },
  { value: "net30", label: "Net 30" },
  { value: "net45", label: "Net 45" },
  { value: "net60", label: "Net 60" },
]

export function EnterpriseInvoiceSection({
  details,
  onChange,
  errors = {},
  disabled,
}: EnterpriseInvoiceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Invoice details</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Required for enterprise invoicing. We will send invoices to this address.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoice-recipient">Invoice recipient name</Label>
          <Input
            id="invoice-recipient"
            placeholder="Accounts Payable"
            value={details.recipientName ?? ""}
            onChange={(e) => onChange({ recipientName: e.target.value })}
            className={cn(errors.recipientName && "border-destructive")}
            disabled={disabled}
            aria-invalid={!!errors.recipientName}
          />
          {errors.recipientName && (
            <p className="text-sm text-destructive">{errors.recipientName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-company">Company name</Label>
          <Input
            id="invoice-company"
            placeholder="Acme Inc."
            value={details.companyName ?? ""}
            onChange={(e) => onChange({ companyName: e.target.value })}
            className={cn(errors.companyName && "border-destructive")}
            disabled={disabled}
            aria-invalid={!!errors.companyName}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">{errors.companyName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice-address">Billing address</Label>
        <Input
          id="invoice-address"
          placeholder="123 Main St, City, State ZIP"
          value={details.billingAddress ?? ""}
          onChange={(e) => onChange({ billingAddress: e.target.value })}
          className={cn(errors.billingAddress && "border-destructive")}
          disabled={disabled}
          aria-invalid={!!errors.billingAddress}
        />
        {errors.billingAddress && (
          <p className="text-sm text-destructive">{errors.billingAddress}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="po-number">PO number (optional)</Label>
          <Input
            id="po-number"
            placeholder="PO-12345"
            value={details.poNumber ?? ""}
            onChange={(e) => onChange({ poNumber: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-terms">Payment terms</Label>
          <Select
            value={details.paymentTerms ?? ""}
            onValueChange={(v) => onChange({ paymentTerms: v })}
            disabled={disabled}
          >
            <SelectTrigger id="payment-terms">
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
