import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useUserActivityExport } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"

export interface ActivityCSVDownloaderProps {
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export function ActivityCSVDownloader({
  className,
  variant = "outline",
  size = "sm",
}: ActivityCSVDownloaderProps) {
  const exportMutation = useUserActivityExport()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => exportMutation.mutate()}
      disabled={exportMutation.isPending}
      className={cn("gap-2", className)}
      aria-label="Download activity log as CSV"
    >
      <Download className="h-4 w-4" aria-hidden />
      {exportMutation.isPending ? "Preparing…" : "Download CSV"}
    </Button>
  )
}
