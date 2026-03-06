import { api } from "@/lib/api"
import type {
  IPIScore,
  IPITimeseriesPoint,
  IPISimulateInput,
} from "@/types/ipi"
import type { NarrativeSummary } from "@/types/narrative"
import type { NarrativeEvent } from "@/types/narrative"

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
   * Timeline data for company with optional date/type filters.
   * Gracefully returns [] if endpoint unavailable.
   */
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
