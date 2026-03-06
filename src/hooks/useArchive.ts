/**
 * Hooks for Raw Payload Archival & Replay.
 * All array/response access uses safeArray and Array.isArray guards.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as archiveApi from "@/api/archive"
import { safeArray } from "@/lib/data-guard"
import type { ArchiveAuditParams } from "@/types/archive"

export const archiveKeys = {
  auditLogs: (params: ArchiveAuditParams) => ["archive", "audit-logs", params] as const,
  drilldown: (eventId: string) => ["archive", "drilldown", eventId] as const,
  replayJob: (jobId: string) => ["archive", "replay-job", jobId] as const,
}

export function useArchiveAuditLogs(params: ArchiveAuditParams) {
  return useQuery({
    queryKey: archiveKeys.auditLogs(params),
    queryFn: () => archiveApi.getArchiveAuditLogs(params),
    select: (data) => ({
      ...data,
      items: safeArray(data?.items ?? data?.data),
    }),
  })
}

export function useDrilldown(eventId: string | null) {
  return useQuery({
    queryKey: archiveKeys.drilldown(eventId ?? ""),
    queryFn: () => (eventId ? archiveApi.getDrilldown(eventId) : Promise.resolve(null)),
    enabled: !!eventId,
  })
}

export function usePresignedUrl() {
  return useMutation({
    mutationFn: (params: { s3Key: string; role?: string; expiresSeconds?: number }) =>
      archiveApi.getPresignedUrl(params),
    onSuccess: (data) => {
      if (data?.url && !data.url.startsWith("#mock-")) {
        toast.success("Presigned URL generated")
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to generate presigned URL")
    },
  })
}

export function useReplayByEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { eventId: string; mode: "DRY_RUN" | "EXECUTE" }) =>
      archiveApi.replayEvent(body),
    onSuccess: (data, variables) => {
      if (data?.jobId) {
        queryClient.invalidateQueries({ queryKey: archiveKeys.replayJob(data.jobId) })
        queryClient.invalidateQueries({ queryKey: ["admin", "data-replay"] })
      }
      const msg =
        variables.mode === "DRY_RUN"
          ? "Dry-run completed"
          : "Replay job enqueued"
      toast.success(data?.message ?? msg)
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Replay failed")
    },
  })
}

export function useReplayJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: archiveKeys.replayJob(jobId ?? ""),
    queryFn: () => (jobId ? archiveApi.getReplayJobStatus(jobId) : Promise.resolve(null)),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data as { status?: string } | null)?.status
      return status === "PENDING" || status === "IN_PROGRESS" ? 2000 : false
    },
  })
}
