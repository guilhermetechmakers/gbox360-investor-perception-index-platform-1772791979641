import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ipiApi } from "@/api/ipi"
import { toast } from "sonner"
import type { IPISimulateInput, IPICalculateInput, IPISandboxInput } from "@/types/ipi"

export const ipiKeys = {
  current: (companyId: string, window: string) =>
    ["ipi", "current", companyId, window] as const,
  timeseries: (companyId: string, window: string) =>
    ["ipi", "timeseries", companyId, window] as const,
  narratives: (companyId: string, window: string, top?: number) =>
    ["ipi", "narratives", companyId, window, top] as const,
  events: (companyId: string, window: string) =>
    ["ipi", "events", companyId, window] as const,
  calculate: (companyId: string, start: string, end: string) =>
    ["ipi", "calculate", companyId, start, end] as const,
} as const

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

export function useIPICalculate() {
  return useMutation({
    mutationFn: (input: IPICalculateInput) => ipiApi.calculate(input),
  })
}

export function useIPICalculateQuery(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  return useQuery({
    queryKey: ipiKeys.calculate(companyId, start, end),
    queryFn: () =>
      ipiApi.calculate({
        companyId,
        timeWindowStart: `${start}T00:00:00.000Z`,
        timeWindowEnd: `${end}T23:59:59.999Z`,
      }),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export function useIPISandbox() {
  return useMutation({
    mutationFn: (input: IPISandboxInput) => ipiApi.sandbox(input),
  })
}

export const narrativesKeys = {
  byRange: (companyId: string, start: string, end: string) =>
    ["narratives", "range", companyId, start, end] as const,
  byId: (id: string) => ["narratives", "id", id] as const,
}

/** Fetch narratives for company and date range (GET /narratives?companyId=&start=&end=). */
export function useNarrativesByRange(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  return useQuery({
    queryKey: narrativesKeys.byRange(companyId, start, end),
    queryFn: () => ipiApi.getNarratives(companyId, start, end),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/** Fetch single narrative by id (GET /narratives/:id). */
export function useNarrativeById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: narrativesKeys.byId(id ?? ""),
    queryFn: () => ipiApi.getNarrativeById(id!),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/** Fetch narratives with decay-weighted scores (GET /narratives?companyId=&start=&end=). */
export function useNarrativesWithDecay(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["narratives", "decay", companyId, start, end] as const,
    queryFn: () => ipiApi.getNarrativesWithDecay(companyId, start, end),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/** Fetch events for a narrative (GET /narratives/:id/events). */
export function useNarrativeEvents(
  narrativeId: string | null,
  start: string,
  end: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["narratives", "events", narrativeId ?? "", start, end] as const,
    queryFn: () => ipiApi.getNarrativeEvents(narrativeId!, start, end),
    enabled: !!narrativeId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
}
