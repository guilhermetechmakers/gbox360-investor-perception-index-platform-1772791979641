/**
 * Search & Filter types for NarrativeEvents and IPI timelines.
 * Aligns with API FilterParams and UI state.
 */

export interface TimeWindowRange {
  start: string
  end: string
}

export type RelativeTimeWindow = "1D" | "1W" | "2W" | "30d" | "90d"

export interface FilterParams {
  timeWindow: TimeWindowRange | RelativeTimeWindow
  sources: string[]
  roles: string[]
  authorityBands: string[]
  page?: number
  limit?: number
}

/** Source type options for filter UI */
export const SOURCE_TYPES = [
  { id: "news", label: "News" },
  { id: "social", label: "Social" },
  { id: "transcript", label: "Earnings Transcript" },
] as const

/** Speaker role options for filter UI */
export const SPEAKER_ROLES = [
  { id: "analyst", label: "Analyst" },
  { id: "journalist", label: "Journalist" },
  { id: "company_exec", label: "Company Exec" },
  { id: "other", label: "Other" },
] as const

/** Authority band options for filter UI */
export const AUTHORITY_BANDS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
] as const

export type SourceTypeId = (typeof SOURCE_TYPES)[number]["id"]
export type SpeakerRoleId = (typeof SPEAKER_ROLES)[number]["id"]
export type AuthorityBandId = (typeof AUTHORITY_BANDS)[number]["id"]
