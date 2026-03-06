import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"

export default function Analytics() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <Card>
          <CardHeader>
            <CardTitle>Reports & analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Usage, ingest reliability, and IPI metrics will appear here.
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
