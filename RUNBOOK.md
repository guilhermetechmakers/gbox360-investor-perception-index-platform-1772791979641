# Drill-down & Explainability Toolkit — Runbook

This runbook describes how to test each panel, simulate admin vs user flows, and extend the system for SSO, webhooks, and additional integrations.

## Overview

- **Drill-down page** (`/dashboard/company/:companyId/drill-down`): "Why did this move?" — narratives, events, authority/credibility breakdown, raw payload panel, experiment panel, export.
- **Company View** (`/dashboard/company/:companyId`): IPI summary, directional change (↑/↓), top 3 narratives, event timeline, links to drill-down and payload viewer.
- **Payload viewer** (`/dashboard/payload/:eventId`): Event details, authority/credibility, raw payload with presigned URL download when available.
- **Admin Audit Logs** (`/admin/audit-logs`): Filters, table, export CSV/JSON, archival index, payload viewer modal.

---

## Testing Each Panel

### 1. Drill-down Explainability Page

**URL:** `/dashboard/company/<companyId>/drill-down?window=1W`

**Steps:**

1. Log in as a subscribed user. From Dashboard or Companies, select a company and open "Why did this move?" or go directly to the URL with a valid `companyId`.
2. **Company selector / date range:** Use the back link and the NarrativeFilters (time window, start/end, source, platform). Change `window` via query (e.g. `?window=30d`) and confirm data refreshes.
3. **IPI decomposition:** Bar chart shows Narrative / Credibility / Risk. If no IPI data, the card shows "No decomposition data."
4. **Authority breakdown:** Card shows authority sources and weights from `GET /ipi/explainability/authority-breakdown`. If the API returns empty, the card shows "No authority breakdown data for this window."
5. **Credibility proxy breakdown:** Card shows proxies from `GET /ipi/explainability/credibility-proxy`. Empty API → "No credibility proxy data for this window."
6. **Experiment panel:** Adjust Narrative / Credibility / Risk sliders (must sum to 100%). Hypothetical IPI updates after a short debounce. "Reset" is implied by refreshing the page or re-opening sandbox.
7. **Narrative decay-weighted scores:** Grid of narrative cards with decay gauges. Click "View details" if a drill-down panel is wired.
8. **Replay panel:** Shows event count; "Play" simulated replay depends on backend support.
9. **Narrative events table:** List of events with source, speaker, timestamp, authority/credibility, and "View payload" link. Empty state when no events.
10. **Raw payload panel:** List of payload refs derived from events. Use "View" (opens presigned URL in new tab) and "Download". "Search within payloads" runs `GET /payload/search?query=&companyId=` when the user focuses/searches.
11. **Export:** "CSV" exports narratives + events as CSV; "JSON" exports the same as JSON. Files are downloaded client-side.

**Simulating no data:** Use a companyId with no IPI/narratives/events, or a time window with no data. All lists and charts should show empty states without throwing.

### 2. Company View (IPI Summary)

**URL:** `/dashboard/company/<companyId>?window=1W`

**Steps:**

1. Log in, go to Company View for a company.
2. **IPI card:** Current score and directional change (↑/↓) via IPIBadge. Breakdown (Narrative / Credibility / Risk) and optional timeseries chart.
3. **Top 3 narratives:** Cards with decay-weighted score; click to open drill-down panel (if implemented).
4. **Event timeline:** Chronological events; each row has "View payload" linking to `/dashboard/payload/<eventId>`.
5. **Why did this move?:** Button links to `/dashboard/company/<companyId>/drill-down?window=...`.
6. **Export / Sandbox / Flag:** Export triggers IPI export API; Sandbox opens weight simulation modal; Flag is UI-only unless wired to `POST /payloads/flag`.

### 3. Payload Viewer

**URL:** `/dashboard/payload/<eventId>`

**Steps:**

1. From Company View or Drill-down, click "View payload" on an event.
2. **Computed fields:** Authority weight and credibility proxy.
3. **Event details:** Source, speaker, timestamps, raw text.
4. **Classification rationale:** Shown if present.
5. **Raw payload (audit):** JSON display. **Download:** Tries presigned URL via `GET /payload/:payloadId`; falls back to client-side JSON from `raw_payload` if no URL.

### 4. Admin Audit Logs

**URL:** `/admin/audit-logs`

**Prerequisite:** User must have admin role (e.g. `isAdmin` or equivalent).

**Steps:**

1. Log in as admin, go to Admin → Audit Logs.
2. **Filters:** Tenant, event types (INGESTION, EXPORT, WEIGHT_SIM, REPLAY), actor/search, date range, retention status. Change filters and confirm table updates.
3. **Table:** Date/time, event type, actor, tenant, event ID, payload ID, payload hash, description, retention, "View" payload. Click "View" to open PayloadViewerModal with raw payload.
4. **Export:** Select CSV or JSON, click export; file downloads when ready.
5. **Archival index:** Filter by event ID/source; table shows event_id, s3_key, archive timestamp, checksum, tenant, source. Event ID links to `/admin/drilldown/<eventId>`.

**Simulating non-admin:** Log in as a regular user; `/admin/*` should be guarded (e.g. AdminRouteGuard) and redirect or show "no access".

---

## Simulating Admin vs User Flows

| Flow | User role | Where | What to verify |
|------|-----------|--------|----------------|
| View IPI & drill-down | Subscribed user | Company View → Drill-down | Full explainability, export CSV/JSON, no admin-only actions |
| View payload | Subscribed user | Payload viewer | Presigned URL or inline JSON; download |
| Audit logs, export, archival | Admin | Admin Audit Logs | Filters, table, export, payload modal, archival index |
| Non-admin to admin routes | User | Navigate to `/admin/audit-logs` | Redirect or access denied |

---

## Extending for Additional Integrations

### SSO

- Auth is handled in `src/hooks/useAuth.ts` and auth pages. To add SSO:
  - Integrate IdP (e.g. SAML/OIDC) in the auth layer or Supabase Auth.
  - Ensure JWT or session includes `role`/`isAdmin` for AdminRouteGuard and DataAccessGuard.
  - No changes required inside the explainability API client; it uses the same `Authorization` header from `lib/api.ts`.

### Webhooks

- For outbound webhooks (e.g. on export or flag):
  - Prefer Supabase Edge Functions or a backend service that subscribes to DB events or API calls.
  - Do not call external webhooks directly from the client. Backend should call webhook URLs with secrets stored via `supabase secrets set` or env.

### New explainability endpoints

- **Add endpoint:** Implement on the backend (e.g. Supabase Edge Function or existing API). Then:
  1. Add types in `src/types/explainability.ts`.
  2. Add method in `src/api/explainability.ts` with defensive parsing (`Array.isArray`, `?? []`).
  3. Add a hook in `src/hooks/useExplainability.ts` if the data is used in UI.
  4. Use the hook in the relevant page (DrillDown, CompanyView, or Admin).

### Per-narrative provisional weights (experiments)

- The spec defines `POST /ipi/explainability/experiments` with `provisionalWeights: { narrativeId: number }`. The UI currently uses component-level weights (Narrative / Credibility / Risk) in ExperimentPanel and SandboxModal. To support per-narrative weights:
  1. Fetch top narratives (e.g. `useExplainabilityTopNarratives` or existing narratives with IDs).
  2. Add a section "Per-narrative weights" with a slider per narrative ID.
  3. On change, call `explainabilityApi.postExperiment({ companyId, start, end, provisionalWeights })` and display the returned `currentScore` and `delta`.

---

## API Contract Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/ipi/explainability/top-narratives?companyId=&start=&end=&limit=` | Top narratives with weights and refs |
| GET | `/ipi/explainability/events?narrativeId=&limit=` | Events for a narrative |
| GET | `/ipi/explainability/authority-breakdown?companyId=&start=&end=` | Authority sources and weights |
| GET | `/ipi/explainability/credibility-proxy?companyId=&start=&end=` | Credibility proxies |
| POST | `/ipi/explainability/experiments` | Hypothetical IPI with provisional weights |
| GET | `/payload/:payloadId` | Presigned URL or stream for payload |
| GET | `/payload/search?query=&companyId=` | Search payload refs |
| GET | `/audit/logs?companyId=&userId=&start=&end=` | Audit log entries |
| POST | `/audit/notes` | Add note to event |
| POST | `/payloads/flag` | Flag event |

All responses should be validated on the client; arrays default to `[]` and optional fields use defaults to avoid runtime errors.
