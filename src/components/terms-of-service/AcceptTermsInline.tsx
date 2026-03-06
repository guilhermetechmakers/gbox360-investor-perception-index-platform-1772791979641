import { Link } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface AcceptTermsInlineProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  error?: string
  className?: string
}

export function AcceptTermsInline({
  checked = false,
  onChange,
  error,
  className,
}: AcceptTermsInlineProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Checkbox
        id="accept-terms-inline"
        checked={checked}
        onCheckedChange={(v) => onChange?.(v === true)}
        aria-describedby="accept-terms-label accept-terms-error"
        aria-invalid={!!error}
        className="mt-0.5 shrink-0"
      />
      <div className="space-y-1">
        <Label
          htmlFor="accept-terms-inline"
          id="accept-terms-label"
          className="text-sm font-normal cursor-pointer leading-tight"
        >
          I agree to the{" "}
          <Link
            to="/terms"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>
        </Label>
        {error && (
          <p
            id="accept-terms-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
