# Topic Classification & Narrative Persistence — Runbook

## Overview

This runbook describes how to test each panel, simulate admin vs user flows, and extend the system for SSO, webhooks, and additional integrations.

---

## 1. Testing Each Panel

### Company view (`/dashboard/company/:companyId`)

- **IPI card**: Displays score, delta, and narrative/credibility/risk components. Use **Sandbox** to run scenarios with different weights.
- **Narrative decay-weighted score**: Shown when the `/narratives?companyId=&start=&end=` API returns topic-level data (from `narrative_topics` + decay). If no topics exist, this section is hidden.
- **Top 3 contributing narratives**:  
  - If **decay-weighted narratives** are returned: each row is a **NarrativeCard** with decay gauge and **View details** opening the **DrillDownPanel**.  
  - Else: fallback to IPI **top narratives** (summary + “Why did this move?” link to drill-down page).
- **Event timeline**: Lists events; **View raw payload** (icon) goes to `/dashboard/payload/:eventId`.
- **Filters**: Time window (1D / 1W / 2W / 1M) and date range picker; changing them refetches IPI and narratives.

**How to test**

1. Open a company (e.g. `/dashboard/company/<uuid>?window=1W`).
2. Confirm IPI and (if applicable) decay narrative cards load; use **View details** on a narrative to open the drill-down panel.
3. Confirm timeline events and payload links work.

### Drill-down panel (modal from Company view)

- Opens when **View details** is clicked on a decay-weighted narrative card.
- Fetches **GET /narratives/:id/events?start=&end=** and shows event list with source, speaker, date, authority/credibility, and **classification rationale** (rules / embedding) when present.
- **View raw payload** links to `/dashboard/payload/:eventId`.

**How to test**

1. From Company view, click **View details** on a narrative card (only when decay API returns topics).
2. Confirm events load and rationale appears when the backend sends `classification_rationale`.
3. Use **View raw payload** and confirm PayloadViewer opens.

### Drill-down page (`/dashboard/company/:companyId/drill-down`)

- Full-page “Why did this move?” view: IPI decomposition chart, replay controls, and narrative contribution list (events with authority/credibility and link to payload).

**How to test**

1. Go to `/dashboard/company/<id>/drill-down?window=1W`.
2. Confirm decomposition and event list render; open payload links.

### Payload viewer (`/dashboard/payload/:eventId`)

- Single event: computed fields (authority weight, credibility proxy), event details, **classification rationale** (when present), and raw payload (audit).

**How to test**

1. From timeline or drill-down, open **View raw payload** for an event.
2. Confirm **Classification rationale** card appears when the API returns `classification_rationale`.

---

## 2. Simulating Admin vs User Flows

### User (viewer)

- Can open Company view, change time window/date range, view narratives and drill-down panel, open payload viewer.
- **POST /narratives/:id/resolve** should be restricted to admins (enforced by backend/RLS). Normal users do not see a “Resolve” action in the current UI.

### Admin

- Same as user, plus:
  - **Resolve narrative**: **POST /narratives/:id/resolve** with body `{ tag?, mergeIntoId? }` (or `resolvedName` / `tags` per backend). Call via API client or admin-only UI when added.
- To simulate: call the resolve endpoint with a valid JWT that has admin role (or service role in dev).

### Ingest (editor / system)

- **POST /ingestEvent** ingests an event: rule-based topic extraction, optional embedding, persist to `narrative_events` and `ingestion_payloads`, update topic weights.
- Required body: `companyId`, `text`; optional: `source`, `platform`, `speakerEntity`, `speakerRole`, `audienceClass`, `timestamp`, `metadata`.
- To test: use a REST client or the `useIngestEvent()` mutation (e.g. from an admin “Ingest event” form) with a valid token.

---

## 3. Extending for SSO, Webhooks, and Integrations

### SSO

- Auth is handled by Supabase Auth (and any existing SSO). Narrative/ingest APIs use the same JWT. Ensure:
  - **Company-scoped access**: RLS or backend checks that the user’s org/role can access the given `companyId` for GET narratives and POST ingest.
  - No change to topic/decay logic; only who can call which endpoint.

### Webhooks

- **Outbound**: After a successful **POST /ingestEvent**, the Edge Function (or a DB trigger) can call a configured webhook URL with a summary (e.g. `eventId`, `narrativeId`, `companyId`, `topicName`). Store webhook URL and secret in Supabase secrets or config table; sign payload with HMAC.
- **Inbound**: To ingest from external systems (e.g. Slack, email), add an Edge Function route (e.g. **POST /webhooks/inbound**) that validates the source (shared secret or signature), normalizes the body to the ingest payload shape, and calls the same ingest logic used by **POST /ingestEvent** (or insert into `ingestion_payloads` with status `pending` and a worker that processes them).

### Additional integrations

- **Embeddings**: OpenAI/Cohere keys in Supabase secrets; call from the Edge Function inside ingest. On success, store embedding ref (or vector in pgvector) and set `is_embedding_cluster` / similarity when assigning to a topic.
- **Rate limiting**: Add rate limit (e.g. per company or per API key) in the Edge Function or at the gateway for **POST /ingestEvent** and **POST /narratives/:id/resolve**.
- **Audit**: `ingestion_payloads` keeps raw payloads; ensure RLS allows only service role or admins to read. Optionally log resolve and ingest actions to an `audit_log` table.

---

## 4. API Contract Summary

| Method | Path | Purpose |
|--------|------|--------|
| POST | /ingestEvent | Ingest event; rule-based (+ optional embedding) topic assignment; persist event and payload. |
| GET | /narratives?companyId=&start=&end= | List narratives with decay-weighted scores and top events (from `narrative_topics` when present). |
| GET | /narratives/:id | Single narrative event (by event id). |
| GET | /narratives/:id/events?start=&end= | Events for a narrative topic (drill-down). |
| POST | /narratives/:id/resolve | Admin: resolve/tag or merge narrative. |
| GET | /healthz | Health check. |

All responses use consistent shapes; arrays are defaulted to `[]` when absent. Client validates with `Array.isArray(...)` and optional chaining.

---

## 5. Unit Tests

- **Decay**: `src/lib/decay.test.ts` — `computeDecayWeight`, `getDeltaSeconds`, `halfLifeDays`.
- **Topic classification**: `src/lib/topic-classification.test.ts` — `ruleBasedTopicExtraction`, `getBestTopicId`, custom rules, `maxCandidates`.

Run: `npm run test -- --run src/lib/decay.test.ts src/lib/topic-classification.test.ts`

---

## 6. Data Models (reference)

- **narrative_topics**: id, company_id, name, is_embedding_cluster, decay_lambda, current_weight, base_weight, last_decay_time, created_at, updated_at.
- **narrative_events**: id, narrative_id (FK), company_id, source, platform, speaker_entity, speaker_role, audience_class, raw_text, authority_weight, credibility_proxy, decay_score, metadata (e.g. classification_rationale), created_at, updated_at.
- **ingestion_payloads**: id, company_id, source, payload (JSONB), ingested_at, status (pending | ingested | failed | retried), narrative_event_id (FK).

See `supabase/migrations/20250306000001_create_narrative_schema.sql` for full schema.

---

## 7. Canonical NarrativeEvent Model & Events API

### Events API

| Method | Path | Purpose |
|--------|------|--------|
| GET | /api/events?company_id=&start=&end=&limit=&source_id=&platform= | List narrative events for a company and time window; optional filters. |
| GET | /api/events/:event_id | Single narrative event by id (provenance, payload link). |

**Response shape (list):** `{ data: NarrativeEvent[], count: number }`. Use `(response?.data ?? []).map(...)` on the client.

### Ingestion (canonical)

| Method | Path | Purpose |
|--------|------|--------|
| POST | /api/ingest/news | Ingest news payload; idempotent by payload_id. |
| POST | /api/ingest/social | Ingest social payload; rate-limited. |
| POST | /api/ingest/transcripts | Ingest earnings transcripts (batched). |

Body: `company_id`, `platform`, `raw_text`, `published_at`; optional: `source_id`, `speaker_entity`, `speaker_role_inferred`, `audience_class`, `payload_id`.

### Replay

| Method | Path | Purpose |
|--------|------|--------|
| POST | /api/replay/payload | Replay single payload by `payload_id`; idempotent. |
| POST | /api/replay/window | Replay events in time window for `company_id`; idempotent. |

### IPI

| Method | Path | Purpose |
|--------|------|--------|
| POST | /api/ipi/calculate | Compute IPI for company + time window; returns score, components, top_narratives. |
| POST | /api/ipi/sandbox | Simulate IPI with custom weights (narrative, credibility, risk). |

### Testing Company View & Drill-down

1. **Company view** — Open `/dashboard/company/<companyId>?window=1W`. Confirm IPIBadge (score + delta) and IPI sparkline. Confirm Top contributing narratives and Event timeline; use Sandbox for simulated weights.
2. **Drill-down page** — Open `/dashboard/company/<companyId>/drill-down?window=1W`. Use NarrativeFilters (time window, source, platform). Confirm ReplayPanel and Narrative events list with NarrativeEventCard (immutable badge, provenance link).
3. **Admin audit logs** — Open `/admin/audit-logs`. Filter by event type, tenant, actor, date; view raw payload. Use Admin → Data Replay to trigger replay.

### Admin vs user flows (canonical)

- **Viewer**: Company view, drill-down, payload viewer; read-only.
- **Admin**: Same + audit logs, replay trigger, export.
- **Ingest**: POST /api/ingest/* (INGEST role); replay and admin require ADMIN.

### Extending: SSO and webhooks

- **SSO**: JWT carries roles (VIEWER, INGEST, ADMIN); enforce in Edge Functions for /api/ingest/*, /api/replay/*, /api/admin/*.
- **Webhooks**: Outbound after ingest/replay; inbound POST /webhooks/inbound to validate and call ingest logic.
