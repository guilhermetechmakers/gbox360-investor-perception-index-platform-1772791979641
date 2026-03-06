# IPI Sandbox API

## Overview

The IPI (Investor Perception Index) API provides endpoints to calculate and simulate the Investor Perception Index with provisional weights. Weights are: Narrative 40%, Credibility 40%, Risk proxy 20%.

## Endpoints

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
