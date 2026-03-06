import type { ReactNode } from "react"
import { useCurrentUser } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

interface DataAccessGuardProps {
  children: ReactNode
  /** Optional: require a specific permission (e.g. "audit_logs"). When not set, only admin role is required. */
  permission?: string
}

/**
 * Guards rendering when user lacks permission to view audit logs (or other admin content).
 * Renders an accessible message if not allowed; otherwise renders children.
 * Used in addition to AdminRouteGuard for page-level permission messaging.
 */
export function DataAccessGuard({ children, permission }: DataAccessGuardProps) {
  const { isAdmin, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="rounded-[1rem] border-red-200 bg-red-50 shadow-card" role="alert">
        <CardHeader>
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-red-700">
            <ShieldAlert className="h-5 w-5" aria-hidden />
            Access denied
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You do not have permission to view this page. Only platform admins and enterprise admins
            can access audit logs. If you believe this is an error, contact your administrator.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (permission && permission !== "audit_logs") {
    return (
      <Card className="rounded-[1rem] border-red-200 bg-red-50 shadow-card" role="alert">
        <CardHeader>
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-red-700">
            <ShieldAlert className="h-5 w-5" aria-hidden />
            Insufficient permissions
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your role does not include access to this resource. Required: {permission}.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
