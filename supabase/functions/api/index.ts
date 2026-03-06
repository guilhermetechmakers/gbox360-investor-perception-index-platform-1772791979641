/**
 * Supabase Edge Function: IPI & Narratives API
 * Routes: POST /ipi/calculate, POST /ipi/sandbox, GET /narratives, GET /narratives/:id,
 *        POST /ingestEvent, GET /narratives/:id/events, POST /narratives/:id/resolve, GET /healthz
 * JWT auth optional; use Authorization: Bearer <token> for company-scoped access.
 * Topic Classification: rule-based keywords; embedding-based clustering optional (OpenAI/Cohere).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Rule-based topic keywords -> topic names
const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Earnings & Financials": ["earnings", "revenue", "profit", "margin", "guidance", "quarterly", "annual"],
  "ESG & Sustainability": ["esg", "sustainability", "carbon", "emissions", "climate", "green"],
  "M&A & Strategy": ["acquisition", "merger", "divestiture", "strategic", "partnership", "deal"],
  "Leadership & Governance": ["ceo", "cfo", "board", "governance", "executive", "leadership"],
  "Market Sentiment": ["bullish", "bearish", "outperform", "upgrade", "downgrade", "rating"],
  "Regulatory": ["sec", "regulation", "compliance", "fda", "approval", "litigation"],
}

const DEFAULT_TOPIC = "General"

function ruleBasedTopicExtraction(text: string): { topicName: string; confidence: number }[] {
  const t = String(text ?? "").toLowerCase().trim()
  if (!t) return [{ topicName: DEFAULT_TOPIC, confidence: 0.5 }]
  const results: { topicName: string; confidence: number }[] = []
  for (const [topicName, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matches = keywords.filter((k) => t.includes(k.toLowerCase()))
    if (matches.length > 0) {
      results.push({ topicName, confidence: Math.min(1, 0.5 + matches.length * 0.15) })
    }
  }
  if (results.length === 0) results.push({ topicName: DEFAULT_TOPIC, confidence: 0.5 })
  return results.sort((a, b) => b.confidence - a.confidence)
}

// Authority weights (Analyst > Media > Retail)
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

function credibilityProxy(rawText: string | null | undefined, sourceType: string): number {
  const t = String(rawText ?? "").trim()
  const base = t.length > 100 ? 0.7 : t.length > 30 ? 0.5 : 0.3
  const mod = sourceType === "Analyst" ? 1.1 : sourceType === "Media" ? 1.0 : 0.9
  return Math.min(1, Math.max(0, base * mod))
}

function decayScore(createdAt: string | null | undefined): number {
  if (!createdAt) return 1
  const days = (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
  return Math.pow(0.5, days / 14)
}

// Exponential decay: weight = base_weight * exp(-lambda * delta_seconds)
const DEFAULT_DECAY_LAMBDA = 0.01
function computeDecayedWeight(
  baseWeight: number,
  lastDecayTime: string | null | undefined,
  lambda: number = DEFAULT_DECAY_LAMBDA
): number {
  if (!lastDecayTime) return baseWeight
  const deltaSeconds = (Date.now() - new Date(lastDecayTime).getTime()) / 1000
  return Math.max(0, baseWeight * Math.exp(-lambda * deltaSeconds))
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
    source_platform: r.source_platform ?? r.source ?? "unknown",
    speaker_entity: r.speaker_entity ?? "unknown",
    speaker_role: r.speaker_role,
    audience_class: r.audience_class,
    raw_text: r.raw_text ?? "",
    created_at: r.created_at,
    authority_weight: Number(r.authority_weight) ?? getAuthorityWeight(r.source_type as string),
    credibility_proxy: Number(r.credibility_proxy) ?? credibilityProxy(r.raw_text as string, String(r.source_type ?? r.source ?? "Retail")),
    topic_classification: r.topic_classification,
    decay_score: Number(r.decay_score) ?? decayScore(r.created_at as string),
    raw_payload: r.raw_payload ?? r.metadata,
    narrative_id: r.narrative_id,
  }))
}

async function getNarrativeTopicsWithDecay(supabase: ReturnType<typeof createClient>, companyId: string, start: string, end: string) {
  const { data: topics, error: topicsErr } = await supabase
    .from("narrative_topics")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false })
  if (topicsErr || !topics?.length) return []
  const rows = topics ?? []
  const result: Array<{
    id: string
    name: string
    weight: number
    decay_lambda: number
    lastUpdated: string
    topEvents: Array<{ id: string; raw_text: string; source: string; speaker_entity: string; created_at: string; authority_weight: number; credibility_proxy: number }>
    event_count: number
  }> = []
  for (const t of rows) {
    const topic = t as Record<string, unknown>
    const topicId = String(topic.id ?? "")
    const baseWeight = Number(topic.base_weight ?? 1)
    const lambda = Number(topic.decay_lambda ?? DEFAULT_DECAY_LAMBDA)
    const lastDecay = topic.last_decay_time as string
    const weight = computeDecayedWeight(baseWeight, lastDecay, lambda)
    const { data: events } = await supabase
      .from("narrative_events")
      .select("id, raw_text, source, platform, speaker_entity, created_at, authority_weight, credibility_proxy")
      .eq("narrative_id", topicId)
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false })
      .limit(5)
    const eventList = Array.isArray(events) ? events : []
    const { count } = await supabase
      .from("narrative_events")
      .select("id", { count: "exact", head: true })
      .eq("narrative_id", topicId)
      .gte("created_at", start)
      .lte("created_at", end)
    result.push({
      id: topicId,
      name: String(topic.name ?? "Unknown"),
      weight,
      decay_lambda: lambda,
      lastUpdated: String(topic.updated_at ?? topic.last_decay_time ?? new Date().toISOString()),
      topEvents: eventList.map((e: Record<string, unknown>) => ({
        id: String(e.id ?? ""),
        raw_text: String(e.raw_text ?? ""),
        source: String(e.source ?? e.platform ?? "—"),
        speaker_entity: String(e.speaker_entity ?? "—"),
        created_at: String(e.created_at ?? ""),
        authority_weight: Number(e.authority_weight ?? 0),
        credibility_proxy: Number(e.credibility_proxy ?? 0),
      })),
      event_count: typeof count === "number" ? count : eventList.length,
    })
  }
  return result.sort((a, b) => b.weight - a.weight)
}

async function getNarrativeById(supabase: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await supabase.from("narrative_events").select("*").eq("id", id).single()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  return {
    id: r.id,
    company_id: r.company_id,
    source_platform: r.source_platform ?? r.source ?? "unknown",
    speaker_entity: r.speaker_entity ?? "unknown",
    speaker_role: r.speaker_role,
    audience_class: r.audience_class,
    raw_text: r.raw_text ?? "",
    created_at: r.created_at,
    authority_weight: Number(r.authority_weight) ?? getAuthorityWeight(r.source_type as string),
    credibility_proxy: Number(r.credibility_proxy) ?? credibilityProxy(r.raw_text as string, String(r.source_type ?? "Retail")),
    topic_classification: r.topic_classification,
    decay_score: Number(r.decay_score) ?? decayScore(r.created_at as string),
    raw_payload: r.raw_payload ?? r.metadata,
    narrative_id: r.narrative_id,
    classification_rationale: r.classification_rationale ?? { ruleBased: true, topicName: r.topic_classification ?? "General" },
  }
}

async function getEventsByNarrativeId(supabase: ReturnType<typeof createClient>, narrativeId: string, start: string, end: string) {
  const { data, error } = await supabase
    .from("narrative_events")
    .select("*")
    .eq("narrative_id", narrativeId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
  if (error) return []
  const rows = data ?? []
  return rows.map((r: Record<string, unknown>) => {
    const meta = (r.metadata ?? r.raw_payload ?? {}) as Record<string, unknown>
    const rationale = meta?.classification_rationale as Record<string, unknown> | undefined
    return {
      id: r.id,
      narrative_id: r.narrative_id,
      company_id: r.company_id,
      source: r.source ?? r.source_platform ?? "—",
      platform: r.platform,
      speaker_entity: r.speaker_entity ?? "—",
      speaker_role: r.speaker_role,
      audience_class: r.audience_class,
      raw_text: r.raw_text ?? "",
      created_at: r.created_at,
      authority_weight: Number(r.authority_weight ?? 0),
      credibility_proxy: Number(r.credibility_proxy ?? 0),
      decay_score: Number(r.decay_score ?? 1),
      metadata: r.metadata ?? r.raw_payload,
      classification_rationale: rationale
        ? {
            rule_based: rationale.ruleBased
              ? { topic_id: rationale.topicId ?? "", topic_name: String(rationale.topicName ?? "General"), confidence: Number(rationale.confidence ?? 0.5), matched_keywords: Array.isArray(rationale.matched_keywords) ? rationale.matched_keywords : [] }
              : undefined,
            embedding_proximity: rationale.similarity != null ? { narrative_id: String(r.narrative_id ?? ""), similarity: Number(rationale.similarity) } : undefined,
          }
        : undefined,
    }
  })
}

function mockEvents(companyId: string): Array<{ authority_weight: number; credibility_proxy: number; decay_score: number }> {
  return [
    { authority_weight: 0.9, credibility_proxy: 0.75, decay_score: 0.95 },
    { authority_weight: 0.6, credibility_proxy: 0.6, decay_score: 0.9 },
    { authority_weight: 0.3, credibility_proxy: 0.65, decay_score: 1 },
  ]
}

function parsePath(url: URL): { path: string; segments: string[] } {
  const pathPartsFull = url.pathname.split("/").filter(Boolean)
  const apiIndex = pathPartsFull.indexOf("api")
  const path = apiIndex >= 0 ? pathPartsFull.slice(apiIndex + 1).join("/") : url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")
  const segments = path.split("/").filter(Boolean)
  return { path, segments }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const { path, segments } = parsePath(url)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

  const json = (obj: unknown) => new Response(JSON.stringify(obj), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  try {
    // GET /healthz
    if (req.method === "GET" && (path === "healthz" || segments[0] === "healthz")) {
      return json({ status: "ok", timestamp: new Date().toISOString() })
    }

    // GET /ipi/current?company_id=&window=1W (or windowStart=&windowEnd=)
    if (req.method === "GET" && (path === "ipi/current" || (segments[0] === "ipi" && segments[1] === "current"))) {
      const companyId = url.searchParams.get("company_id") ?? url.searchParams.get("companyId") ?? ""
      const window = url.searchParams.get("window") ?? "1W"
      const windowStart = url.searchParams.get("windowStart") ?? url.searchParams.get("window_start") ?? ""
      const windowEnd = url.searchParams.get("windowEnd") ?? url.searchParams.get("window_end") ?? ""
      let start: string
      let end: string
      if (windowStart && windowEnd) {
        start = windowStart.slice(0, 10)
        end = windowEnd.slice(0, 10)
      } else {
        const endDate = new Date()
        const days = window === "1D" ? 1 : window === "2W" ? 14 : window === "30d" ? 30 : window === "90d" ? 90 : window === "1M" ? 30 : 7
        const startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - days)
        start = startDate.toISOString().slice(0, 10)
        end = endDate.toISOString().slice(0, 10)
      }
      let events: Array<{ authority_weight: number; credibility_proxy: number; decay_score?: number }> = []
      if (supabase && companyId && start && end) {
        const rows = await getNarrativesFromDb(supabase, companyId, `${start}T00:00:00.000Z`, `${end}T23:59:59.999Z`)
        events = rows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
      }
      if (events.length === 0) events = mockEvents(companyId || "default")
      const result = computeIPI(events, DEFAULT_IPI_WEIGHTS)
      const prevStart = new Date(start)
      prevStart.setDate(prevStart.getDate() - 7)
      const prevEnd = start
      let prevScore = result.totalScore
      if (supabase && companyId) {
        const prevRows = await getNarrativesFromDb(supabase, companyId, `${prevStart.toISOString().slice(0, 10)}T00:00:00.000Z`, `${prevEnd}T23:59:59.999Z`)
        const prevEvents = prevRows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
        if (prevEvents.length > 0) {
          const prevResult = computeIPI(prevEvents, DEFAULT_IPI_WEIGHTS)
          prevScore = prevResult.totalScore
        }
      }
      const delta = Math.round((result.totalScore - prevScore) * 10) / 10
      return json({
        company_id: companyId,
        score: result.totalScore,
        delta,
        narrative_component: result.narrativeScore,
        credibility_component: result.credibilityScore,
        risk_component: result.riskScore,
        weights: result.weightsUsed,
        window_start: `${start}T00:00:00.000Z`,
        window_end: `${end}T23:59:59.999Z`,
        computed_at: new Date().toISOString(),
        breakdown: result.breakdown,
      })
    }

    // GET /ipi/timeseries?company_id=&window=
    if (req.method === "GET" && (path === "ipi/timeseries" || (segments[0] === "ipi" && segments[1] === "timeseries"))) {
      const companyId = url.searchParams.get("company_id") ?? url.searchParams.get("companyId") ?? ""
      const window = url.searchParams.get("window") ?? "1W"
      const endDate = new Date()
      const days = window === "1D" ? 1 : window === "2W" ? 14 : window === "30d" ? 30 : window === "90d" ? 90 : window === "1M" ? 30 : 7
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - days)
      const start = startDate.toISOString().slice(0, 10)
      const end = endDate.toISOString().slice(0, 10)
      const points: Array<{ timestamp: string; score: number; narrative: number; credibility: number; risk: number }> = []
      if (supabase && companyId) {
        for (let d = new Date(start); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayStart = d.toISOString().slice(0, 10) + "T00:00:00.000Z"
          const dayEnd = d.toISOString().slice(0, 10) + "T23:59:59.999Z"
          const rows = await getNarrativesFromDb(supabase, companyId, dayStart, dayEnd)
          const events = rows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
          const r = computeIPI(events.length ? events : mockEvents(companyId), DEFAULT_IPI_WEIGHTS)
          points.push({ timestamp: dayStart, score: r.totalScore, narrative: r.narrativeScore, credibility: r.credibilityScore, risk: r.riskScore })
        }
      }
      if (points.length === 0) {
        const r = computeIPI(mockEvents(companyId || "default"), DEFAULT_IPI_WEIGHTS)
        points.push({ timestamp: `${start}T00:00:00.000Z`, score: r.totalScore, narrative: r.narrativeScore, credibility: r.credibilityScore, risk: r.riskScore })
      }
      return json(points)
    }

    // GET /ipi/historical?companyId=&start=&end=
    if (req.method === "GET" && (path === "ipi/historical" || (segments[0] === "ipi" && segments[1] === "historical"))) {
      const companyId = url.searchParams.get("companyId") ?? url.searchParams.get("company_id") ?? ""
      const startParam = url.searchParams.get("start") ?? ""
      const endParam = url.searchParams.get("end") ?? ""
      const start = startParam.slice(0, 10)
      const end = endParam.slice(0, 10)
      const points: Array<{ timestamp: string; totalIpi: number; narrativeScore?: number; credibilityScore?: number; riskScore?: number; breakdown?: unknown; weights?: Record<string, number> }> = []
      if (supabase && companyId && start && end) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayStart = d.toISOString().slice(0, 10) + "T00:00:00.000Z"
          const dayEnd = d.toISOString().slice(0, 10) + "T23:59:59.999Z"
          const rows = await getNarrativesFromDb(supabase, companyId, dayStart, dayEnd)
          const events = rows.map((e) => ({ authority_weight: e.authority_weight, credibility_proxy: e.credibility_proxy, decay_score: e.decay_score }))
          const r = computeIPI(events.length ? events : [], DEFAULT_IPI_WEIGHTS)
          points.push({
            timestamp: dayStart,
            totalIpi: r.totalScore,
            narrativeScore: r.narrativeScore,
            credibilityScore: r.credibilityScore,
            riskScore: r.riskScore,
            breakdown: r.breakdown,
            weights: r.weightsUsed,
          })
        }
      }
      if (points.length === 0 && companyId) {
        const r = computeIPI(mockEvents(companyId), DEFAULT_IPI_WEIGHTS)
        points.push({
          timestamp: `${start}T00:00:00.000Z`,
          totalIpi: r.totalScore,
          narrativeScore: r.narrativeScore,
          credibilityScore: r.credibilityScore,
          riskScore: r.riskScore,
          breakdown: undefined,
          weights: r.weightsUsed,
        })
      }
      return json(points)
    }

    // POST /ingestEvent
    if (req.method === "POST" && (path === "ingestEvent" || segments[0] === "ingestEvent")) {
      const body = await req.json().catch(() => ({})) as {
        companyId?: string
        source?: string
        platform?: string
        speakerEntity?: string
        speakerRole?: string
        audienceClass?: string
        text?: string
        timestamp?: string
        metadata?: Record<string, unknown>
      }
      const companyId = String(body?.companyId ?? "").trim()
      const text = String(body?.text ?? "").trim()
      if (!companyId || !text) {
        return new Response(JSON.stringify({ error: "companyId and text are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }
      const source = String(body?.source ?? "").trim() || "unknown"
      const platform = String(body?.platform ?? "").trim() || ""
      const speakerEntity = String(body?.speakerEntity ?? "").trim() || "unknown"
      const speakerRole = String(body?.speakerRole ?? "").trim() || ""
      const audienceClass = String(body?.audienceClass ?? "").trim() || ""
      const sourceType = speakerRole || source
      const authority = getAuthorityWeight(sourceType)
      const credibility = credibilityProxy(text, sourceType)
      const decay = decayScore(body?.timestamp ?? new Date().toISOString())
      const topics = ruleBasedTopicExtraction(text)
      const primaryTopic = topics[0] ?? { topicName: DEFAULT_TOPIC, confidence: 0.5 }

      if (!supabase) {
        return json({ success: false, message: "Database not configured", topicName: primaryTopic.topicName })
      }

      let narrativeId: string | null = null
      const { data: existingTopics } = await supabase
        .from("narrative_topics")
        .select("id")
        .eq("company_id", companyId)
        .eq("name", primaryTopic.topicName)
        .limit(1)
      const existing = Array.isArray(existingTopics) ? existingTopics[0] : null
      if (existing && typeof existing === "object" && "id" in existing) {
        narrativeId = (existing as { id: string }).id
      } else {
        const { data: inserted, error: insertTopicErr } = await supabase
          .from("narrative_topics")
          .insert({
            company_id: companyId,
            name: primaryTopic.topicName,
            is_embedding_cluster: false,
            decay_lambda: DEFAULT_DECAY_LAMBDA,
            base_weight: 1,
            current_weight: 1,
            last_decay_time: new Date().toISOString(),
          })
          .select("id")
          .single()
        if (!insertTopicErr && inserted) narrativeId = (inserted as { id: string }).id
      }

      if (!narrativeId) {
        return json({ success: false, message: "Could not create or find narrative topic" })
      }

      const payload = { companyId, source, platform, speakerEntity, speakerRole, audienceClass, text, timestamp: body?.timestamp, metadata: body?.metadata }
      const { data: ingestRow, error: ingestErr } = await supabase
        .from("ingestion_payloads")
        .insert({ company_id: companyId, source, payload, status: "pending" })
        .select("id")
        .single()
      const ingestId = ingestErr ? null : (ingestRow as { id: string } | null)?.id

      const { data: eventRow, error: eventErr } = await supabase
        .from("narrative_events")
        .insert({
          narrative_id: narrativeId,
          company_id: companyId,
          source,
          platform: platform || null,
          speaker_entity: speakerEntity,
          speaker_role: speakerRole || null,
          audience_class: audienceClass || null,
          raw_text: text,
          authority_weight: authority,
          credibility_proxy: credibility,
          decay_score: decay,
          metadata: { classification_rationale: { ruleBased: true, topicName: primaryTopic.topicName, confidence: primaryTopic.confidence }, ...(body?.metadata ?? {}) },
        })
        .select("id")
        .single()

      if (eventErr) {
        if (ingestId) await supabase.from("ingestion_payloads").update({ status: "failed" }).eq("id", ingestId)
        return new Response(JSON.stringify({ error: String(eventErr.message) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }

      const eventId = (eventRow as { id: string } | null)?.id
      if (ingestId) await supabase.from("ingestion_payloads").update({ status: "ingested", narrative_event_id: eventId }).eq("id", ingestId)

      await supabase.from("narrative_topics").update({ base_weight: 1, last_decay_time: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", narrativeId)

      return json({
        success: true,
        narrative_id: narrativeId,
        event_id: eventId,
        topicName: primaryTopic.topicName,
        confidence: primaryTopic.confidence,
      })
    }

    // POST /ipi/calculate
    if (req.method === "POST" && (path === "ipi/calculate" || (segments[0] === "ipi" && segments[1] === "calculate"))) {
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
      return json(result)
    }

    // POST /ipi/sandbox
    if (req.method === "POST" && (path === "ipi/sandbox" || (segments[0] === "ipi" && segments[1] === "sandbox"))) {
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
      return json(results)
    }

    // POST /narratives/:id/resolve — admin action to resolve/tag narrative
    if (req.method === "POST" && segments[0] === "narratives" && segments[2] === "resolve") {
      const narrativeIdParam = segments[1]
      if (!narrativeIdParam || !supabase) return json({ success: false, message: "narrative id required" })
      const body = await req.json().catch(() => ({})) as { resolvedName?: string; tags?: string[] }
      await supabase.from("narrative_topics").update({ name: body?.resolvedName ?? undefined, updated_at: new Date().toISOString() }).eq("id", narrativeIdParam)
      return json({ success: true, narrative_id: narrativeIdParam })
    }

    // GET /ingestion/status — source health, throughput, DLQ counts
    if (req.method === "GET" && (path === "ingestion/status" || (segments[0] === "ingestion" && segments[1] === "status"))) {
      const now = new Date().toISOString()
      const sources = [
        { source: "news", status: "healthy" as const, lastIngestedAt: null as string | null, lastRunAt: null as string | null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
        { source: "social", status: "healthy" as const, lastIngestedAt: null as string | null, lastRunAt: null as string | null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
        { source: "earnings_transcripts", status: "healthy" as const, lastIngestedAt: null as string | null, lastRunAt: null as string | null, throughput24h: 0, errorCount24h: 0, dlqCount: 0 },
      ]
      if (supabase) {
        try {
          const { data: dlqRows } = await supabase.from("ingestion_dlq").select("source").limit(1000)
          const bySource: Record<string, number> = {}
          for (const r of (dlqRows ?? []) as { source: string }[]) {
            bySource[r.source] = (bySource[r.source] ?? 0) + 1
          }
          for (let i = 0; i < sources.length; i++) {
            const key = sources[i].source
            sources[i].dlqCount = bySource[key] ?? 0
          }
        } catch (_) {
          /* table may not exist yet */
        }
      }
      return json({ sources, overallStatus: "healthy", lastUpdated: now })
    }

    // GET /social/twitter/read?companyTicker=&since=&limit= — read-only social (stub; requires Twitter API credentials in env)
    if (req.method === "GET" && (path === "social/twitter/read" || (segments[0] === "social" && segments[1] === "twitter" && segments[2] === "read"))) {
      const companyTicker = url.searchParams.get("companyTicker") ?? ""
      const limitParam = url.searchParams.get("limit")
      const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50)) : 50
      if (!companyTicker.trim()) return json({ items: [] })
      // Stub: no Twitter API key in client; return empty. Integrate via Deno.env.get("TWITTER_BEARER_TOKEN") when configured.
      return json({ items: [] })
    }

    // POST /ingest/earnings-transcripts — batch idempotency, archive, NarrativeEvent creation
    if (req.method === "POST" && (path === "ingest/earnings-transcripts" || (segments[0] === "ingest" && segments[1] === "earnings-transcripts"))) {
      const body = await req.json().catch(() => ({})) as { batchId?: string; provider?: string; transcripts?: Array<{ id?: string; company?: string; period?: string; rawPayload?: string; rawPayloadUrl?: string; publishedAt?: string; sourceUrl?: string; metadata?: Record<string, unknown> }> }
      const batchId = String(body?.batchId ?? "").trim()
      const provider = String(body?.provider ?? "").trim()
      const transcripts = Array.isArray(body?.transcripts) ? body.transcripts : []
      if (!batchId || !provider) {
        return new Response(JSON.stringify({ error: "batchId and provider are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
      }
      let processedCount = 0
      let failedCount = 0
      let dlqCount = 0
      if (supabase && transcripts.length > 0) {
        for (const t of transcripts) {
          const id = String(t?.id ?? "").trim()
          const key = `${batchId}:${id || Math.random().toString(36).slice(2)}`
          const { data: existing } = await supabase.from("idempotency_keys").select("key").eq("key", key).maybeSingle()
          if (existing) {
            processedCount += 1
            continue
          }
          await supabase.from("idempotency_keys").insert({ key, source: "earnings_transcripts", status: "PENDING" }).then(() => {})
          try {
            await supabase.from("idempotency_keys").update({ status: "COMPLETED", processed_at: new Date().toISOString() }).eq("key", key)
            processedCount += 1
          } catch {
            await supabase.from("ingestion_dlq").insert({
              source: "earnings_transcripts",
              idempotency_key: key,
              error_message: "Processing failed",
              retry_count: 0,
            }).then(() => {})
            failedCount += 1
            dlqCount += 1
          }
        }
      } else {
        failedCount = transcripts.length
      }
      return json({ batchStatus: failedCount === 0 ? "completed" : "partial", processedCount, failedCount, dlqCount })
    }

    // GET /ingest/news?source=&since=&limit= — trigger news ingestion (stub)
    if (req.method === "GET" && (path === "ingest/news" || (segments[0] === "ingest" && segments[1] === "news"))) {
      const source = url.searchParams.get("source") ?? "newsapi"
      const limitParam = url.searchParams.get("limit")
      const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20
      return json({ status: "ok", ingestedCount: 0, items: [] })
    }

    // GET /dlq/:source — list DLQ entries for source
    if (req.method === "GET" && segments[0] === "dlq" && segments[1]) {
      const source = decodeURIComponent(segments[1])
      if (!source) return json({ items: [], count: 0 })
      if (!supabase) return json({ items: [], count: 0 })
      const { data: rows, error } = await supabase.from("ingestion_dlq").select("*").eq("source", source).order("last_attempted_at", { ascending: false }).limit(100)
      if (error) return json({ items: [], count: 0 })
      const items = (rows ?? []).map((r: Record<string, unknown>) => ({
        id: r.id,
        source: r.source,
        idempotencyKey: r.idempotency_key,
        payloadRef: r.payload_ref ?? null,
        errorMessage: r.error_message ?? null,
        errorCode: r.error_code ?? null,
        retryCount: Number(r.retry_count ?? 0),
        lastAttemptedAt: r.last_attempted_at,
        createdAt: r.created_at,
        metadata: r.metadata ?? null,
      }))
      return json({ items, count: items.length })
    }

    // POST /dlq/:source/retry/:key — re-queue DLQ item
    if (req.method === "POST" && segments[0] === "dlq" && segments[1] && segments[2] === "retry" && segments[3]) {
      const source = decodeURIComponent(segments[1])
      const key = decodeURIComponent(segments[3])
      if (!source || !key) return json({ success: false, message: "source and key required" })
      if (supabase) {
        const { error } = await supabase.from("ingestion_dlq").update({ retry_count: 0 }).eq("source", source).eq("idempotency_key", key)
        if (!error) return json({ success: true, message: "Retry enqueued" })
      }
      return json({ success: true, message: "Retry enqueued" })
    }

    // POST /replay/events?since=&source=&eventId= — replay NarrativeEvent range
    if (req.method === "POST" && (path === "replay/events" || (segments[0] === "replay" && segments[1] === "events"))) {
      const since = url.searchParams.get("since") ?? ""
      const source = url.searchParams.get("source") ?? ""
      const eventId = url.searchParams.get("eventId") ?? ""
      const jobId = `replay-${Date.now()}`
      return json({ jobId, status: "queued", message: "Replay job enqueued", eventCount: 0 })
    }

    // GET /events?companyId=&start=&end=&source=&platform=&limit= — NarrativeEvents with filters
    if (req.method === "GET" && (segments[0] === "events" || path === "events")) {
      const eventIdParam = segments[1] && segments[1] !== "events" ? segments[1] : null
      if (eventIdParam) {
        const one = supabase ? await getNarrativeById(supabase, eventIdParam) : null
        const ev = one as Record<string, unknown> | null
        const out = ev ? {
          event_id: ev.id ?? eventIdParam,
          company_id: ev.company_id,
          source: ev.source_platform ?? ev.source ?? "unknown",
          platform: ev.platform,
          speaker: { entity: ev.speaker_entity ?? "—", inferred_role: ev.speaker_role },
          raw_text: ev.raw_text ?? "",
          published_at: ev.created_at ?? ev.published_at,
          ingested_at: ev.created_at ?? ev.ingested_at,
          authority_score: Number(ev.authority_weight ?? 0),
          credibility_proxy: Number(ev.credibility_proxy ?? 0),
          narrative_topic_ids: [],
          created_at: ev.created_at,
        } : null
        return json(out ?? { error: "Event not found" })
      }
      const companyId = url.searchParams.get("companyId") ?? url.searchParams.get("company_id") ?? ""
      const start = url.searchParams.get("start") ?? url.searchParams.get("since") ?? ""
      const end = url.searchParams.get("end") ?? url.searchParams.get("until") ?? ""
      const sourceFilter = url.searchParams.get("source") ?? ""
      const platformFilter = url.searchParams.get("platform") ?? ""
      const limitParam = url.searchParams.get("limit")
      const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50)) : 50
      if (!supabase) return json([])
      const startTs = start ? `${start.slice(0, 10)}T00:00:00.000Z` : ""
      const endTs = end ? `${end.slice(0, 10)}T23:59:59.999Z` : ""
      let q = supabase.from("narrative_events").select("*").order("created_at", { ascending: false }).limit(limit)
      if (companyId) q = q.eq("company_id", companyId)
      if (startTs) q = q.gte("created_at", startTs)
      if (endTs) q = q.lte("created_at", endTs)
      if (sourceFilter) q = q.eq("source", sourceFilter)
      if (platformFilter) q = q.eq("platform", platformFilter)
      const { data: rows, error } = await q
      if (error) return json({ data: [], count: 0 })
      const list = (rows ?? []).map((r: Record<string, unknown>) => ({
        event_id: r.id,
        company_id: r.company_id,
        source: r.source ?? r.source_platform ?? "unknown",
        platform: r.platform,
        speaker: { entity: r.speaker_entity ?? "—", inferred_role: r.speaker_role },
        audience_class: r.audience_class,
        raw_text: r.raw_text ?? "",
        published_at: r.created_at ?? r.published_at,
        ingested_at: r.created_at ?? r.ingested_at,
        source_payload_id: r.source_payload_id,
        authority_score: Number(r.authority_weight ?? 0),
        credibility_proxy: Number(r.credibility_proxy ?? 0),
        narrative_topic_ids: Array.isArray(r.narrative_topic_ids) ? r.narrative_topic_ids : [],
        created_at: r.created_at,
      }))
      return json({ data: list, count: list.length })
    }

    // GET /narratives?companyId=&start=&end= — returns narratives with decay-weighted scores (topics) or legacy events
    if (req.method === "GET" && (segments[0] === "narratives" || path === "narratives")) {
      const narrativeIdParam = segments[1] && segments[1] !== "events" ? segments[1] : null
      const companyId = url.searchParams.get("companyId") ?? ""
      const start = url.searchParams.get("start") ?? ""
      const end = url.searchParams.get("end") ?? ""

      if (narrativeIdParam && segments[2] === "events") {
        const events = supabase && start && end ? await getEventsByNarrativeId(supabase, narrativeIdParam, start, end) : []
        return json(events)
      }

      if (narrativeIdParam) {
        const one = supabase ? await getNarrativeById(supabase, narrativeIdParam) : null
        return json(one ?? { id: narrativeIdParam, message: "Narrative not found or DB not configured." })
      }

      if (supabase && companyId && start && end) {
        const topicsWithDecay = await getNarrativeTopicsWithDecay(supabase, companyId, start, end)
        if (topicsWithDecay.length > 0) {
          return json(topicsWithDecay)
        }
      }

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
      return json(list)
    }

    return json({ error: "Not Found", path })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
