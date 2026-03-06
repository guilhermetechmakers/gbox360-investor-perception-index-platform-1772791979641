/**
 * React Query hooks for narratives: decay-weighted list, drill-down events, ingest mutation.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { narrativesApi } from "@/api/narratives"
import type { IngestEventPayload } from "@/types/narrative"

export const narrativeKeys = {
  withDecay: (companyId: string, start: string, end: string) =>
    ["narratives", "withDecay", companyId, start, end] as const,
  events: (narrativeId: string, start?: string, end?: string) =>
    ["narratives", "events", narrativeId, start, end] as const,
}

/**
 * Fetch narratives with decay-weighted scores for company and date range.
 */
export function useNarrativesWithDecay(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  return useQuery({
    queryKey: narrativeKeys.withDecay(companyId, start, end),
    queryFn: () => narrativesApi.fetchNarratives(companyId, start, end),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Fetch events for a single narrative (drill-down).
 */
export function useNarrativeEvents(
  narrativeId: string | null,
  start?: string,
  end?: string,
  enabled = true
) {
  return useQuery({
    queryKey: narrativeKeys.events(narrativeId ?? "", start, end),
    queryFn: () =>
      narrativesApi.getNarrativeEvents(narrativeId!, start, end),
    enabled: !!narrativeId && enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Ingest event mutation; invalidates narrative queries on success.
 */
export function useIngestEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IngestEventPayload) => narrativesApi.ingestEvent(payload),
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["narratives"] })
        queryClient.invalidateQueries({ queryKey: ["ipi"] })
        toast.success("Event ingested successfully")
      } else {
        toast.error(data?.error ?? "Ingest failed")
      }
    },
    onError: (error: Error) => toast.error(error?.message ?? "Ingest failed"),
  })
}
