# Data Ingestion Runbook

This runbook describes how to test the resilient data ingestion subsystem (admin dashboard, data replay, audit logs, DLQ) and how to simulate admin vs user flows.

## Prerequisites

- Backend: Supabase project with migrations applied (`supabase db push` or run migrations `20250306150000_ingestion_idempotency_dlq_archive.sql`).
- Frontend: `VITE_API_URL` pointing to your API (e.g. Supabase Edge Functions URL for the `api` function).
- Auth: Admin routes are protected by `AdminRouteGuard`; use an account with admin role to access `/admin`.

## Testing Each Panel

### 1. Admin Dashboard (`/admin`)

- **Ingestion sources**: Three cards (News, Social, Earnings transcripts) show status, last run, 24h throughput, and DLQ count. If the ingestion status API is unavailable, default “healthy” state and zeros are shown.
- **Trigger news**: Click “Trigger news” on the News card to call `GET /ingest/news`. Success shows a toast with ingested count (or “News ingestion triggered”).
- **DLQ link**: When a source has `dlqCount > 0`, a “View” link goes to `/admin/audit-logs` (DLQ section is on the same page).
- **Health check**: “Run Health Check” and “Access Audit Logs” behave as before; ingestion source cards use `GET /ingestion/status`.

### 2. Data Replay (`/admin/data-replay`)

- **Replay NarrativeEvent range** (new card):
  - **Source**: Select “All sources”, “News”, “Social”, or “Earnings transcripts”.
  - **Since**: Pick a date (defaults to scope start). Used as `since` for `POST /replay/events`.
  - **Replay events**: Button sends `POST /replay/events?since=<date>T00:00:00.000Z&source=<source>&eventId=<optional>`.
- **Scope**: Existing tenant and time window still drive preflight and dry-run/execute.
- **Single event replay**: Unchanged; event ID + Dry-run/Execute.

### 3. Audit Logs (`/admin/audit-logs`)

- **Dead-letter queue** (new section):
  - **Source**: Select “News”, “Social”, or “Earnings transcripts”. Table lists DLQ entries for that source (`GET /dlq/:source`).
  - Columns: Idempotency key, Error, Retries, Last attempted, Action.
  - **Retry**: “Retry” calls `POST /dlq/:source/retry/:key`. On success, list is invalidated and a toast is shown.
- **Existing filters**: Tenant, event types, actor, date range, retention, and archival index remain unchanged.

## Simulating Admin vs User Flows

- **Admin**: Log in with an admin-capable account. Navigate to `/admin`. All ingestion panels (dashboard source cards, data replay, audit logs DLQ) are admin-only.
- **User (non-admin)**: Log in as a regular user. Access to `/admin` is blocked by `AdminRouteGuard`; redirect to login or home. No access to ingestion status, DLQ, or replay triggers.

## API Endpoints Used

| Purpose              | Method | Endpoint                          | Notes                                      |
|----------------------|--------|-----------------------------------|--------------------------------------------|
| Ingestion status     | GET    | `/ingestion/status`               | Sources health, DLQ counts                 |
| Social read          | GET    | `/social/twitter/read`             | Stub without Twitter API key               |
| Earnings batch       | POST   | `/ingest/earnings-transcripts`     | batchId, provider, transcripts[]           |
| News trigger         | GET    | `/ingest/news`                    | source, since, limit                        |
| DLQ list             | GET    | `/dlq/:source`                     | news, social, earnings_transcripts          |
| DLQ retry            | POST   | `/dlq/:source/retry/:key`          | key = idempotency_key                       |
| Replay events        | POST   | `/replay/events?since=&source=&eventId=` | Queues replay job                    |

## Extending for SSO and Webhooks

- **SSO**: Admin auth is handled by the same auth layer as the rest of the app. To add SSO for admins, configure your IdP and map admin role in the JWT or session; `AdminRouteGuard` and backend should allow access based on that role.
- **Webhooks**: For “ingestion complete” or “DLQ alert” webhooks:
  1. Add a webhook URL config (e.g. in settings or env).
  2. From the Edge Function (or worker), after processing a batch or on DLQ insert, call the webhook with a signed payload.
  3. Optionally add a “Test webhook” action in the admin UI that triggers a sample payload.

## Data Safety

- All list responses use `data ?? []` or `safeArray()` on the client.
- DLQ and ingestion status APIs return `{ items: [], count: 0 }` on error or missing data.
- Buttons that trigger mutations are disabled while `isPending` to avoid double submits.
