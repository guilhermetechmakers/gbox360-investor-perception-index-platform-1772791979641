import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BillingDetails } from "@/types/subscription"
import { cn } from "@/lib/utils"

interface BillingDetailsFormProps {
  details: BillingDetails
  onChange: (details: Partial<BillingDetails>) => void
  errors?: Partial<Record<keyof BillingDetails, string>>
  disabled?: boolean
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
]

export function BillingDetailsForm({
  details,
  onChange,
  errors = {},
  disabled,
}: BillingDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold">Billing details</h3>
      <p className="text-sm text-muted-foreground">
        Billing contact and address for invoices.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Contact name</Label>
          <Input
            id="contact-name"
            placeholder="Jane Smith"
            value={details.contactName ?? ""}
            onChange={(e) => onChange({ contactName: e.target.value })}
            className={cn(errors.contactName && "border-destructive")}
            disabled={disabled}
            aria-invalid={!!errors.contactName}
          />
          {errors.contactName && (
            <p className="text-sm text-destructive">{errors.contactName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-email">Email</Label>
          <Input
            id="billing-email"
            type="email"
            placeholder="billing@company.com"
            value={details.email ?? ""}
            onChange={(e) => onChange({ email: e.target.value })}
            className={cn(errors.email && "border-destructive")}
            disabled={disabled}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-name">Company name</Label>
        <Input
          id="company-name"
          placeholder="Acme Inc."
          value={details.companyName ?? ""}
          onChange={(e) => onChange({ companyName: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-address">Billing address</Label>
        <Input
          id="billing-address"
          placeholder="123 Main St"
          value={details.address ?? ""}
          onChange={(e) => onChange({ address: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="billing-city">City</Label>
          <Input
            id="billing-city"
            placeholder="San Francisco"
            value={details.city ?? ""}
            onChange={(e) => onChange({ city: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-state">State / Province</Label>
          <Input
            id="billing-state"
            placeholder="CA"
            value={details.state ?? ""}
            onChange={(e) => onChange({ state: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-zip">ZIP / Postal code</Label>
          <Input
            id="billing-zip"
            placeholder="94102"
            value={details.zip ?? ""}
            onChange={(e) => onChange({ zip: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-country">Country</Label>
        <Select
          value={details.country ?? ""}
          onValueChange={(v) => onChange({ country: v })}
          disabled={disabled}
        >
          <SelectTrigger id="billing-country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-id">VAT / Tax ID (optional)</Label>
        <Input
          id="tax-id"
          placeholder="GB123456789"
          value={details.taxId ?? ""}
          onChange={(e) => onChange({ taxId: e.target.value })}
          className={cn(errors.taxId && "border-destructive")}
          disabled={disabled}
          aria-invalid={!!errors.taxId}
        />
        {errors.taxId && (
          <p className="text-sm text-destructive">{errors.taxId}</p>
        )}
      </div>
    </div>
  )
}
