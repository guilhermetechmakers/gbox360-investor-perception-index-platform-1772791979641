import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromoCodeSectionProps {
  value: string
  onChange: (value: string) => void
  onApply: () => void
  appliedCode?: string | null
  discountMessage?: string | null
  errorMessage?: string | null
  isLoading?: boolean
  disabled?: boolean
}

export function PromoCodeSection({
  value,
  onChange,
  onApply,
  appliedCode,
  discountMessage,
  errorMessage,
  isLoading,
  disabled,
}: PromoCodeSectionProps) {
  const hasApplied = !!appliedCode
  const hasError = !!errorMessage

  return (
    <div className="space-y-2">
      <Label htmlFor="promo-code">Promo code</Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          placeholder="Enter code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || hasApplied}
          className={cn(
            hasApplied && "border-primary bg-primary/5",
            hasError && "border-destructive"
          )}
          aria-invalid={!!hasError}
          aria-describedby={
            discountMessage ? "promo-success" : hasError ? "promo-error" : undefined
          }
        />
        <Button
          type="button"
          variant={hasApplied ? "secondary" : "default"}
          onClick={onApply}
          disabled={disabled || isLoading || !value.trim()}
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={hasApplied ? "Remove promo code" : "Apply promo code"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasApplied ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Applied
            </>
          ) : (
            <>
              <Tag className="mr-1 h-4 w-4" />
              Apply
            </>
          )}
        </Button>
      </div>
      {discountMessage && (
        <p id="promo-success" className="flex items-center gap-1 text-sm text-primary">
          <Check className="h-4 w-4" />
          {discountMessage}
        </p>
      )}
      {hasError && (
        <p id="promo-error" className="flex items-center gap-1 text-sm text-destructive">
          <X className="h-4 w-4" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
