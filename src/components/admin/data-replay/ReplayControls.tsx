import { Button } from "@/components/ui/button"
import { Play, Pause, Square, TestTube } from "lucide-react"

interface ReplayControlsProps {
  onDryRun: () => void
  onExecute: () => void
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  isDryRunPending?: boolean
  isExecutePending?: boolean
  isPaused?: boolean
  isRunning?: boolean
  disabled?: boolean
}

export function ReplayControls({
  onDryRun,
  onExecute,
  onPause,
  onResume,
  onCancel,
  isDryRunPending = false,
  isExecutePending = false,
  isPaused = false,
  isRunning = false,
  disabled = false,
}: ReplayControlsProps) {
  const canDryRun = !disabled && !isRunning && !isExecutePending
  const canExecute = !disabled && !isRunning && !isDryRunPending
  const showPauseResume = isRunning && (onPause || onResume)
  const showCancel = isRunning && onCancel

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        onClick={onDryRun}
        disabled={!canDryRun}
        className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Run dry-run simulation"
      >
        <TestTube className="h-4 w-4" aria-hidden />
        {isDryRunPending ? "Simulating…" : "Dry-Run"}
      </Button>
      <Button
        onClick={onExecute}
        disabled={!canExecute}
        className="gap-2 bg-primary text-primary-foreground transition-transform hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Execute replay"
      >
        <Play className="h-4 w-4" aria-hidden />
        {isExecutePending ? "Starting…" : "Execute"}
      </Button>
      {showPauseResume && (
        <Button
          variant="outline"
          size="sm"
          onClick={isPaused ? onResume : onPause}
          className="gap-2 transition-transform hover:scale-[1.02] hover:shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isPaused ? "Resume replay" : "Pause replay"}
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4" aria-hidden />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" aria-hidden />
              Pause
            </>
          )}
        </Button>
      )}
      {showCancel && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          className="gap-2 transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Cancel replay"
        >
          <Square className="h-4 w-4" aria-hidden />
          Cancel
        </Button>
      )}
    </div>
  )
}
