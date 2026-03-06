# Raw Payload Archival & Replay — Runbook

## Overview

This runbook describes how to test the Raw Payload Archival & Replay feature: admin audit logs (with archival index), admin drilldown, presigned URL generation, and single-event replay (dry-run / execute).

## Prerequisites

- Backend API running (or mock mode when `VITE_API_URL` is unset / API returns errors).
- Admin user with `audit_logs` (or equivalent) permission.
- Optional: Supabase migrations applied (`20250306120000_archive_index_replay_jobs.sql`) for archive_index and replay_jobs tables.

## Test Flows

### 1. Admin Audit Logs (`/admin/audit-logs`)

- **Purpose:** View immutable audit trail and archival index.
- **Steps:**
  1. Log in as admin and go to **Admin** → **Audit Logs** (or `/admin/audit-logs`).
  2. Use filters: Tenant, Event types, Actor, Search, Start/End date, Retention.
  3. Confirm table shows Date/Time, Event type, Actor, Tenant, Event ID, Payload ID, Description, Retention, Payload (View).
  4. Click **Event ID** (when present) to open **Admin Drilldown** for that event.
  5. Scroll to **Archival index** section.
  6. Optionally filter by Event ID or Source; confirm table shows Event ID (link to drilldown), S3 key, Archive timestamp, Checksum, Tenant, Source.
  7. Click an Event ID in the archival table to go to drilldown.

- **Admin vs user:** Only users with admin/audit permission see this page; others are blocked by `DataAccessGuard` / `AdminRouteGuard`.

### 2. Admin Drilldown (`/admin/drilldown/:eventId`)

- **Purpose:** Inspect a single NarrativeEvent, provenance, and generate a presigned URL for the raw payload.
- **Steps:**
  1. From Audit Logs, click an Event ID, or navigate to `/admin/drilldown/<uuid>`.
  2. Confirm **Narrative event** card shows: Event ID, Source, Platform, Speaker, Speaker role, Audience class, Created, Archived at, Checksum, Raw text snippet.
  3. If **Raw payload snippet** is present, confirm it displays.
  4. If **Provenance** exists, confirm JSON is shown.
  5. In **Presigned URL** card, click **Generate presigned URL** (enabled when archive index has s3_key).
  6. Confirm **Presigned URL panel** opens with URL and expiry; in mock mode, a mock message is shown.
  7. Use **Replay this event** to go to Data Replay with `?eventId=<id>` pre-filled.

- **Admin vs user:** Same as Audit Logs; requires admin route and audit permission.

### 3. Presigned URL Panel

- **Purpose:** Securely view raw payload via a temporary read-only URL.
- **Steps:**
  1. From Drilldown, generate a presigned URL.
  2. In the panel: copy URL, open in new tab (real backend only).
  3. If the URL is real (not mock), content may load in the panel; confirm copy content works.
  4. Close panel; generate again to get a new URL.

- **Access control:** Backend must enforce role/permission when generating the URL; UI only displays what the API returns.

### 4. Admin Data Replay (`/admin/data-replay`)

- **Purpose:** Replay by tenant/time window (existing) and by single event (new).
- **Steps:**

  **Single event replay:**
  1. Go to **Admin** → **Data Replay** (or `/admin/data-replay`).
  2. In **Single event replay**, enter an Event ID (or land with `?eventId=<uuid>` from drilldown).
  3. Click **Dry-run**: confirm predicted effects (and optional side effects) appear in the summary.
  4. Click **Execute**: confirm job is enqueued and status appears; when backend supports it, job status updates until COMPLETED/FAILED.

  **Time-window replay (existing):**
  1. Select Tenant and Time window.
  2. Run **Dry-run** or **Execute** and confirm preflight, progress, and job history behave as before.

- **Admin vs user:** Only admin/engineering roles; guarded by existing Data Access / Admin route.

## Simulating Admin vs User

- **Admin:** Use an account with role that passes `AdminRouteGuard` and `DataAccessGuard(permission="audit_logs")`. In dev mock, having `auth_token` in localStorage can be treated as admin.
- **User:** Use an account without admin role; navigate to `/admin/audit-logs` or `/admin/drilldown/...` — should be redirected or see access denied.

## API Contracts (for backend implementation)

- **POST /archive-payload** — Body: tenantId, companyId, eventId, source, platform, speakerEntity, speakerRole, audienceClass, rawText, provenance. Response: eventId, s3Key, archiveTimestamp, checksum.
- **GET /presigned-url** — Query: s3Key, role?, expiresSeconds?. Response: url, expiresAt, expiresInSeconds.
- **POST /replay** — Body: eventId, mode ("DRY_RUN" | "EXECUTE"). Response: jobId, status, message?, predictedEffects?, potentialSideEffects?.
- **GET /audit-logs/archive** — Query: tenantId?, source?, eventId?, start?, end?, page?, pageSize?. Response: data/items (ArchiveIndexEntry[]), count, page, pageSize.
- **GET /drilldown/:eventId** — Response: event (NarrativeEventArchival), archiveIndex, rawPayloadSnippet.

## Extending for SSO / Webhooks

- **SSO:** Auth is already centralized; ensure JWT or session includes roles/scopes (e.g. `audit_logs`, `replay`). Backend presigned-url and replay endpoints should validate these scopes.
- **Webhooks:** Add a webhook endpoint (e.g. POST /webhooks/archive) that receives ingestion events, validates signature, then calls the same logic as POST /archive-payload. Keep secrets in env (e.g. Supabase secrets) and never expose in the client.

## Troubleshooting

- **Archival index empty:** Backend may not implement GET /audit-logs/archive yet; frontend falls back to empty list. Run archive-payload or populate archive_index in DB to see data.
- **Drilldown 404 or empty event:** GET /drilldown/:eventId may return mock or 404; ensure event exists in narrative_events and, if using archive_index, that a row exists for that event_id.
- **Presigned URL mock:** If API returns a URL starting with `#mock-`, the panel shows mock message; configure real S3 and presigned-url endpoint for production.
