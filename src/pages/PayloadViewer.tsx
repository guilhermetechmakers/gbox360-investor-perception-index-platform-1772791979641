import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Download } from "lucide-react"

export default function PayloadViewer() {
  const { eventId } = useParams<{ eventId: string }>()

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Raw payload viewer</h1>
        <Card>
          <CardHeader>
            <CardTitle>Event: {eventId ?? "—"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Archived raw payload JSON, checksum, and S3 metadata. For audit and troubleshooting.
            </p>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
              {eventId
                ? JSON.stringify(
                    {
                      event_id: eventId,
                      message: "Raw payload would load from API (e.g. GET /payload/:id).",
                      checksum: "...",
                      s3_key: "...",
                    },
                    null,
                    2
                  )
                : "No event ID."}
            </pre>
            <Button variant="outline" className="mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
