import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useCurrentUser } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Auth guard for protected routes. Redirects unauthenticated users to login.
 * Preserves intended destination in location state for post-login redirect.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, isLoading } = useCurrentUser()
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("auth_token")

  if (!hasToken) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 bg-[rgb(var(--page-bg))]">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-32 w-full max-w-md rounded-xl" />
        <Skeleton className="h-32 w-full max-w-md rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}
