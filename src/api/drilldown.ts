/**
 * Drill-down / Why did this move? API.
 * GET /api/drilldown/why-move, POST /api/ipi/simulate.
 * All responses validated; safe defaults for missing data.
 */
import { api } from "@/lib/api"
import type { NarrativeEvent } from "@/types/narrative"

export interface WhyMoveDrivers {
  narrativePersistence?: Record<string, number>
  authoritySources?: Array<{ source: string; weight: number }>
  credibilityProxy?: { managementLanguage?: number; repetition?: number; [k: string]: number | undefined }
  rawPayload?: Array<{ id: string; narrativeEventId: string; timestamp: string; payload: unknown }>
}

export interface WhyMoveResponse {
  drivers: WhyMoveDrivers
  events?: NarrativeEvent[]
}

export interface SimulateRequestBody {
  companyId: string
  windowStart: string
  windowEnd: string
  weights: { narrative: number; credibility: number; risk: number }
}

export interface SimulateResponse {
  hypotheticalIPI: number
  breakdown: { narrative: number; credibility: number; risk: number }
}

const defaultDrivers: WhyMoveDrivers = {
  narrativePersistence: {},
  authoritySources: [],
  credibilityProxy: {},
  rawPayload: [],
}

export const drilldownApi = {
  /**
   * GET /api/drilldown/why-move?companyId=&windowStart=&windowEnd=
   * Returns drivers and events; safe empty defaults when API fails.
   */
  getWhyMove: async (params: {
    companyId: string
    windowStart: string
    windowEnd: string
  }): Promise<WhyMoveResponse> => {
    try {
      const search = new URLSearchParams({
        companyId: params.companyId,
        windowStart: params.windowStart,
        windowEnd: params.windowEnd,
      })
      const res = await api.get<WhyMoveResponse | { data?: WhyMoveResponse }>(
        `/drilldown/why-move?${search.toString()}`
      )
      const raw = (res as { data?: WhyMoveResponse })?.data ?? (res as WhyMoveResponse)
      const drivers = raw?.drivers ?? defaultDrivers
      const events = Array.isArray(raw?.events) ? raw.events : []
      return { drivers, events }
    } catch {
      return { drivers: defaultDrivers, events: [] }
    }
  },

  /**
   * POST /api/ipi/simulate — hypothetical IPI with custom weights.
   * Falls back to safe defaults when API fails.
   */
  simulate: async (body: SimulateRequestBody): Promise<SimulateResponse> => {
    try {
      const res = await api.post<SimulateResponse>("/ipi/simulate", body)
      const hypotheticalIPI =
        typeof (res as SimulateResponse)?.hypotheticalIPI === "number"
          ? (res as SimulateResponse).hypotheticalIPI
          : 0
      const breakdown = (res as SimulateResponse)?.breakdown ?? {
        narrative: 0,
        credibility: 0,
        risk: 0,
      }
      return { hypotheticalIPI, breakdown }
    } catch {
      return {
        hypotheticalIPI: 0,
        breakdown: { narrative: 0, credibility: 0, risk: 0 },
      }
    }
  },
}
