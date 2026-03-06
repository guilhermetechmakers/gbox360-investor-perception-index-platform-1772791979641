/**
 * useEntitlementsCheck — React Query hook to enforce plan-based access.
 * Use before allowing actions (e.g. export, advanced features).
 */

import { useQuery } from "@tanstack/react-query"
import { billingApi } from "@/api/billing"
import type { EntitlementCheckResult } from "@/api/billing"

export const entitlementKeys = {
  all: ["entitlements"] as const,
  check: (action: string, resource: string) =>
    [...entitlementKeys.all, "check", action, resource] as const,
}

export function useEntitlementsCheck(
  action: string,
  resource: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false && Boolean(action && resource)

  return useQuery({
    queryKey: entitlementKeys.check(action, resource),
    queryFn: () => billingApi.checkEntitlements(action, resource),
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/** Helper: use result to gate UI or API calls */
export function useCanPerform(
  action: string,
  resource: string
): { allowed: boolean; isLoading: boolean; result: EntitlementCheckResult | undefined } {
  const { data, isLoading } = useEntitlementsCheck(action, resource)
  return {
    allowed: data?.allowed ?? false,
    isLoading,
    result: data,
  }
}
