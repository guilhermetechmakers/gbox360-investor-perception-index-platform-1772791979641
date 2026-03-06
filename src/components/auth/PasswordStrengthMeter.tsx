import { useMemo } from "react"
import { cn } from "@/lib/utils"

export interface PasswordStrength {
  score: number
  label: string
  colorClass: string
  meetsMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
} as const

export function computePasswordStrength(password: string): PasswordStrength {
  const p = password ?? ""
  const meetsMinLength = p.length >= PASSWORD_RULES.minLength
  const hasUppercase = PASSWORD_RULES.uppercase.test(p)
  const hasLowercase = PASSWORD_RULES.lowercase.test(p)
  const hasNumber = PASSWORD_RULES.number.test(p)
  const hasSymbol = PASSWORD_RULES.symbol.test(p)

  const metCount = [meetsMinLength, hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length
  const score = Math.min(5, metCount)

  const configs: Record<number, { label: string; colorClass: string }> = {
    0: { label: "Very weak", colorClass: "bg-red-500" },
    1: { label: "Weak", colorClass: "bg-red-400" },
    2: { label: "Fair", colorClass: "bg-amber-500" },
    3: { label: "Good", colorClass: "bg-primary" },
    4: { label: "Strong", colorClass: "bg-primary" },
    5: { label: "Very strong", colorClass: "bg-primary" },
  }
  const c = configs[score] ?? configs[0]

  return {
    score,
    label: c.label,
    colorClass: c.colorClass,
    meetsMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
  }
}

export interface PasswordStrengthMeterProps {
  password: string
  className?: string
  showRules?: boolean
  id?: string
}

export function PasswordStrengthMeter({ password, className, showRules = true, id }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => computePasswordStrength(password ?? ""), [password])
  const segments = 5
  const filled = strength.score

  return (
    <div id={id} className={cn("space-y-2", className)} role="status" aria-live="polite" aria-label={`Password strength: ${strength.label}`}>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              i < filled ? strength.colorClass : "bg-muted"
            )}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-muted-foreground">
          {strength.label}
        </p>
      )}
      {showRules && password && (
        <ul className="text-xs text-muted-foreground space-y-1" aria-label="Password requirements">
          <li className={cn(strength.meetsMinLength && "text-primary")}>
            {strength.meetsMinLength ? "✓" : "○"} At least 8 characters
          </li>
          <li className={cn(strength.hasUppercase && "text-primary")}>
            {strength.hasUppercase ? "✓" : "○"} One uppercase letter
          </li>
          <li className={cn(strength.hasLowercase && "text-primary")}>
            {strength.hasLowercase ? "✓" : "○"} One lowercase letter
          </li>
          <li className={cn(strength.hasNumber && "text-primary")}>
            {strength.hasNumber ? "✓" : "○"} One number
          </li>
          <li className={cn(strength.hasSymbol && "text-primary")}>
            {strength.hasSymbol ? "✓" : "○"} One symbol (!@#$%^&* etc.)
          </li>
        </ul>
      )}
    </div>
  )
}
