import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type { OnboardingStep, ChecklistItem } from "@/types/about-help"
import { cn } from "@/lib/utils"

interface OnboardingWalkthroughProps {
  steps: OnboardingStep[] | null | undefined
  checklist: ChecklistItem[] | null | undefined
  onChecklistChange?: (checklist: ChecklistItem[]) => void
  className?: string
}

export function OnboardingWalkthrough({
  steps,
  checklist,
  onChecklistChange,
  className,
}: OnboardingWalkthroughProps) {
  const safeSteps = Array.isArray(steps) ? steps : []
  const sortedSteps = [...safeSteps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(() => {
    const initial = Array.isArray(checklist) ? checklist : []
    if (initial.length > 0) return initial
    return (Array.isArray(steps) ? steps : []).map((s) => ({
      id: s.id,
      label: s.title,
      completed: false,
    }))
  })

  useEffect(() => {
    if (sortedSteps.length > 0 && localChecklist.length === 0) {
      setLocalChecklist(
        sortedSteps.map((s) => ({
          id: s.id,
          label: s.title,
          completed: false,
        }))
      )
    }
  }, [sortedSteps, localChecklist.length])

  const completedCount = (localChecklist ?? []).filter((c) => c.completed).length
  const totalCount = localChecklist.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleToggle = useCallback(
    (id: string) => {
      setLocalChecklist((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
        onChecklistChange?.(next)
        return next
      })
    },
    [onChecklistChange]
  )

  const handleReset = useCallback(() => {
    const reset = sortedSteps.map((s) => ({
      id: s.id,
      label: s.title,
      completed: false,
    }))
    setLocalChecklist(reset)
    onChecklistChange?.(reset)
  }, [sortedSteps, onChecklistChange])

  if (sortedSteps.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-[1rem] border border-border bg-card shadow-card",
          className
        )}
      >
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            Onboarding Walkthrough
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No onboarding steps available. Contact support for assistance.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-display text-2xl font-semibold text-foreground">
          Onboarding Walkthrough
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-2 text-muted-foreground hover:text-foreground"
          aria-label="Reset checklist"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {completedCount} of {totalCount} complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          {(sortedSteps ?? []).map((step, index) => {
            const checklistItem = (localChecklist ?? []).find(
              (c) => c.id === step.id
            )
            const isCompleted = checklistItem?.completed ?? false

            return (
              <div
                key={step.id}
                className={cn(
                  "flex gap-4 rounded-lg border border-border p-4 transition-colors",
                  isCompleted && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex shrink-0 items-start pt-0.5">
                  <Checkbox
                    id={`check-${step.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => handleToggle(step.id)}
                    aria-label={`Mark "${step.title}" as ${isCompleted ? "incomplete" : "complete"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`check-${step.id}`}
                    className="cursor-pointer font-medium text-foreground"
                  >
                    {index + 1}. {step.title}
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
