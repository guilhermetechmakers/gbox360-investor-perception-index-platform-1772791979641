/**
 * Supabase Edge Function: IPI & Narratives API
 * Routes: POST /ipi/calculate, POST /ipi/sandbox, GET /narratives, GET /narratives/:id
 * JWT auth optional; use Authorization: Bearer <token> for company-scoped access.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Inline authority weights (Analyst > Media > Retail)
const BASE_AUTHORITY: Record<string, number> = {
  Analyst: 0.9,
  Media: 0.6,
  Retail: 0.3,
}
const DEFAULT_WEIGHT = 0.1
function getAuthorityWeight(sourceType: string | null | undefined): number {
  const s = String(sourceType ?? "").trim()
  if (!s) return DEFAULT_WEIGHT
  return BASE_AUTHORITY[s] ?? DEFAULT_WEIGHT
}

// Credibility proxy: simple heuristic from text length and source
function credibilityProxy(rawText: string | null | undefined, sourceType: string): number {
  const t = String(rawText ?? "").trim()
  const base = t.length > 100 ? 0.7 : t.length > 30 ? 0.5 : 0.3
  const mod = sourceType === "Analyst" ? 1.1 : sourceType === "Media" ? 1.0 : 0.9
  return Math.min(1, Math.max(0, base * mod))
}

// Decay from created_at
function decayScore(createdAt: string | null | undefined): number {
  if (!createdAt) return 1
  const days = (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
  return Math.pow(0.5, days / 14)
}

const DEFAULT_IPI_WEIGHTS = { narrative: 0.4, credibility: 0.4, risk: 0.2 }

function normalizeWeights(w: { narrative?: number; credibility?: number; risk?: number } | null | undefined) {
  const n = Number(w?.narrative) || 0
  const c = Number(w?.credibility) || 0
  const r = Number(w?.risk) || 0
  const sum = n + c + r
  if (sum <= 0) return DEFAULT_IPI_WEIGHTS
  return { narrative: n / sum, credibility: c / sum, risk: r / sum }
}

function aggregateNarrative(events: Array<{ authority_weight: number; credibility_proxy: number; decay_score?: number }>) {
  if (!events?.length) return 0
  const sum = events.reduce((a, e) => a + (Number(e.authority_weight) || 0) * 0.5 + (Number(e.credibility_proxy) || 0) * 0.5 * (Number(e.decay_score) ?? 1), 0)
  return Math.min(100, Math.max(0, (sum / events.length) * 100))
}

function aggregateCredibility(events: Array<{ credibility_proxy: number }>) {
  if (!events?.length) return 0
  const sum = events.reduce((a, e) => a + (Number(e.credibility_proxy) || 0), 0)
  return Math.min(100, Math.max(0, (sum / events.length) * 100))
}

function riskProxy(events: Array<{ credibility_proxy: number }>) {
  if (!events?.length) return 0
  const creds = events.map((e) => Number(e.credibility_proxy) || 0).filter(Boolean)
  if (!creds.length) return 0
  const mean = creds.reduce((a, b) => a + b, 0) / creds.length
  const variance = creds.reduce((a, c) => a + (c - mean) ** 2, 0) / creds.length
  const std = Math.sqrt(variance)
  return Math.min(100, Math.max(0, (1 - Math.min(1, std * 2)) * 100))
}

function computeIPI(
  events: Array<{ authority_weight: number; credibility_proxy: number; decay_score?: number }>,
  weights?: { narrative?: number; credibility?: number; risk?: number } | null
) {
  const w = normalizeWeights(weights ?? DEFAULT_IPI_WEIGHTS)
  const list = Array.isArray(events) ? events : []
  const narrativeScore = aggregateNarrative(list)
  const credibilityScore = aggregateCredibility(list)
  const riskScore = riskProxy(list)
  const totalScore = narrativeScore * w.narrative + credibilityScore * w.credibility + riskScore * w.risk
  return {
    totalScore: Math.round(totalScore * 10) / 10,
    narrativeScore: Math.round(narrativeScore * 10) / 10,
    credibilityScore: Math.round(credibilityScore * 10) / 10,
    riskScore: Math.round(riskScore * 10) / 10,
    weightsUsed: w,
    breakdown: {
      narrative: { score: narrativeScore, contribution: narrativeScore * w.narrative, explanation: `Narrative from ${list.length} events.` },
      credibility: { score: credibilityScore, contribution: credibilityScore * w.credibility, explanation: `Credibility from ${list.length} events.` },
      risk: { score: riskScore, contribution: riskScore * w.risk, explanation: `Risk proxy from ${list.length} sources.` },
    },
    explainability: [`Weights: Narrative ${(w.narrative * 100).toFixed(0)}%, Credibility ${(w.credibility * 100).toFixed(0)}%, Risk ${(w.risk * 100).toFixed(0)}%. Provisional.`],
    provisionalNotice: "Weights are provisional and may be updated.",
  }
}

async function getNarrativesFromDb(supabase: ReturnType<typeof createClient>, companyId: string, start: string, end: string) {
  const { data, error } = await supabase
    .from("narrative_events")
    .select("*")
    .eq("company_id", companyId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
  if (error) return []
  const rows = data ?? []
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    company_id: r.company_id,
    source_platform: r.source_platform ?? "unknown",
    speaker_entity: r.speaker_entity ?? "unknown",
    speaker_role: r.speaker_role,
    audience_class: r.audience_class,
    raw_text: r.raw_text ?? "",
    created_at: r.created_at,
    authority_weight: Number(r.authority_weight) ?? getAuthorityWeight(r.source_type as string),
    credibility_proxy: Number(r.credibility_proxy) ?? credibilityProxy(r.raw_text as string, String(r.source_type ?? "Retail")),
    topic_classification: r.topic_classification,
    decay_score: Number(r.decay_score) ?? decayScore(r.created_at as string),
    raw_payload: r.raw_payload,
  }))
}

async function getNarrativeById(supabase: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await supabase.from("narrative_events").select("*").eq("id", id).single()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  return {
    id: r.id,
    company_id: r.company_id,
    source_platform: r.source_platform ?? "unknown",
    speaker_entity: r.speaker_entity ?? "unknown",
    speaker_role: r.speaker_role,
    audience_class: r.audience_class,
    raw_text: r.raw_text ?? "",
    created_at: r.created_at,
    authority_weight: Number(r.authority_weight) ?? getAuthorityWeight(r.source_type as string),
    credibility_proxy: Number(r.credibility_proxy) ?? credibilityProxy(r.raw_text as string, String(r.source_type ?? "Retail")),
    topic_classification: r.topic_classification,
    decay_score: Number(r.decay_score) ?? decayScore(r.created_at as string),
    raw_payload: r.raw_payload,
  }
}

// Mock events when DB has no narrative_events table or no rows
function mockEvents(companyId: string): Array<{ authority_weight: number; credibility_proxy: number; decay_score: number }> {
  const now = new Date().toISOString()
  return [
    { authority_weight: 0.9, credibility_proxy: 0.75, decay_score: 0.95 },
    { authority_weight: 0.6, credibility_proxy: 0.6, decay_score: 0.9 },
    { authority_weight: 0.3, credibility_proxy: 0.65, decay_score: 1 },
  ]
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const pathPartsFull = url.pathname.split("/").filter(Boolean)
  const apiIndex = pathPartsFull.indexOf("api")
  const path = apiIndex >= 0 ? pathPartsFull.slice(apiIndex + 1).join("/") : url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")
  const pathSegments = path.split("/").filter(Boolean)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

  try {
    // POST /ipi/calculate
    if (req.method === "POST" && (path === "ipi/calculate" || (pathSegments[0] === "ipi" && pathSegments[1] === "calculate"))) {
      const body = await req.json().catch(() => ({})) as { companyId?: string; timeWindowStart?: string; timeWindowEnd?: string; weights?: { narrative?: number; credibility?: number; risk?: number } }
      const companyId = String(body?.companyId ?? "").trim()
      const start = String(body?.timeWindowStart ?? "").trim()
      const end = String(body?.timeWindowEnd ?? "").trim()
      let events: Array<{ authority_weight: number; credibility_proxy: number; decay_score?: number }> = []
      if (supabase && companyId && start && end) {
        const rows = await getNarrativesFromDb(supabase, companyId, start, end)
        events = rows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
      }
      if (events.length === 0) events = mockEvents(companyId || "default")
      const result = computeIPI(events, body?.weights)
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // POST /ipi/sandbox
    if (req.method === "POST" && (path === "ipi/sandbox" || (pathSegments[0] === "ipi" && pathSegments[1] === "sandbox"))) {
      const body = await req.json().catch(() => ({})) as { companyId?: string; timeWindowStart?: string; timeWindowEnd?: string; provisionalWeights?: { narrative: number; credibility: number; risk: number }; scenarioName?: string; scenarios?: Array<{ name: string; weights: { narrative: number; credibility: number; risk: number } }> }
      const companyId = String(body?.companyId ?? "").trim()
      const start = String(body?.timeWindowStart ?? "").trim()
      const end = String(body?.timeWindowEnd ?? "").trim()
      let events: Array<{ authority_weight: number; credibility_proxy: number; decay_score?: number }> = []
      if (supabase && companyId && start && end) {
        const rows = await getNarrativesFromDb(supabase, companyId, start, end)
        events = rows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
      }
      if (events.length === 0) events = mockEvents(companyId || "default")
      const defaultScenarios = [
        { name: "Default", weights: { narrative: 0.4, credibility: 0.4, risk: 0.2 } },
        { name: "Narrative-heavy", weights: { narrative: 0.5, credibility: 0.35, risk: 0.15 } },
        { name: "Credibility-heavy", weights: { narrative: 0.35, credibility: 0.5, risk: 0.15 } },
      ]
      const scenarios = Array.isArray(body?.scenarios) && body.scenarios.length > 0
        ? body.scenarios
        : body?.provisionalWeights
          ? [{ name: body.scenarioName ?? "Custom", weights: body.provisionalWeights }, ...defaultScenarios]
          : defaultScenarios
      const results = scenarios.map((s) => {
        const r = computeIPI(events, s.weights)
        return { scenarioName: s.name, totalScore: r.totalScore, narrativeScore: r.narrativeScore, credibilityScore: r.credibilityScore, riskScore: r.riskScore, weightsUsed: r.weightsUsed, breakdown: r.breakdown, explanation: r.explainability?.[0] }
      })
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // GET /narratives?companyId=&start=&end= or GET /narratives?id=
    if (req.method === "GET" && (pathSegments[0] === "narratives" || path === "narratives")) {
      const id = url.searchParams.get("id") ?? (pathSegments[1] && pathSegments[1] !== "narratives" ? pathSegments[1] : null)
      if (id) {
        const one = supabase ? await getNarrativeById(supabase, id) : null
        const payload = one ?? { id, message: "Narrative not found or DB not configured." }
        return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }
      const companyId = url.searchParams.get("companyId") ?? ""
      const start = url.searchParams.get("start") ?? ""
      const end = url.searchParams.get("end") ?? ""
      let list: unknown[] = []
      if (supabase && companyId && start && end) list = await getNarrativesFromDb(supabase, companyId, start, end)
      if (list.length === 0) {
        list = mockEvents(companyId || "default").map((e, i) => ({
          event_id: `mock-${i}`,
          company_id: companyId || "default",
          source_platform: "mock",
          speaker_entity: "System",
          raw_text: "",
          created_at: new Date().toISOString(),
          authority_weight: e.authority_weight,
          credibility_proxy: e.credibility_proxy,
          decay_score: e.decay_score,
        }))
      }
      return new Response(JSON.stringify(list), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify({ error: "Not Found", path }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
