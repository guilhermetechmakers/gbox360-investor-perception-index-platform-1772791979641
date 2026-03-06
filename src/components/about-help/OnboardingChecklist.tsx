import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { OnboardingChecklistItem } from "@/types/about-help"

interface OnboardingChecklistProps {
  items: OnboardingChecklistItem[]
  onToggle: (id: string, completed: boolean) => void
  onReset?: () => void
  className?: string
}

export function OnboardingChecklist({
  items,
  onToggle,
  onReset,
  className,
}: OnboardingChecklistProps) {
  const completedCount = (items ?? []).filter((i) => i.completed).length
  const totalCount = (items ?? []).length
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Progress: {completedCount} of {totalCount} completed
        </span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Reset
          </button>
        )}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ul className="space-y-3" role="list">
        {(items ?? []).map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border border-border p-4 transition-colors",
              item.completed && "bg-muted/30"
            )}
          >
            <Checkbox
              id={`checklist-${item.id}`}
              checked={item.completed}
              onCheckedChange={(checked) =>
                onToggle(item.id, checked === true)
              }
              aria-label={`Mark "${item.label}" as ${item.completed ? "incomplete" : "complete"}`}
              className="mt-0.5"
            />
            <label
              htmlFor={`checklist-${item.id}`}
              className={cn(
                "flex-1 cursor-pointer text-sm leading-relaxed",
                item.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
