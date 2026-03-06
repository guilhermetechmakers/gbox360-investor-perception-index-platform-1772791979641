import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfilePanel } from "./UserProfilePanel"
import { NotificationsPanel } from "./NotificationsPanel"
import { ApiKeysPanel } from "./ApiKeysPanel"
import { DataRefreshPanel } from "./DataRefreshPanel"
import { TeamManagementPanel } from "./TeamManagementPanel"
import { SecuritySessionsPanel } from "./SecuritySessionsPanel"
import { AuditAndPayloadPanel } from "./AuditAndPayloadPanel"
import { useCurrentUser } from "@/hooks/useAuth"
import { User, Bell, Key, RefreshCw, Users, Shield, FileText } from "lucide-react"

export function UnifiedSettingsEditor() {
  const { isAdmin } = useCurrentUser()

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 flex h-auto flex-wrap gap-2 bg-muted/50 p-2">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="gap-2">
          <Key className="h-4 w-4" />
          API Keys
        </TabsTrigger>
        <TabsTrigger value="data-refresh" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Data Refresh
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        )}
        <TabsTrigger value="sessions" className="gap-2">
          <Shield className="h-4 w-4" />
          Sessions
        </TabsTrigger>
        <TabsTrigger value="audit" className="gap-2">
          <FileText className="h-4 w-4" />
          Audit
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <UserProfilePanel />
      </TabsContent>
      <TabsContent value="notifications" className="mt-0">
        <NotificationsPanel />
      </TabsContent>
      <TabsContent value="api-keys" className="mt-0">
        <ApiKeysPanel />
      </TabsContent>
      <TabsContent value="data-refresh" className="mt-0">
        <DataRefreshPanel />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="team" className="mt-0">
          <TeamManagementPanel />
        </TabsContent>
      )}
      <TabsContent value="sessions" className="mt-0">
        <SecuritySessionsPanel />
      </TabsContent>
      <TabsContent value="audit" className="mt-0">
        <AuditAndPayloadPanel />
      </TabsContent>
    </Tabs>
  )
}
