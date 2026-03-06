/**
 * Hooks for resilient data ingestion: status, DLQ, news trigger, earnings batch, replay.
 * All array/response access uses safeArray and default states.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as ingestionApi from "@/api/ingestion"
import { safeArray } from "@/lib/data-guard"
import type {
  EarningsTranscriptsPayload,
  NewsIngestionParams,
  ReplayEventsParams,
} from "@/types/ingestion"

export const ingestionKeys = {
  status: ["ingestion", "status"] as const,
  dlq: (source: string) => ["ingestion", "dlq", source] as const,
  socialTwitter: (params: { companyTicker: string; since?: string; limit?: number }) =>
    ["ingestion", "social", "twitter", params] as const,
}

export function useIngestionStatus() {
  return useQuery({
    queryKey: ingestionKeys.status,
    queryFn: ingestionApi.getIngestionStatus,
    select: (data) => ({
      ...data,
      sources: safeArray(data?.sources),
    }),
    staleTime: 1000 * 60,
  })
}

export function useDlq(source: string | null) {
  return useQuery({
    queryKey: ingestionKeys.dlq(source ?? ""),
    queryFn: () => (source ? ingestionApi.getDlq(source) : Promise.resolve({ items: [], count: 0 })),
    enabled: !!source,
    select: (data) => ({
      items: safeArray(data?.items),
      count: data?.count ?? 0,
    }),
  })
}

export function useRetryDlqItem(source: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => ingestionApi.retryDlqItem(source, key),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.dlq(source) })
      queryClient.invalidateQueries({ queryKey: ingestionKeys.status })
      if (data?.success) {
        toast.success(data.message ?? "Retry enqueued")
      } else {
        toast.error(data?.message ?? "Retry failed")
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Retry failed")
    },
  })
}

export function useTriggerNewsIngestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params?: NewsIngestionParams) => ingestionApi.triggerNewsIngestion(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.status })
      if (data?.status === "ok" || data?.ingestedCount != null) {
        toast.success(`News ingestion: ${data.ingestedCount ?? 0} items ingested`)
      } else if (data?.status !== "error") {
        toast.success("News ingestion triggered")
      } else {
        toast.error("News ingestion failed")
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "News ingestion failed")
    },
  })
}

export function useEarningsTranscriptsIngest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EarningsTranscriptsPayload) =>
      ingestionApi.postEarningsTranscripts(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.status })
      const total = (data?.processedCount ?? 0) + (data?.failedCount ?? 0) + (data?.dlqCount ?? 0)
      if (data?.processedCount != null && data.processedCount > 0) {
        toast.success(
          `Earnings batch: ${data.processedCount} processed${data.failedCount ? `, ${data.failedCount} failed` : ""}${data.dlqCount ? `, ${data.dlqCount} in DLQ` : ""}`
        )
      } else if (total > 0) {
        toast.warning(`Earnings batch: ${data?.failedCount ?? 0} failed, ${data?.dlqCount ?? 0} in DLQ`)
      } else {
        toast.info("Earnings batch submitted")
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Earnings batch failed")
    },
  })
}

export function useReplayEvents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ReplayEventsParams) => ingestionApi.postReplayEvents(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ingestionKeys.status })
      queryClient.invalidateQueries({ queryKey: ["admin", "data-replay"] })
      if (data?.jobId && data?.status !== "failed") {
        toast.success(data.message ?? "Replay job started")
      } else if (data?.message) {
        toast.error(data.message)
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Replay events failed")
    },
  })
}

export function useSocialTwitterRead(
  params: { companyTicker: string; since?: string; limit?: number } | null
) {
  return useQuery({
    queryKey: ingestionKeys.socialTwitter(params ?? { companyTicker: "" }),
    queryFn: () =>
      params?.companyTicker
        ? ingestionApi.getSocialTwitterRead({
            companyTicker: params.companyTicker,
            since: params.since,
            limit: params.limit ?? 50,
          })
        : Promise.resolve({ items: [] }),
    enabled: !!params?.companyTicker,
    select: (data) => ({ items: safeArray(data?.items) }),
  })
}
