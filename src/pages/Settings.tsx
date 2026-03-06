import { AnimatedPage } from "@/components/AnimatedPage"
import { UnifiedSettingsEditor } from "@/components/settings"

export default function Settings() {
  return (
    <AnimatedPage>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your profile, notifications, API keys, data refresh, and team access.
          </p>
        </div>
        <UnifiedSettingsEditor />
      </div>
    </AnimatedPage>
  )
}
