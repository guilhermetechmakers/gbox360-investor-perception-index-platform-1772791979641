import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Check, Loader2 } from "lucide-react"

interface TermsAndSubmitProps {
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
  onSubmit: () => void
  isSubmitting?: boolean
  disabled?: boolean
  submitLabel?: string
}

export function TermsAndSubmit({
  termsAccepted,
  onTermsChange,
  onSubmit,
  isSubmitting,
  disabled,
  submitLabel = "Confirm and subscribe",
}: TermsAndSubmitProps) {
  const isDisabled = disabled || !termsAccepted || isSubmitting

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
          disabled={disabled}
          aria-describedby="terms-desc"
        />
        <div className="space-y-1">
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the Terms of Service and Privacy Policy
          </Label>
          <p id="terms-desc" className="text-xs text-muted-foreground">
            By subscribing, you accept our subscription terms and billing practices.
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-lg disabled:hover:scale-100"
        aria-label={submitLabel}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  )
}
