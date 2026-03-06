# IPI Scoring Engine & Weights Management — Runbook

This runbook describes how to test each IPI panel and flow, how to simulate admin vs user behaviour, and how to extend for additional integrations (SSO, webhooks).

## Overview

- **Provisional weights:** Narrative 40%, Credibility 40%, Risk proxy 20%. Clearly labeled in UI and logs.
- **API base:** `VITE_API_URL` (e.g. Supabase Edge Function at `/functions/v1/api`).
- **Key routes:** Dashboard (`/dashboard`), Company View (`/dashboard/company/:companyId`), Drill-down (`/dashboard/company/:companyId/drill-down`).

---

## 1. Testing Each Panel

### Global Dashboard

- **Path:** `/dashboard`
- **IPI Score Card:** Shows current IPI for the **first watched company** (from watchlist), delta, timestamp, and "Provisional" badge. If watchlist is empty, the card is hidden.
- **Actions:** "View company", "Why did this move?" (drill-down).
- **Validation:** Ensure `useIPICurrent(companyId, "1W")` is called with the first watched company id. Skeleton while loading; score and delta from `GET /ipi/current?company_id=&window=1W`.

### Company View

- **Path:** `/dashboard/company/:companyId?window=1W`
- **Panels:** IPI card (score, delta, trend line), breakdown (Narrative / Credibility / Risk), top 3 narratives, event timeline, Sandbox button, "Why did this move?" link.
- **Time window:** Use `CompanyTimeWindowSelect` (1D, 1W, 2W, 30d, 90d, 1M) and/or `DateRangePicker` (start/end). Changing window refetches IPI and narratives.
- **Validation:** `GET /ipi/current`, `GET /ipi/timeseries`, `GET /ipi/calculate` (for breakdown), `GET /ipi/narratives?top=3`, `GET /ipi/events` or narratives by range. All array responses guarded with `data ?? []` / `Array.isArray(...)`.

### Drill-down ("Why did this move?")

- **Path:** `/dashboard/company/:companyId/drill-down?window=1W`
- **Panels:** IPI decomposition bar chart, Experiment panel (sandbox), narrative decay-weighted scores, Replay panel, Narrative events list (with source, authority, credibility, immutable indicator).
- **Filters:** Source, platform, time window. Events from `GET /events?companyId=&start=&end=` or `GET /ipi/events`.
- **Validation:** Each event shows provenance; "Open Admin Replay" links to `/admin/data-replay`.

### Sandbox (Weight Sandbox Drawer/Modal)

- **Path:** Opened from Company View or Drill-down via "Sandbox" button.
- **Actions:** Adjust sliders for Narrative %, Credibility %, Risk % (sum should be 100 for validation). "Run simulations" calls `POST /ipi/sandbox` with `companyId`, `timeWindowStart`, `timeWindowEnd`, `provisionalWeights`.
- **Response:** Array of scenarios (e.g. Custom, Default, Narrative-heavy, Credibility-heavy) with totalScore and breakdown. Displayed in bar chart and list.
- **Validation:** Weights in [0, 1]; API normalizes if sum ≠ 1. Sandbox does **not** mutate stored IPI.

### Replay / Audit Console

- **Path:** Drill-down page → "Replay controls" card → "Open Admin Replay" → `/admin/data-replay`.
- **Admin Data Replay:** Filter by tenant (company), window, payload. Trigger replay (idempotent). NarrativeEvent store is append-only; replay replays events for audit/recompute.
- **Validation:** Events fetched by time range and optional source/platform; provenance (batchId, version, ingestionSource) visible where supported.

---

## 2. Simulating Admin vs User Flows

- **Viewer / Analyst:** Can view Dashboard, Company View, Drill-down, Sandbox. Can run sandbox simulations. Cannot access `/admin/*` (audit logs, data replay, user management).
- **Admin:** Same as above plus Admin layout: Audit logs, Data Replay, User Management. Data Replay allows triggering ingestion replay for a company/window.
- **Simulating admin:** Use an account with role in `ADMIN_ROLES` (see auth/guards). Or mock `useCurrentUser()` / auth API to return `role: 'admin'`.
- **Simulating user:** Use a non-admin role; Team tab in Settings and Admin routes are hidden or guarded.

---

## 3. Extending for Additional Integrations

### SSO

- Auth is handled by Supabase Auth (or existing auth layer). SSO (e.g. SAML, OIDC) would be configured at the auth provider; after login, JWT is sent in `Authorization` for API calls. IPI endpoints use the same JWT; no IPI-specific SSO changes. Document SSO provider setup in auth runbook.

### Webhooks

- **Outbound:** To notify external systems when IPI is updated, add a webhook dispatch in the IPI computation pipeline (e.g. after persisting IpiRecord or after scheduled precompute). Store webhook URLs in settings; call with payload `{ companyId, windowStart, windowEnd, totalIpi, breakdown }`. Use Edge Function or background job to avoid blocking the request.
- **Inbound:** NarrativeEvent ingestion already supports `POST /ingestEvent`. For batch ingestion from external systems, add an Edge Function that accepts an array of events, validates each with Zod, deduplicates by provenance/batchId, and inserts into narrative_events (append-only). Idempotency key: `batchId + eventId`.

### Rate Limiting

- Sandbox API: Apply rate limiting per user (e.g. 60 requests/minute) in the Edge Function or API gateway to prevent abuse. Return 429 with Retry-After when exceeded.

---

## 4. API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ipi/current?company_id=&window=` | Current IPI score, delta, breakdown, provisional weights |
| GET | `/ipi/timeseries?company_id=&window=` | Timeseries points (timestamp, score, narrative, credibility, risk) |
| GET | `/ipi/historical?companyId=&start=&end=` | Historical IPI points for date range |
| POST | `/ipi/calculate` | Compute IPI with optional weights (body: companyId, timeWindowStart, timeWindowEnd, weights?) |
| POST | `/ipi/sandbox` | Run sandbox with custom weights (body: companyId, timeWindowStart, timeWindowEnd, provisionalWeights, scenarioName?, scenarios?) |
| GET | `/narratives?companyId=&start=&end=` | Narratives with decay-weighted scores or raw events |
| GET | `/events?companyId=&start=&end=&source=&platform=&limit=` | NarrativeEvent list with filters |

---

## 5. Data Safety (Runtime)

- All Supabase/API array results: `const items = data ?? []`.
- Array methods: `(items ?? []).map(...)` or `Array.isArray(items) ? items.map(...) : []`.
- React state: `useState<Type[]>([])`.
- API responses: `const list = Array.isArray(response?.data) ? response.data : []`.
- Optional chaining and destructuring with defaults throughout.

---

## 6. Key Files

- **Frontend:** `src/pages/Dashboard.tsx`, `CompanyView.tsx`, `DrillDown.tsx`; `src/components/ipi/*` (IPIScoreCard, IPIBadge, SandboxModal, IPIBreakdownPanel); `src/hooks/useIPI.ts`; `src/api/ipi.ts`.
- **Backend (Edge Function):** `supabase/functions/api/index.ts` (GET ipi/current, ipi/timeseries, ipi/historical, POST ipi/calculate, ipi/sandbox, GET narratives, GET events, POST ingestEvent).
- **Scoring / authority / credibility:** `src/lib/ipi-scoring.ts`, `src/lib/authority-weighting.ts`, `src/lib/credibility-proxy.ts`, `src/lib/narrative-event.ts`.
- **Types:** `src/types/ipi.ts`, `src/types/narrative.ts`.
