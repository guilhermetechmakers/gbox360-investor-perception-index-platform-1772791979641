import { api } from "@/lib/api"
import { mockCalculate, mockSandbox } from "@/lib/ipi-mock"
import type {
  IPIScore,
  IPITimeseriesPoint,
  IpiHistoricalPoint,
  IPISimulateInput,
  IPICalculateInput,
  IPICalculateResult,
  IPISandboxInput,
  IPISandboxResult,
} from "@/types/ipi"
import type { NarrativeSummary, NarrativeTopicWithDecay, NarrativeEventDetail } from "@/types/narrative"
import type { NarrativeEvent, NarrativeEventCanonical } from "@/types/narrative"

export const ipiApi = {
  getCurrent: (
    companyId: string,
    window: string = "1W"
  ): Promise<IPIScore> =>
    api.get<IPIScore>(
      `/ipi/current?company_id=${companyId}&window=${window}`
    ),

  getTimeseries: (
    companyId: string,
    window: string = "1W"
  ): Promise<IPITimeseriesPoint[]> =>
    api.get<IPITimeseriesPoint[]>(
      `/ipi/timeseries?company_id=${companyId}&window=${window}`
    ),

  /**
   * GET /ipi/historical?companyId=&start=&end=
   * Returns array of IPI points with timestamps for the date range.
   */
  getHistorical: async (
    companyId: string,
    start: string,
    end: string
  ): Promise<IpiHistoricalPoint[]> => {
    try {
      const params = new URLSearchParams({
        companyId: companyId,
        start: start,
        end: end,
      })
      const data = await api.get<IpiHistoricalPoint[] | { data?: IpiHistoricalPoint[] }>(
        `/ipi/historical?${params.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: IpiHistoricalPoint[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  getTopNarratives: (
    companyId: string,
    window: string = "1W",
    topN: number = 3
  ): Promise<NarrativeSummary[]> =>
    api.get<NarrativeSummary[]>(
      `/ipi/narratives?company_id=${companyId}&window=${window}&top=${topN}`
    ),

  getEvents: (
    companyId: string,
    window: string = "1W"
  ): Promise<NarrativeEvent[]> =>
    api.get<NarrativeEvent[]>(
      `/ipi/events?company_id=${companyId}&window=${window}`
    ),

  simulate: (input: IPISimulateInput): Promise<IPIScore> =>
    api.post<IPIScore>("/ipi/simulate", input),

  /**
   * POST /ipi/calculate - Compute IPI with optional weights.
   * Falls back to client-side mock when API unavailable.
   */
  calculate: async (input: IPICalculateInput): Promise<IPICalculateResult> => {
    try {
      const res = await api.post<IPICalculateResult>("/ipi/calculate", {
        companyId: input.companyId,
        timeWindowStart: input.timeWindowStart,
        timeWindowEnd: input.timeWindowEnd,
        weights: input.weights,
      })
      return res ?? mockCalculate(input)
    } catch {
      return mockCalculate(input)
    }
  },

  /**
   * POST /ipi/sandbox - Run simulations with different weights.
   * Falls back to client-side mock when API unavailable.
   */
  sandbox: async (input: IPISandboxInput): Promise<IPISandboxResult[]> => {
    try {
      const res = await api.post<IPISandboxResult[] | { data: IPISandboxResult[] }>(
        "/ipi/sandbox",
        input
      )
      const list = Array.isArray(res) ? res : (res as { data?: IPISandboxResult[] })?.data
      return Array.isArray(list) && list.length > 0 ? list : mockSandbox(input)
    } catch {
      return mockSandbox(input)
    }
  },

  /**
   * GET /narratives - Fetch narrative events within time window.
   * Returns [] when API unavailable.
   */
  getNarratives: async (
    companyId: string,
    start: string,
    end: string,
    page?: number,
    limit?: number
  ): Promise<NarrativeEvent[]> => {
    try {
      const params = new URLSearchParams({
        companyId,
        start,
        end,
      })
      if (page != null) params.set("page", String(page))
      if (limit != null) params.set("limit", String(limit))
      const data = await api.get<NarrativeEvent[] | { data: NarrativeEvent[] }>(
        `/narratives?${params.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: NarrativeEvent[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  /**
   * GET /narratives?companyId=&start=&end= — Narratives with decay-weighted scores.
   */
  getNarrativesWithDecay: async (
    companyId: string,
    start: string,
    end: string
  ): Promise<NarrativeTopicWithDecay[]> => {
    try {
      const params = new URLSearchParams({ companyId, start, end })
      const data = await api.get<NarrativeTopicWithDecay[] | { data?: NarrativeTopicWithDecay[] }>(
        `/narratives?${params.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: NarrativeTopicWithDecay[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  /**
   * GET /narratives/:id/events?start=&end= — Events for a narrative.
   */
  getNarrativeEvents: async (
    narrativeId: string,
    start: string,
    end: string
  ): Promise<NarrativeEventDetail[]> => {
    try {
      const params = new URLSearchParams({ start, end })
      const data = await api.get<NarrativeEventDetail[] | { data?: NarrativeEventDetail[] }>(
        `/narratives/${narrativeId}/events?${params.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: NarrativeEventDetail[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  /**
   * GET /narratives/:id - Fetch single narrative event.
   */
  getNarrativeById: async (id: string): Promise<NarrativeEventCanonical | null> => {
    try {
      const res = await api.get<unknown>(`/narratives/${id}`)
      const obj = res as { data?: NarrativeEventCanonical } | NarrativeEventCanonical
      const item = (obj as { data?: NarrativeEventCanonical })?.data ?? (obj as NarrativeEventCanonical)
      return item && typeof item === "object" && "id" in item ? (item as NarrativeEventCanonical) : null
    } catch {
      return null
    }
  },

  requestExport: async (
    companyId: string,
    window: string = "1W",
    format: "csv" | "json" = "csv"
  ): Promise<{ url: string; jobId?: string }> => {
    try {
      const res = await api.post<{ url?: string; jobId?: string }>(
        `/ipi/export?company_id=${companyId}&window=${window}&format=${format}`,
        {}
      )
      const url = res?.url ?? ""
      const jobId = res?.jobId
      return { url, jobId }
    } catch {
      await new Promise((r) => setTimeout(r, 1500))
      return {
        url: `#`,
        jobId: `job-${Date.now()}`,
      }
    }
  },

  getTimelines: async (
    companyId: string,
    params?: { from?: string; to?: string; types?: string }
  ): Promise<NarrativeEvent[]> => {
    try {
      const search = new URLSearchParams()
      search.set("companyId", companyId)
      if (params?.from) search.set("from", params.from)
      if (params?.to) search.set("to", params.to)
      if (params?.types) search.set("types", params.types)
      const data = await api.get<NarrativeEvent[] | { data: NarrativeEvent[] }>(
        `/ipi/timelines?${search.toString()}`
      )
      const list = Array.isArray(data) ? data : (data as { data?: NarrativeEvent[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },
}
