import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreditCard } from "lucide-react"
import type { CardFields } from "@/types/subscription"
import { cn } from "@/lib/utils"

interface PaymentFormProps {
  fields: CardFields
  onChange: (fields: Partial<CardFields>) => void
  errors?: Partial<Record<keyof CardFields, string>>
  disabled?: boolean
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return digits
}

export function PaymentForm({
  fields,
  onChange,
  errors = {},
  disabled,
}: PaymentFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Payment details</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Card details are tokenized and never stored. This is a Stripe Elements placeholder.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card-number">Card number</Label>
          <Input
            id="card-number"
            placeholder="4242 4242 4242 4242"
            value={fields.cardNumber}
            onChange={(e) =>
              onChange({ cardNumber: formatCardNumber(e.target.value) })
            }
            className={cn(
              "font-mono",
              errors.cardNumber && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={disabled}
            maxLength={19}
            aria-invalid={!!errors.cardNumber}
            aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
          />
          {errors.cardNumber && (
            <p id="card-number-error" className="text-sm text-destructive">
              {errors.cardNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name-on-card">Name on card</Label>
          <Input
            id="name-on-card"
            placeholder="John Doe"
            value={fields.nameOnCard}
            onChange={(e) => onChange({ nameOnCard: e.target.value })}
            className={cn(errors.nameOnCard && "border-destructive focus-visible:ring-destructive")}
            disabled={disabled}
            aria-invalid={!!errors.nameOnCard}
          />
          {errors.nameOnCard && (
            <p className="text-sm text-destructive">{errors.nameOnCard}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry (MM/YY)</Label>
            <Input
              id="expiry"
              placeholder="12/26"
              value={fields.expiry}
              onChange={(e) => onChange({ expiry: formatExpiry(e.target.value) })}
              className={cn(errors.expiry && "border-destructive focus-visible:ring-destructive")}
              disabled={disabled}
              maxLength={5}
              aria-invalid={!!errors.expiry}
            />
            {errors.expiry && (
              <p className="text-sm text-destructive">{errors.expiry}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              type="password"
              value={fields.cvc}
              onChange={(e) =>
                onChange({ cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              className={cn(errors.cvc && "border-destructive focus-visible:ring-destructive")}
              disabled={disabled}
              maxLength={4}
              aria-invalid={!!errors.cvc}
            />
            {errors.cvc && (
              <p className="text-sm text-destructive">{errors.cvc}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
