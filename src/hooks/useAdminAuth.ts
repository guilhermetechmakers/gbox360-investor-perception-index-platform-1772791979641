import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"

const ADMIN_ACCESS_KEY = ["admin", "access"] as const

/**
 * Hook to check if the current user has admin access (PLATFORM_ADMIN or ENTERPRISE_ADMIN).
 * Used for RBAC gating on admin routes.
 */
export function useAdminAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ADMIN_ACCESS_KEY,
    queryFn: adminApi.checkAccess,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const isAdmin = data?.allowed === true
  const roles = data?.roles ?? []

  return {
    isAdmin,
    roles,
    isLoading,
    error,
  }
}
