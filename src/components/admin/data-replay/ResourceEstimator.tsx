import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, HardDrive, Network } from "lucide-react"
import type { ResourceEstimate } from "@/types/admin"
import { cn } from "@/lib/utils"

interface ResourceEstimatorProps {
  resources?: ResourceEstimate | null
  className?: string
}

const defaultResources: ResourceEstimate = {
  cpuCores: 0,
  memoryMB: 0,
  networkIoMB: 0,
}

export function ResourceEstimator({ resources, className }: ResourceEstimatorProps) {
  const r = resources ?? defaultResources
  const cpu = r.cpuCores ?? 0
  const mem = r.memoryMB ?? 0
  const net = r.networkIoMB ?? 0

  return (
    <Card className={cn("rounded-[1rem] border border-border bg-card shadow-card", className)}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Resource estimates</CardTitle>
        <CardDescription>
          Estimated CPU, memory, and network I/O for the replay window
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPU</p>
              <p className="font-semibold">{cpu} cores</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <HardDrive className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="font-semibold">{mem} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Network className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network I/O</p>
              <p className="font-semibold">{net} MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
