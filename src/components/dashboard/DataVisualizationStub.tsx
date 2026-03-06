import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataVisualizationStubProps {
  className?: string
  title?: string
  description?: string
}

export function DataVisualizationStub({
  className,
  title = "Chart placeholder",
  description = "Data visualization will appear here.",
}: DataVisualizationStubProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
          <span className="text-sm">Chart area</span>
        </div>
      </CardContent>
    </Card>
  )
}
