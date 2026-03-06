/**
 * FlagEventButton — Mark event as flagged; optimistic UI update.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface FlagEventButtonProps {
  eventId: string
  initialFlagged?: boolean
  onFlagChange?: (eventId: string, flagged: boolean) => void
  className?: string
}

export function FlagEventButton({
  eventId,
  initialFlagged = false,
  onFlagChange,
  className,
}: FlagEventButtonProps) {
  const [flagged, setFlagged] = useState(initialFlagged)

  const handleClick = () => {
    const next = !flagged
    setFlagged(next)
    onFlagChange?.(eventId, next)
    toast.success(next ? "Event flagged" : "Event unflagged")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      title={flagged ? "Unflag event" : "Flag event"}
      onClick={handleClick}
      aria-label={flagged ? "Unflag this event" : "Flag this event"}
      className={cn(
        flagged && "bg-destructive/10 text-destructive border-destructive/30",
        className
      )}
    >
      <Flag
        className={cn("h-4 w-4", flagged && "fill-current")}
        aria-hidden
      />
    </Button>
  )
}
