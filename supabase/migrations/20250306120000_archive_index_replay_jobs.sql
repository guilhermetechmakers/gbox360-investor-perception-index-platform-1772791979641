-- Raw Payload Archival & Replay
-- archive_index: event_id -> s3_key with checksum, tenant, provenance
-- replay_jobs: single-event or batch replay with mode and status

-- NarrativeEvent archival columns (if not present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'narrative_events') THEN
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS provenance JSONB;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS checksum VARCHAR(256);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS provenance_chain JSONB;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS speaker_role_heuristic VARCHAR(128);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(128);
  END IF;
END $$;

-- Archive index: links event_id to S3 key and metadata
CREATE TABLE IF NOT EXISTS archive_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  s3_key VARCHAR(1024) NOT NULL,
  archive_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum VARCHAR(256) NOT NULL,
  tenant_id VARCHAR(128) NOT NULL,
  source VARCHAR(255) NOT NULL,
  provenance JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_archive_index_event_id ON archive_index(event_id);
CREATE INDEX IF NOT EXISTS idx_archive_index_s3_key ON archive_index(s3_key);
CREATE INDEX IF NOT EXISTS idx_archive_index_archive_timestamp ON archive_index(archive_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_archive_index_tenant_source ON archive_index(tenant_id, source);

-- Replay jobs: single event or batch replay
CREATE TABLE IF NOT EXISTS replay_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  mode VARCHAR(32) NOT NULL CHECK (mode IN ('DRY_RUN', 'EXECUTE')),
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progressed_at TIMESTAMPTZ,
  result_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replay_jobs_event_id ON replay_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_status ON replay_jobs(status);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_enqueued ON replay_jobs(enqueued_at DESC);

-- RLS
ALTER TABLE archive_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access archive_index" ON archive_index FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access replay_jobs" ON replay_jobs FOR ALL USING (true) WITH CHECK (true);
