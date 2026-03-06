import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface InlineErrorBoxProps {
  message: string
  className?: string
}

export function InlineErrorBox({ message, className }: InlineErrorBoxProps) {
  if (!message?.trim()) return null
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      <span>{message}</span>
    </div>
  )
}
