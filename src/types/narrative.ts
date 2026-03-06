/**
 * Narrative types for Authority Weighting & Credibility Proxy
 * Canonical NarrativeEvent schema: immutable, append-only, supports explainability
 */

export interface Speaker {
  entity: string
  inferred_role?: string
}

/** Canonical NarrativeEvent - immutable append-only schema */
export interface NarrativeEventCanonical {
  id: string
  company_id: string
  source_platform: string
  speaker_entity: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  created_at: string
  updated_at?: string
  authority_weight: number
  credibility_proxy: number
  topic_classification?: string
  time_window_start?: string
  time_window_end?: string
  decay_score: number
  is_persistent: boolean
  raw_payload?: Record<string, unknown>
  /** Legacy / API compatibility */
  source_type?: string
  published_at?: string
  ingested_at?: string
}

/** API/legacy NarrativeEvent shape */
export interface NarrativeEvent {
  event_id: string
  company_id: string
  source: string
  platform?: string
  speaker: Speaker
  audience_class?: string
  raw_text: string
  published_at: string
  ingested_at: string
  source_payload_id?: string
  s3_key?: string
  authority_score: number
  authority_weight?: number
  credibility_scores?: Record<string, number>
  credibility_proxy?: number
  narrative_topic_ids: string[]
  topic_classification?: string
  decay_score?: number
  created_at: string
}

export interface NarrativeSummary {
  topic_id: string
  summary: string
  authority_weight: number
  credibility_proxy: number
  event_count: number
  event_ids: string[]
}
