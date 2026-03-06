-- Topic Classification & Narrative Persistence Schema
-- NarrativeTopic: canonical topics with decay parameters
-- NarrativeEvent: events linked to topics (immutable, append-only)
-- IngestionPayload: raw payloads for audit trail

-- NarrativeTopic
CREATE TABLE IF NOT EXISTS narrative_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_embedding_cluster BOOLEAN DEFAULT false,
  decay_lambda NUMERIC DEFAULT 0.01,
  current_weight NUMERIC DEFAULT 0,
  base_weight NUMERIC DEFAULT 1,
  last_decay_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_narrative_topics_company ON narrative_topics(company_id);
CREATE INDEX IF NOT EXISTS idx_narrative_topics_updated ON narrative_topics(updated_at DESC);

-- NarrativeEvent (references narrative_topics)
CREATE TABLE IF NOT EXISTS narrative_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id UUID NOT NULL REFERENCES narrative_topics(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  source TEXT,
  platform TEXT,
  speaker_entity TEXT,
  speaker_role TEXT,
  audience_class TEXT,
  raw_text TEXT NOT NULL,
  authority_weight NUMERIC DEFAULT 0.1,
  credibility_proxy NUMERIC DEFAULT 0.5,
  decay_score NUMERIC DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_narrative_events_narrative ON narrative_events(narrative_id);
CREATE INDEX IF NOT EXISTS idx_narrative_events_company ON narrative_events(company_id);
CREATE INDEX IF NOT EXISTS idx_narrative_events_created ON narrative_events(created_at DESC);

-- IngestionPayload for audit trail
CREATE TABLE IF NOT EXISTS ingestion_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  source TEXT,
  payload JSONB NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending','ingested','failed','retried')) DEFAULT 'pending',
  narrative_event_id UUID REFERENCES narrative_events(id)
);

CREATE INDEX IF NOT EXISTS idx_ingestion_payloads_company ON ingestion_payloads(company_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_payloads_status ON ingestion_payloads(status);

-- RLS policies for company-scoped access
ALTER TABLE narrative_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_payloads ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Edge Functions use service role)
CREATE POLICY "Service role full access narrative_topics" ON narrative_topics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access narrative_events" ON narrative_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access ingestion_payloads" ON ingestion_payloads
  FOR ALL USING (true) WITH CHECK (true);
