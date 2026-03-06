-- Resilient Data Ingestion: idempotency, DLQ, raw payload archive
-- IdempotencyKey: deduplicate by key within configurable window
-- DLQ: dead-letter queue per source with error metadata and retry count
-- RawPayloadArchive: immutable raw payload metadata (S3 key, hash, size)

-- Idempotency keys for ingestion deduplication
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(512) PRIMARY KEY,
  source VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_source ON idempotency_keys(source);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created ON idempotency_keys(created_at DESC);

-- Dead-letter queue per source
CREATE TABLE IF NOT EXISTS ingestion_dlq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(512) NOT NULL,
  payload_ref VARCHAR(1024),
  error_message TEXT,
  error_code VARCHAR(64),
  retry_count INT NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ingestion_dlq_source ON ingestion_dlq(source);
CREATE INDEX IF NOT EXISTS idx_ingestion_dlq_last_attempted ON ingestion_dlq(last_attempted_at DESC);

-- Raw payload archive metadata (S3/key, hash, size)
CREATE TABLE IF NOT EXISTS raw_payload_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(512) UNIQUE NOT NULL,
  source VARCHAR(128) NOT NULL,
  payload_ref VARCHAR(1024) NOT NULL,
  size_bytes BIGINT,
  sha256 VARCHAR(128),
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_raw_payload_archive_source ON raw_payload_archive(source);
CREATE INDEX IF NOT EXISTS idx_raw_payload_archive_archived ON raw_payload_archive(archived_at DESC);

-- Ensure narrative_events has provenance and source_payload_ref for spec alignment
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'narrative_events') THEN
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS provenance VARCHAR(1024);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS source_payload_ref VARCHAR(1024);
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
    ALTER TABLE narrative_events ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ;
  END IF;
END $$;

-- RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_dlq ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_payload_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access idempotency_keys" ON idempotency_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access ingestion_dlq" ON ingestion_dlq FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access raw_payload_archive" ON raw_payload_archive FOR ALL USING (true) WITH CHECK (true);
