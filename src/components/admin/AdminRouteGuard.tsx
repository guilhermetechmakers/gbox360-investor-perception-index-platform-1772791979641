import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useCurrentUser } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminRouteGuardProps {
  children: ReactNode
}

/**
 * RBAC guard for admin routes. Only PLATFORM_ADMIN and ENTERPRISE_ADMIN can access.
 * Redirects to login if unauthenticated, to dashboard if authenticated but not admin.
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const location = useLocation()
  const { isAdmin, isLoading } = useCurrentUser()
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("auth_token")

  if (!hasToken) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
