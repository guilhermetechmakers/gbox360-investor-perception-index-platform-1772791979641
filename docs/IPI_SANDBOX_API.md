# IPI Sandbox API

## Overview

The IPI (Investor Perception Index) API provides endpoints to get current IPI, historical timeseries, calculate IPI with optional weights, and run sandbox simulations. Provisional weights: Narrative 40%, Credibility 40%, Risk proxy 20%.

## Endpoints

### GET /ipi/current

Returns current IPI for a company and time window.

**Query params:**
- `company_id` or `companyId` (required)
- `window` (optional): `1D`, `1W`, `2W`, `30d`, `90d`, `1M`. Default `1W`.
- `windowStart`, `windowEnd` (optional): ISO date range instead of preset window.

**Response:**
```json
{
  "company_id": "string",
  "score": 72.5,
  "delta": 2.3,
  "narrative_component": 68.2,
  "credibility_component": 75.1,
  "risk_component": 70.0,
  "weights": { "narrative": 0.4, "credibility": 0.4, "risk": 0.2 },
  "window_start": "2025-03-01T00:00:00.000Z",
  "window_end": "2025-03-06T23:59:59.999Z",
  "computed_at": "2025-03-06T12:00:00.000Z",
  "breakdown": { ... }
}
```

### GET /ipi/timeseries

Returns IPI timeseries points for a company and window.

**Query params:** `company_id` or `companyId`, `window` (same as current).

**Response:** Array of `{ timestamp, score, narrative, credibility, risk }`.

### GET /ipi/historical

Returns historical IPI points for a date range.

**Query params:** `companyId` or `company_id`, `start`, `end` (YYYY-MM-DD or full ISO).

**Response:** Array of:
```json
{
  "timestamp": "2025-03-01T00:00:00.000Z",
  "totalIpi": 72.5,
  "narrativeScore": 68.2,
  "credibilityScore": 75.1,
  "riskScore": 70.0,
  "breakdown": { ... },
  "weights": { "narrative": 0.4, "credibility": 0.4, "risk": 0.2 }
}
```

### POST /ipi/calculate

Compute IPI for a company and time window.

**Request body:**
```json
{
  "companyId": "string",
  "timeWindowStart": "2025-03-01T00:00:00.000Z",
  "timeWindowEnd": "2025-03-06T23:59:59.999Z",
  "weights": {
    "narrative": 0.4,
    "credibility": 0.4,
    "risk": 0.2
  }
}
```

**Response:**
```json
{
  "totalScore": 72.5,
  "narrativeScore": 68.2,
  "credibilityScore": 75.1,
  "riskScore": 70.0,
  "weightsUsed": {
    "narrative": 0.4,
    "credibility": 0.4,
    "risk": 0.2
  },
  "breakdown": {
    "narrative": { "score": 68.2, "contribution": 27.28, "explanation": "..." },
    "credibility": { "score": 75.1, "contribution": 30.04, "explanation": "..." },
    "risk": { "score": 70.0, "contribution": 14.0, "explanation": "..." }
  },
  "explainability": ["Total score: 72.5 (weighted sum)", "..."],
  "provisionalNotice": "Weights are provisional and may be updated."
}
```

### POST /ipi/sandbox

Run simulations with different weight configurations.

**Request body:**
```json
{
  "companyId": "string",
  "timeWindowStart": "2025-03-01T00:00:00.000Z",
  "timeWindowEnd": "2025-03-06T23:59:59.999Z",
  "provisionalWeights": {
    "narrative": 0.5,
    "credibility": 0.35,
    "risk": 0.15
  },
  "scenarioName": "Custom",
  "scenarios": [
    { "name": "Default", "weights": { "narrative": 0.4, "credibility": 0.4, "risk": 0.2 } },
    { "name": "Narrative-heavy", "weights": { "narrative": 0.5, "credibility": 0.35, "risk": 0.15 } }
  ]
}
```

**Response:**
```json
[
  {
    "scenarioName": "Custom",
    "totalScore": 74.2,
    "narrativeScore": 68.2,
    "credibilityScore": 75.1,
    "riskScore": 70.0,
    "weightsUsed": { "narrative": 0.5, "credibility": 0.35, "risk": 0.15 },
    "breakdown": { ... },
    "explanation": "Total score: 74.2 (weighted sum)"
  },
  ...
]
```

### GET /narratives

Fetch narrative events within a time window.

**Query params:** `companyId`, `start`, `end`, `page?`, `limit?`

**Response:** Array of `NarrativeEvent` with `authority_weight` and `credibility_proxy` fields.

### GET /narratives/:id

Fetch a single narrative event by ID.

**Response:** `NarrativeEvent` with computed authority and credibility fields.

## Client-Side Fallback

When the API is unavailable, the frontend uses client-side engines (`src/lib/authority-weighting.ts`, `src/lib/credibility-proxy.ts`, `src/lib/ipi-scoring.ts`) with mock data. Results are deterministic for the same inputs.

## Security

- JWT-based authentication required
- Company-scoped authorization
- Audit logging for IPI computations and sandbox runs
