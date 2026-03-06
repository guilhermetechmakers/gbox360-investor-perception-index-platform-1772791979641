import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SaveBarProps {
  visible: boolean
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  isSaving?: boolean
  showDelete?: boolean
  className?: string
}

export function SaveBar({
  visible,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  showDelete = false,
  className,
}: SaveBarProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:px-6",
        className
      )}
      role="toolbar"
      aria-label="Save or cancel changes"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showDelete && onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete account"
          >
            Delete account
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="gap-2"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-primary hover:bg-primary/90"
          aria-label="Save changes"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}
