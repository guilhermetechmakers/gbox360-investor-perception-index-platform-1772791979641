/**
 * IPI API request/response validators.
 * Used to validate sandbox weights and time windows before sending to API.
 */

import { z } from "zod"

/** Each weight in [0, 1]; sum not required to be 1 (provisional) */
export const ipiWeightsSchema = z.object({
  narrative: z.number().min(0, "Narrative weight must be ≥ 0").max(1, "Narrative weight must be ≤ 1"),
  credibility: z.number().min(0, "Credibility weight must be ≥ 0").max(1, "Credibility weight must be ≤ 1"),
  risk: z.number().min(0, "Risk weight must be ≥ 0").max(1, "Risk weight must be ≤ 1"),
})

/** POST /ipi/sandbox body */
export const ipiSandboxBodySchema = z.object({
  companyId: z.string().min(1, "companyId is required"),
  timeWindowStart: z.string().min(1, "timeWindowStart is required"),
  timeWindowEnd: z.string().min(1, "timeWindowEnd is required"),
  provisionalWeights: ipiWeightsSchema,
  scenarioName: z.string().optional(),
  scenarios: z.array(z.object({ name: z.string(), weights: ipiWeightsSchema })).optional(),
})

/** Time window: start <= end, ISO date or date-time */
export const timeWindowSchema = z.object({
  start: z.string().min(1, "start is required"),
  end: z.string().min(1, "end is required"),
}).refine(
  (data) => {
    const s = new Date(data.start).getTime()
    const e = new Date(data.end).getTime()
    return !Number.isNaN(s) && !Number.isNaN(e) && s <= e
  },
  { message: "start must be before or equal to end" }
)

export type IPIWeightsInput = z.infer<typeof ipiWeightsSchema>
export type IPISandboxBodyInput = z.infer<typeof ipiSandboxBodySchema>
export type TimeWindowInput = z.infer<typeof timeWindowSchema>
