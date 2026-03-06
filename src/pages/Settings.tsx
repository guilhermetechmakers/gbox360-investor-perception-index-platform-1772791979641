import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"

export default function Settings() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile & preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Profile edit, notifications, API keys, and team invites will appear here.
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
