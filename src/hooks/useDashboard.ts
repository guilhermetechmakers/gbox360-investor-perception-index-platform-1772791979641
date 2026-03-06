import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/api/dashboard"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: dashboardApi.getDashboard,
    staleTime: 1000 * 60 * 2,
  })
}
