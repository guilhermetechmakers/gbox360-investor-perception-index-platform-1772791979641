-- Canonical NarrativeEvent Model & Storage
-- Extends narrative_events with provenance, source_payload_id, published_at, ingested_at.
-- Adds ingested_payloads metadata, ipi_results, snapshot_narratives, companies.

-- Companies dimension table (if not exists)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ticker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);

-- Add canonical columns to narrative_events (nullable for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'event_id') THEN
    ALTER TABLE narrative_events ADD COLUMN event_id UUID UNIQUE DEFAULT gen_random_uuid();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'source_id') THEN
    ALTER TABLE narrative_events ADD COLUMN source_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'published_at') THEN
    ALTER TABLE narrative_events ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'ingested_at') THEN
    ALTER TABLE narrative_events ADD COLUMN ingested_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'source_payload_id') THEN
    ALTER TABLE narrative_events ADD COLUMN source_payload_id VARCHAR(512);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'authority_score') THEN
    ALTER TABLE narrative_events ADD COLUMN authority_score NUMERIC(5,4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'credibility_proxy_scores') THEN
    ALTER TABLE narrative_events ADD COLUMN credibility_proxy_scores JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'narrative_topic_ids') THEN
    ALTER TABLE narrative_events ADD COLUMN narrative_topic_ids UUID[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'version') THEN
    ALTER TABLE narrative_events ADD COLUMN version INT NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'narrative_events' AND column_name = 'speaker_role_inferred') THEN
    ALTER TABLE narrative_events ADD COLUMN speaker_role_inferred VARCHAR(64);
  END IF;
END $$;

-- Backfill event_id from id where null
UPDATE narrative_events SET event_id = id WHERE event_id IS NULL;

-- Ingested payloads metadata (canonical path structure for raw payload archival)
CREATE TABLE IF NOT EXISTS ingested_payloads_meta (
  payload_id VARCHAR(512) PRIMARY KEY,
  source_id VARCHAR(255),
  platform VARCHAR(64),
  payload_uri VARCHAR(1024),
  hash VARCHAR(128),
  size_bytes BIGINT,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingested_payloads_meta_source ON ingested_payloads_meta(source_id);
CREATE INDEX IF NOT EXISTS idx_ingested_payloads_meta_ingested ON ingested_payloads_meta(ingested_at DESC);

-- IPI results (computed per company/time window)
CREATE TABLE IF NOT EXISTS ipi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  ipi_score NUMERIC(6,2),
  narrative_score NUMERIC(6,2),
  credibility_score NUMERIC(6,2),
  risk_score NUMERIC(6,2),
  weights JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipi_results_company ON ipi_results(company_id);
CREATE INDEX IF NOT EXISTS idx_ipi_results_window ON ipi_results(company_id, start_time, end_time);

-- Snapshot narratives (per-event contribution to IPI window)
CREATE TABLE IF NOT EXISTS snapshot_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  company_id UUID REFERENCES companies(id),
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  weight NUMERIC(8,4),
  score NUMERIC(8,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_narratives_company ON snapshot_narratives(company_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_narratives_window ON snapshot_narratives(company_id, window_start, window_end);

-- Ensure narrative_events has company_id FK to companies if companies exists
-- (Skip if companies is empty or narrative_events.company_id references elsewhere)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    -- Add FK only if not already present
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'narrative_events' AND constraint_name LIKE '%companies%'
    ) THEN
      -- narrative_events may have company_id as UUID; ensure companies has matching id
      -- We don't add FK here to avoid breaking existing data; companies can be populated separately
      NULL;
    END IF;
  END IF;
END $$;

-- RLS for new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingested_payloads_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access ingested_payloads_meta" ON ingested_payloads_meta FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access ipi_results" ON ipi_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access snapshot_narratives" ON snapshot_narratives FOR ALL USING (true) WITH CHECK (true);
