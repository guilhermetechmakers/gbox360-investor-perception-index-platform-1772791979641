-- Canonical NarrativeEvent model: append-only, provenance, versioning
-- Adds spec-aligned columns and supporting tables (ingested_payloads, ipi_results, snapshot_narratives)

-- Add canonical columns to narrative_events (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'narrative_events') THEN
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS event_id UUID UNIQUE;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS source_id VARCHAR(255);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS source_payload_id VARCHAR(512);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS authority_score NUMERIC(5,4);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS credibility_proxy_scores JSONB;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS narrative_topic_ids UUID[];
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
    CREATE INDEX IF NOT EXISTS idx_narrative_events_company_published ON narrative_events(company_id, published_at);
    CREATE INDEX IF NOT EXISTS idx_narrative_events_source_published ON narrative_events(source_id, published_at) WHERE source_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_narrative_events_event_id ON narrative_events(event_id) WHERE event_id IS NOT NULL;
  END IF;
END $$;

-- ingested_payloads: raw payload metadata (spec)
CREATE TABLE IF NOT EXISTS ingested_payloads (
  payload_id VARCHAR(512) PRIMARY KEY,
  source_id VARCHAR(255),
  platform VARCHAR(64),
  payload_uri VARCHAR(1024),
  hash VARCHAR(128),
  size BIGINT,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ingested_payloads_source ON ingested_payloads(source_id);
CREATE INDEX IF NOT EXISTS idx_ingested_payloads_ingested ON ingested_payloads(ingested_at DESC);

-- ipi_results: computed IPI per company/time window
CREATE TABLE IF NOT EXISTS ipi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  ipi_score NUMERIC(6,2),
  narrative_score NUMERIC(6,2),
  credibility_score NUMERIC(6,2),
  risk_score NUMERIC(6,2),
  weights JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ipi_results_company_window ON ipi_results(company_id, start_time, end_time);

-- snapshot_narratives: narrative contribution snapshot per window
CREATE TABLE IF NOT EXISTS snapshot_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  company_id UUID NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  weight NUMERIC(8,4),
  score NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshot_narratives_company_window ON snapshot_narratives(company_id, window_start, window_end);

-- RLS
ALTER TABLE ingested_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access ingested_payloads" ON ingested_payloads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access ipi_results" ON ipi_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access snapshot_narratives" ON snapshot_narratives FOR ALL USING (true) WITH CHECK (true);
