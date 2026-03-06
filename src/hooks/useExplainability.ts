/**
 * React Query hooks for Drill-down Explainability API.
 * All hooks guard against null/undefined; use data ?? [] and Array.isArray in consumers.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { explainabilityApi } from "@/api/explainability"
import type { ExperimentRequest } from "@/types/explainability"

export const explainabilityKeys = {
  topNarratives: (companyId: string, start: string, end: string, limit?: number) =>
    ["explainability", "top-narratives", companyId, start, end, limit] as const,
  events: (narrativeId: string, limit?: number) =>
    ["explainability", "events", narrativeId, limit] as const,
  authorityBreakdown: (companyId: string, start: string, end: string) =>
    ["explainability", "authority-breakdown", companyId, start, end] as const,
  credibilityProxy: (companyId: string, start: string, end: string) =>
    ["explainability", "credibility-proxy", companyId, start, end] as const,
  payloadSearch: (query: string, companyId?: string) =>
    ["explainability", "payload-search", query, companyId] as const,
  auditLogs: (params: { companyId?: string; userId?: string; start?: string; end?: string }) =>
    ["explainability", "audit-logs", params] as const,
}

export function useExplainabilityTopNarratives(
  companyId: string,
  start: string,
  end: string,
  limit?: number,
  enabled = true
) {
  const query = useQuery({
    queryKey: explainabilityKeys.topNarratives(companyId, start, end, limit),
    queryFn: () =>
      explainabilityApi.getTopNarratives({ companyId, start, end, limit }),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
  const narratives = Array.isArray(query.data?.narratives)
    ? query.data.narratives
    : []
  const total = typeof query.data?.total === "number" ? query.data.total : 0
  return { ...query, narratives, total }
}

export function useExplainabilityEvents(
  narrativeId: string | null,
  limit?: number,
  enabled = true
) {
  const query = useQuery({
    queryKey: explainabilityKeys.events(narrativeId ?? "", limit),
    queryFn: () =>
      explainabilityApi.getEvents({ narrativeId: narrativeId!, limit }),
    enabled: !!narrativeId && enabled,
    staleTime: 1000 * 60 * 2,
  })
  const events = Array.isArray(query.data?.events) ? query.data.events : []
  return { ...query, events }
}

export function useAuthorityBreakdown(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: explainabilityKeys.authorityBreakdown(companyId, start, end),
    queryFn: () =>
      explainabilityApi.getAuthorityBreakdown({ companyId, start, end }),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
  const sources = Array.isArray(query.data?.sources) ? query.data.sources : []
  return { ...query, sources }
}

export function useCredibilityProxy(
  companyId: string,
  start: string,
  end: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: explainabilityKeys.credibilityProxy(companyId, start, end),
    queryFn: () =>
      explainabilityApi.getCredibilityProxy({ companyId, start, end }),
    enabled: !!companyId && !!start && !!end && enabled,
    staleTime: 1000 * 60 * 2,
  })
  const proxies = Array.isArray(query.data?.proxies) ? query.data.proxies : []
  return { ...query, proxies }
}

export function useExperimentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ExperimentRequest) =>
      explainabilityApi.postExperiment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explainability"] })
      queryClient.invalidateQueries({ queryKey: ["ipi"] })
      toast.success("Experiment result updated")
    },
    onError: (err: Error) =>
      toast.error(err?.message ?? "Experiment failed"),
  })
}

export function usePayloadSearch(
  query: string,
  companyId?: string,
  enabled = false
) {
  const q = useQuery({
    queryKey: explainabilityKeys.payloadSearch(query, companyId),
    queryFn: () =>
      explainabilityApi.getPayloadSearch({ query, companyId }),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60,
  })
  const payloads = Array.isArray(q.data?.payloads) ? q.data.payloads : []
  return { ...q, payloads }
}

export function useAuditLogs(params: {
  companyId?: string
  userId?: string
  start?: string
  end?: string
}) {
  const query = useQuery({
    queryKey: explainabilityKeys.auditLogs(params),
    queryFn: () => explainabilityApi.getAuditLogs(params),
    staleTime: 1000 * 60 * 2,
  })
  const logs = Array.isArray(query.data) ? query.data : []
  return { ...query, logs }
}

export function useAuditNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { eventId: string; note: string; userId: string }) =>
      explainabilityApi.postAuditNote(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explainability", "audit-logs"] })
      toast.success("Note saved")
    },
    onError: (err: Error) => toast.error(err?.message ?? "Failed to save note"),
  })
}

export function usePayloadFlagMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      eventId: string
      flag: string
      userId: string
      reason?: string
    }) => explainabilityApi.postPayloadFlag(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explainability"] })
      toast.success("Flag recorded")
    },
    onError: (err: Error) => toast.error(err?.message ?? "Failed to flag"),
  })
}

/** Fetch presigned URL for payload download (one-off, not cached long). */
export async function fetchPayloadDownloadUrl(payloadId: string): Promise<string | null> {
  const { url } = await explainabilityApi.getPayloadDownload(payloadId)
  return url ?? null
}
