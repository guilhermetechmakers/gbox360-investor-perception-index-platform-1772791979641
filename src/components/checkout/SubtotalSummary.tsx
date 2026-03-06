import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SubtotalSummaryProps {
  subtotal: number
  discount?: number
  taxEstimate?: number
  total: number
  currency?: string
  discountLabel?: string
  className?: string
}

export function SubtotalSummary({
  subtotal,
  discount = 0,
  taxEstimate = 0,
  total,
  currency = "USD",
  discountLabel = "Discount",
  className,
}: SubtotalSummaryProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-primary">
          <span>{discountLabel}</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      {taxEstimate > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (estimate)</span>
          <span>{formatPrice(taxEstimate)}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
