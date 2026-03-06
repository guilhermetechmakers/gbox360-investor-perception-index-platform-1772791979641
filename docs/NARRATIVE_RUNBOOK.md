# Topic Classification & Narrative Persistence — Runbook

## Overview

This runbook describes how to test the Topic Classification & Narrative Persistence system, simulate admin vs user flows, and extend for additional integrations (SSO, webhooks).

---

## Architecture

- **Frontend**: Company View (`/dashboard/company/:companyId`), Drill-Down (`/dashboard/company/:companyId/drill-down`)
- **API**: Supabase Edge Function at `supabase/functions/api/index.ts`
- **Database**: `narrative_topics`, `narrative_events`, `ingestion_payloads` (see `supabase/migrations/`)

---

## Testing Each Panel

### 1. Company View

1. Navigate to `/dashboard` and select a company, or go to `/dashboard/company/<company-id>`.
2. **Time window**: Use the dropdown (1D, 1W, 2W, 1M) or Date Range Picker.
3. **IPI card**: Displays score, delta, and narrative/credibility/risk breakdown.
4. **Decay Gauge**: Shows aggregate narrative weight when topics exist.
5. **Top 3 narratives**: Click "View details" on a narrative card to open the drill-down drawer.
6. **Event timeline**: Lists events with links to raw payload viewer.

### 2. Drill-Down Page

1. From Company View, click "Why did this move?" or open a narrative card’s "View details".
2. **IPI decomposition**: Bar chart of Narrative, Credibility, Risk components.
3. **Narrative decay-weighted scores**: Per-narrative weights with DecayGauge.
4. **Replay controls**: Placeholder for Admin → Data Replay.
5. **Narrative contribution**: Events with authority/credibility and links to payload viewer.

### 3. Drill-Down Drawer (Modal)

1. Triggered from Company View when clicking "View details" on a narrative card.
2. Shows classification rationale (rule-based topic name).
3. Lists underlying events with source, speaker, timestamps.
4. Links to `/dashboard/payload/:eventId` for raw payload audit.

---

## Simulating Admin vs User Flows

### User Flow

1. Log in as a regular user.
2. Go to Company View → select company and time window.
3. View narratives, IPI, and events.
4. Click "View details" on a narrative to see the drill-down drawer.
5. Export (if enabled) and use Sandbox for weight simulations.

### Admin Flow

1. Log in as admin.
2. **Resolve narrative**: `POST /narratives/:id/resolve` with `{ resolvedName?: string, tags?: string[] }`.
3. **Ingest event**: `POST /ingestEvent` with event payload (see API section).
4. Admin Data Replay: `/admin/data-replay` for replay controls.

### API Endpoints (Admin/Integration)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ingestEvent` | Ingest event; run rule-based classification; persist. |
| GET | `/narratives?companyId=&start=&end=` | Fetch narratives with decay-weighted scores. |
| GET | `/narratives/:id` | Fetch single narrative event. |
| GET | `/narratives/:id/events?start=&end=` | Fetch events for a narrative. |
| POST | `/narratives/:id/resolve` | Admin: resolve/tag narrative. |
| GET | `/healthz` | Health check. |

---

## Ingest Event Payload

```json
{
  "companyId": "uuid",
  "source": "Analyst",
  "platform": "earnings-call",
  "speakerEntity": "CFO",
  "speakerRole": "Analyst",
  "audienceClass": "institutional",
  "text": "We expect revenue growth of 15% in Q4...",
  "timestamp": "2025-03-06T12:00:00.000Z",
  "metadata": {}
}
```

- **Required**: `companyId`, `text`
- **Optional**: `source`, `platform`, `speakerEntity`, `speakerRole`, `audienceClass`, `timestamp`, `metadata`

---

## Extending for Additional Integrations

### SSO

- Auth is handled by Supabase Auth. For SSO, configure Supabase Auth providers (e.g. Google, Okta).
- Edge Function reads `Authorization: Bearer <token>`; ensure JWT includes company-scoped claims if needed.

### Webhooks

1. Create a new Edge Function, e.g. `supabase/functions/webhook-ingest/index.ts`.
2. Accept webhook payload, validate signature, map to `IngestEventPayload`.
3. Call the ingest logic (or invoke the main `api` function internally).
4. Store `ingestion_payloads` for audit.

### Embedding-Based Clustering (OpenAI/Cohere)

1. Add `OPENAI_API_KEY` or `COHERE_API_KEY` to Supabase secrets: `supabase secrets set OPENAI_API_KEY=...`
2. In the Edge Function, after rule-based extraction:
   - Call embedding API for event text.
   - Compare to existing narrative embeddings (e.g. in `embeddings_cache` table).
   - Assign to nearest narrative or create new `NarrativeTopic` with `is_embedding_cluster: true`.
3. Fallback: if embedding fails, use rule-based topic only.

---

## Database Migrations

Run migrations:

```bash
supabase db push
# or
supabase migration up
```

---

## Environment Variables

- `VITE_API_URL`: Base URL for API (e.g. `https://<project>.supabase.co/functions/v1` for Edge Functions).
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: Supabase client config.
- Edge Function: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`).
