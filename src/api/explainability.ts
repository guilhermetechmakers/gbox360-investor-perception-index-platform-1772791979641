/**
 * Drill-down Explainability API client.
 * Endpoints: top-narratives, events, authority-breakdown, credibility-proxy,
 * experiments, payload download/search, audit logs, notes, flag.
 * All responses validated with defensive defaults (data ?? [], Array.isArray).
 */
import { api } from "@/lib/api"
import type {
  TopNarrativesResponse,
  ExplainabilityEventsResponse,
  AuthorityBreakdownResponse,
  CredibilityProxyResponse,
  ExperimentRequest,
  ExperimentResponse,
  PayloadSearchResponse,
  ExplainabilityAuditLog,
  RawPayload,
} from "@/types/explainability"

const safeNarratives = (data: unknown): TopNarrativesResponse["narratives"] =>
  Array.isArray((data as TopNarrativesResponse)?.narratives)
    ? (data as TopNarrativesResponse).narratives
    : []

const safeEvents = (data: unknown): ExplainabilityEventsResponse["events"] =>
  Array.isArray((data as ExplainabilityEventsResponse)?.events)
    ? (data as ExplainabilityEventsResponse).events
    : []

const safeSources = (data: unknown): AuthorityBreakdownResponse["sources"] =>
  Array.isArray((data as AuthorityBreakdownResponse)?.sources)
    ? (data as AuthorityBreakdownResponse).sources
    : []

const safeProxies = (data: unknown): CredibilityProxyResponse["proxies"] =>
  Array.isArray((data as CredibilityProxyResponse)?.proxies)
    ? (data as CredibilityProxyResponse).proxies
    : []

const safePayloads = (data: unknown): RawPayload[] =>
  Array.isArray((data as PayloadSearchResponse)?.payloads)
    ? (data as PayloadSearchResponse).payloads
    : []

const safeLogs = (data: unknown): ExplainabilityAuditLog[] =>
  Array.isArray((data as { logs?: ExplainabilityAuditLog[] })?.logs)
    ? (data as { logs: ExplainabilityAuditLog[] }).logs
    : Array.isArray((data as { data?: ExplainabilityAuditLog[] })?.data)
      ? (data as { data: ExplainabilityAuditLog[] }).data
      : []

export const explainabilityApi = {
  /**
   * GET /ipi/explainability/top-narratives?companyId=&start=&end=&limit=
   */
  getTopNarratives: async (params: {
    companyId: string
    start: string
    end: string
    limit?: number
  }): Promise<TopNarrativesResponse> => {
    try {
      const search = new URLSearchParams({
        companyId: params.companyId,
        start: params.start,
        end: params.end,
      })
      if (params.limit != null) search.set("limit", String(params.limit))
      const data = await api.get<TopNarrativesResponse | { narratives?: unknown[]; total?: number }>(
        `/ipi/explainability/top-narratives?${search.toString()}`
      )
      const narratives = safeNarratives(data)
      const total = typeof (data as TopNarrativesResponse)?.total === "number"
        ? (data as TopNarrativesResponse).total
        : narratives.length
      return { narratives, total }
    } catch {
      return { narratives: [], total: 0 }
    }
  },

  /**
   * GET /ipi/explainability/events?narrativeId=&limit=
   */
  getEvents: async (params: {
    narrativeId: string
    limit?: number
  }): Promise<ExplainabilityEventsResponse> => {
    try {
      const search = new URLSearchParams({ narrativeId: params.narrativeId })
      if (params.limit != null) search.set("limit", String(params.limit))
      const data = await api.get<ExplainabilityEventsResponse | { events?: unknown[] }>(
        `/ipi/explainability/events?${search.toString()}`
      )
      return { events: safeEvents(data) }
    } catch {
      return { events: [] }
    }
  },

  /**
   * GET /ipi/explainability/authority-breakdown?companyId=&start=&end=
   */
  getAuthorityBreakdown: async (params: {
    companyId: string
    start: string
    end: string
  }): Promise<AuthorityBreakdownResponse> => {
    try {
      const search = new URLSearchParams({
        companyId: params.companyId,
        start: params.start,
        end: params.end,
      })
      const data = await api.get<AuthorityBreakdownResponse | { sources?: unknown[] }>(
        `/ipi/explainability/authority-breakdown?${search.toString()}`
      )
      return { sources: safeSources(data) }
    } catch {
      return { sources: [] }
    }
  },

  /**
   * GET /ipi/explainability/credibility-proxy?companyId=&start=&end=
   */
  getCredibilityProxy: async (params: {
    companyId: string
    start: string
    end: string
  }): Promise<CredibilityProxyResponse> => {
    try {
      const search = new URLSearchParams({
        companyId: params.companyId,
        start: params.start,
        end: params.end,
      })
      const data = await api.get<CredibilityProxyResponse | { proxies?: unknown[] }>(
        `/ipi/explainability/credibility-proxy?${search.toString()}`
      )
      return { proxies: safeProxies(data) }
    } catch {
      return { proxies: [] }
    }
  },

  /**
   * POST /ipi/explainability/experiments — hypothetical IPI delta with provisional weights.
   */
  postExperiment: async (body: ExperimentRequest): Promise<ExperimentResponse> => {
    try {
      const res = await api.post<ExperimentResponse>(`/ipi/explainability/experiments`, body)
      const r = res ?? {}
      return {
        currentScore: typeof r.currentScore === "number" ? r.currentScore : 0,
        delta: typeof r.delta === "number" ? r.delta : 0,
        components: r.components ?? {
          narrativeScore: 0,
          credibilityScore: 0,
          riskProxyScore: 0,
        },
      }
    } catch {
      return {
        currentScore: 0,
        delta: 0,
        components: { narrativeScore: 0, credibilityScore: 0, riskProxyScore: 0 },
      }
    }
  },

  /**
   * GET /payload/:payloadId — presigned URL or download stream.
   * Returns { url: string } when presigned URL is used.
   */
  getPayloadDownload: async (payloadId: string): Promise<{ url?: string }> => {
    try {
      const res = await api.get<{ url?: string }>(`/payload/${encodeURIComponent(payloadId)}`)
      const url = (res as { url?: string })?.url
      return { url: typeof url === "string" ? url : undefined }
    } catch {
      return {}
    }
  },

  /**
   * GET /payload/search?query=&companyId=
   */
  getPayloadSearch: async (params: {
    query: string
    companyId?: string
  }): Promise<PayloadSearchResponse> => {
    try {
      const search = new URLSearchParams({ query: params.query })
      if (params.companyId) search.set("companyId", params.companyId)
      const data = await api.get<PayloadSearchResponse | { payloads?: unknown[] }>(
        `/payload/search?${search.toString()}`
      )
      return { payloads: safePayloads(data) }
    } catch {
      return { payloads: [] }
    }
  },

  /**
   * GET /audit/logs?companyId=&userId=&start=&end=
   */
  getAuditLogs: async (params: {
    companyId?: string
    userId?: string
    start?: string
    end?: string
  }): Promise<ExplainabilityAuditLog[]> => {
    try {
      const search = new URLSearchParams()
      if (params.companyId) search.set("companyId", params.companyId)
      if (params.userId) search.set("userId", params.userId)
      if (params.start) search.set("start", params.start)
      if (params.end) search.set("end", params.end)
      const data = await api.get<{ logs?: unknown[]; data?: unknown[] }>(
        `/audit/logs?${search.toString()}`
      )
      return safeLogs(data)
    } catch {
      return []
    }
  },

  /**
   * POST /audit/notes — add note to event.
   */
  postAuditNote: async (body: {
    eventId: string
    note: string
    userId: string
  }): Promise<{ success: boolean; log?: ExplainabilityAuditLog }> => {
    const res = await api.post<{ success?: boolean; log?: ExplainabilityAuditLog }>(
      "/audit/notes",
      body
    )
    return {
      success: (res as { success?: boolean })?.success === true,
      log: (res as { log?: ExplainabilityAuditLog })?.log,
    }
  },

  /**
   * POST /payloads/flag — flag event.
   */
  postPayloadFlag: async (body: {
    eventId: string
    flag: string
    userId: string
    reason?: string
  }): Promise<{ success: boolean }> => {
    try {
      const res = await api.post<{ success?: boolean }>("/payloads/flag", body)
      return { success: (res as { success?: boolean })?.success === true }
    } catch {
      return { success: false }
    }
  },
}
