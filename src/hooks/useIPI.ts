import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ipiApi } from "@/api/ipi"
import { toast } from "sonner"
import type { IPISimulateInput } from "@/types/ipi"

export const ipiKeys = {
  current: (companyId: string, window: string) =>
    ["ipi", "current", companyId, window] as const,
  timeseries: (companyId: string, window: string) =>
    ["ipi", "timeseries", companyId, window] as const,
  narratives: (companyId: string, window: string, top?: number) =>
    ["ipi", "narratives", companyId, window, top] as const,
  events: (companyId: string, window: string) =>
    ["ipi", "events", companyId, window] as const,
}

export function useIPICurrent(companyId: string, window: string = "1W") {
  return useQuery({
    queryKey: ipiKeys.current(companyId, window),
    queryFn: () => ipiApi.getCurrent(companyId, window),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useIPITimeseries(companyId: string, window: string = "1W") {
  return useQuery({
    queryKey: ipiKeys.timeseries(companyId, window),
    queryFn: () => ipiApi.getTimeseries(companyId, window),
    enabled: !!companyId,
  })
}

export function useTopNarratives(
  companyId: string,
  window: string = "1W",
  topN: number = 3
) {
  return useQuery({
    queryKey: ipiKeys.narratives(companyId, window, topN),
    queryFn: () => ipiApi.getTopNarratives(companyId, window, topN),
    enabled: !!companyId,
  })
}

export function useIPIEvents(companyId: string, window: string = "1W") {
  return useQuery({
    queryKey: ipiKeys.events(companyId, window),
    queryFn: () => ipiApi.getEvents(companyId, window),
    enabled: !!companyId,
  })
}

export function useIPISimulate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: IPISimulateInput) => ipiApi.simulate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipi"] })
      toast.success("Simulation complete")
    },
    onError: (error: Error) => toast.error(error.message ?? "Simulation failed"),
  })
}
