# Gbox360 — Investor Perception Index Platform

This project was created with ScopesFlow automation.

## 404 Not Found Page

The 404 page (`/404`) provides an enterprise-grade error experience with integrated Search & Filter discovery. When users land on a non-existent route, they see:

- **ErrorHero** — Friendly "We can't find that page" message with serif typography
- **ActionBar** — Go to Dashboard (primary) and Go to Landing Page (secondary)
- **TypeaheadSearchModule** — Company search with debounced API calls and null-safe rendering
- **FilterPanel** — Date range, event type, and timeline preset filters for NarrativeEvents/IPI
- **ResultsPreviewCard** — Quick access to companies; shows top 5 when data is available
- **FloatingPromotionalCard** — Brown gradient CTA linking to About & Help

### Extending the 404 Page

To add discovery components:

1. **Search**: The `TypeaheadSearchModule` uses `useCompanySearch` and `companiesApi.search`. Add a `limit` param or new filters in `src/api/companies.ts`.
2. **Filters**: Extend `FilterPanel`'s `FilterState` and wire `onFiltersChange` to fetch timeline data via `ipiApi.getTimelines(companyId, { from, to, types })`.
3. **Results**: Pass filtered data to `ResultsPreviewCard` when a company is selected and filters are applied. Use `ipiApi.getEvents` or `getTimelines` for NarrativeEvent lists.
4. **API fallbacks**: All components guard against null/undefined. Use `(data ?? []).map(...)` and `Array.isArray(response?.data) ? response.data : []` for safe rendering.

---

## IPI (Investor Perception Index) & Sandbox API

### Overview

The Authority Weighting & Credibility Proxy subsystem computes the Investor Perception Index from narrative events. Weights are **provisional** (default: Narrative 40%, Credibility 40%, Risk 20%). All outputs include a provisional notice.

### API Endpoints

Base URL: `VITE_API_URL` (e.g. `http://localhost:3000/api` or `https://<project>.supabase.co/functions/v1/api`).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ipi/calculate` | Compute IPI for a company and time window with optional weights |
| POST | `/ipi/sandbox` | Run simulations; returns at least 3 scenarios (Default, Narrative-heavy, Credibility-heavy) plus optional Custom |
| GET | `/narratives?companyId=&start=&end=` | List narrative events in window |
| GET | `/narratives/:id` or `/narratives?id=` | Single narrative event with authority_weight and credibility_proxy |

### POST /ipi/calculate

**Request:** `{ companyId, timeWindowStart, timeWindowEnd, weights?: { narrative, credibility, risk } }`  
**Response:** `{ totalScore, narrativeScore, credibilityScore, riskScore, weightsUsed, breakdown, explainability, provisionalNotice }`

### POST /ipi/sandbox

**Request:** `{ companyId, timeWindowStart, timeWindowEnd, provisionalWeights?, scenarioName?, scenarios? }`  
**Response:** Array of `{ scenarioName, totalScore, narrativeScore, credibilityScore, riskScore, weightsUsed, breakdown, explanation }`. At least 3 scenarios when no custom weights; Custom + 3 defaults when provisionalWeights is sent.

### GET /narratives

Query: `companyId`, `start`, `end`. Returns array of narrative events. Use `data ?? []` on the client.

### GET /narratives/:id

Returns one narrative event with computed fields for drill-down and payload viewer.

### Testing

- **Unit tests:** `npm run test` runs authority-weighting, credibility-proxy, ipi-scoring, and ingestion tests.
- **Sandbox UI:** Company view or Drill-down → Sandbox → adjust sliders and run simulations.

### Supabase Edge Function

Deploy: `supabase functions deploy api`. Set `VITE_API_URL` to `https://<project-ref>.supabase.co/functions/v1/api`.
