import { cn } from "@/lib/utils"

export interface VersionBadgeProps {
  version?: string
  lastUpdated?: string | null
  className?: string
}

export function VersionBadge({
  version = "draft",
  lastUpdated = null,
  className,
}: VersionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground",
        className
      )}
      role="status"
      aria-label={`Terms version ${version}, last updated ${lastUpdated ?? "unknown"}`}
    >
      <span>Version {version}</span>
      {lastUpdated && (
        <>
          <span aria-hidden>·</span>
          <span>Last updated: {lastUpdated}</span>
        </>
      )}
    </div>
  )
}
