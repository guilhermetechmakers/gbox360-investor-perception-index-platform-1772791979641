/**
 * Narrative types for Authority Weighting & Credibility Proxy
 * Canonical NarrativeEvent schema: immutable, append-only, supports explainability
 * Topic Classification & Narrative Persistence types
 */

export interface Speaker {
  entity: string
  inferred_role?: string
}

/** Why an event was assigned to a topic */
export interface ClassificationRationale {
  rule_based?: { topic_id: string; topic_name: string; confidence: number; matched_keywords?: string[] }
  embedding_proximity?: { narrative_id: string; similarity: number }
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
  /** Why this event was assigned to a topic (rules / embedding) */
  classification_rationale?: ClassificationRationale
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

/** NarrativeTopic with decay-weighted score (from fetchNarratives API) */
export interface NarrativeTopicWithDecay {
  id: string
  name: string
  weight: number
  decay_lambda: number
  lastUpdated: string
  topEvents: Array<{
    id: string
    raw_text: string
    source: string
    speaker_entity: string
    created_at: string
    authority_weight: number
    credibility_proxy: number
  }>
}

/** Event for drill-down view */
export interface NarrativeEventDetail {
  id: string
  narrative_id?: string
  company_id: string
  source: string
  platform?: string
  speaker_entity: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  created_at: string
  authority_weight: number
  credibility_proxy: number
  decay_score: number
  metadata?: Record<string, unknown>
}

/** Ingest event payload */
export interface IngestEventPayload {
  companyId: string
  source?: string
  platform?: string
  speakerEntity?: string
  speakerRole?: string
  audienceClass?: string
  text: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

/** NarrativeTopic from DB / API (with optional decay fields) */
export interface NarrativeTopic {
  id: string
  company_id: string
  name: string
  is_embedding_cluster: boolean
  decay_lambda: number
  current_weight: number
  base_weight?: number
  last_decay_time?: string
  created_at: string
  updated_at: string
}

/** Narrative with decay-weighted score for company view */
export interface NarrativeWithDecay {
  id: string
  name: string
  weight: number
  decay_lambda: number
  lastUpdated: string
  topEvents: NarrativeEventSummary[]
  is_embedding_cluster?: boolean
  event_count?: number
}

/** Summary of a single event for lists */
export interface NarrativeEventSummary {
  id: string
  source?: string
  platform?: string
  speaker_entity?: string
  speaker_role?: string
  raw_text: string
  created_at: string
  authority_weight?: number
  credibility_proxy?: number
  classification_rationale?: ClassificationRationale
}

/** GET /api/narratives response item */
export interface NarrativeApiItem {
  id: string
  name: string
  weight: number
  decay_lambda: number
  lastUpdated: string
  topEvents: NarrativeEventSummary[]
  event_count?: number
  is_embedding_cluster?: boolean
  updated_at?: string
}
