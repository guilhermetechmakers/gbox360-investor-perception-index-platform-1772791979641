export interface Speaker {
  entity: string
  inferred_role?: string
}

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
  credibility_scores?: Record<string, number>
  narrative_topic_ids: string[]
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
