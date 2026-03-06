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
}
