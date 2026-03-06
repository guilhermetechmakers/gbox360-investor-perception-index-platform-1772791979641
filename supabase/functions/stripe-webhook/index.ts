/**
 * Stripe Webhook — Supabase Edge Function for Stripe events.
 * Configure in Stripe Dashboard: Webhook endpoint = https://<project>.supabase.co/functions/v1/stripe-webhook
 * Required secret: STRIPE_WEBHOOK_SECRET (Stripe signing secret), STRIPE_SECRET_KEY (optional for API calls)
 * Events: invoice.paid, invoice.payment_failed, customer.subscription.created/updated/deleted,
 *         invoice.created. Reconciles local billing_subscriptions and billing_invoices; writes billing_audit_log.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function verifyStripeSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false
  const parts = signature.split(",").reduce((acc, p) => {
    const [k, v] = p.split("=")
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {} as Record<string, string>)
  const timestamp = parts["t"]
  const v1 = parts["v1"]
  if (!timestamp || !v1) return false
  try {
    const signedPayload = `${timestamp}.${payload}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    )
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    return v1 === hex
  } catch {
    return false
  }
}

async function logBillingAudit(
  supabase: ReturnType<typeof createClient>,
  userId: string | null,
  action: string,
  resource: string,
  details: Record<string, unknown>
) {
  await supabase.from("billing_audit_log").insert({
    user_id: userId,
    action,
    resource,
    details,
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
  if (!webhookSecret) {
    return json({ error: "Webhook secret not configured" }, 500)
  }

  const signature = req.headers.get("Stripe-Signature") ?? null
  const rawBody = await req.text()
  const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret)
  if (!isValid) {
    return json({ error: "Invalid signature" }, 401)
  }

  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } }
  try {
    event = JSON.parse(rawBody) as { id?: string; type?: string; data?: { object?: Record<string, unknown> } }
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }

  const eventType = event?.type ?? ""
  const obj = event?.data?.object ?? {}
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

  try {
    switch (eventType) {
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoiceId = obj.id as string
        const customerId = obj.customer as string
        const subscriptionId = obj.subscription as string | null
        const amountPaid = Number(obj.amount_paid ?? 0)
        if (supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          const userId = (profile as { id?: string } | null)?.id ?? null
          if (userId) {
            await supabase.from("billing_invoices").upsert(
              {
                stripe_invoice_id: invoiceId,
                user_id: userId,
                amount_due_cents: Math.round(amountPaid / 10),
                currency: String(obj.currency ?? "usd"),
                status: "paid",
                due_date: obj.due_date ? new Date((obj.due_date as number) * 1000).toISOString() : null,
                issued_at: obj.created ? new Date((obj.created as number) * 1000).toISOString() : new Date().toISOString(),
                metadata: { subscription_id: subscriptionId, event_id: event.id },
                updated_at: new Date().toISOString(),
              },
              { onConflict: "stripe_invoice_id" }
            )
            await logBillingAudit(supabase, userId, "invoice.paid", "invoice", { invoice_id: invoiceId, amount_paid: amountPaid })
          }
        }
        break
      }
      case "invoice.payment_failed": {
        const invoiceId = obj.id as string
        if (supabase) {
          await supabase
            .from("billing_invoices")
            .update({ status: "open", updated_at: new Date().toISOString() })
            .eq("stripe_invoice_id", invoiceId)
          await logBillingAudit(supabase, null, "invoice.payment_failed", "invoice", { invoice_id: invoiceId })
        }
        break
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subId = obj.id as string
        const customerId = obj.customer as string
        const status = String(obj.status ?? "active")
        const currentPeriodStart = obj.current_period_start ? new Date((obj.current_period_start as number) * 1000).toISOString() : new Date().toISOString()
        const currentPeriodEnd = obj.current_period_end ? new Date((obj.current_period_end as number) * 1000).toISOString() : new Date().toISOString()
        const planId = (obj.metadata as Record<string, string>)?.plan_id ?? "pro"
        if (supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          const userId = (profile as { id?: string } | null)?.id ?? null
          if (userId) {
            await supabase.from("billing_subscriptions").upsert(
              {
                user_id: userId,
                stripe_subscription_id: subId,
                plan_id: planId,
                status: status === "active" || status === "trialing" ? status : "past_due",
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
                quantity: Number(obj.quantity ?? 1),
                canceled_at: obj.canceled_at ? new Date((obj.canceled_at as number) * 1000).toISOString() : null,
                trial_end: obj.trial_end ? new Date((obj.trial_end as number) * 1000).toISOString() : null,
                metadata: obj.metadata ?? {},
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            )
            await logBillingAudit(supabase, userId, eventType, "subscription", { stripe_subscription_id: subId, status: status })
          }
        }
        break
      }
      case "customer.subscription.deleted": {
        const subId = obj.id as string
        if (supabase) {
          await supabase
            .from("billing_subscriptions")
            .update({ status: "canceled", canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId)
          await logBillingAudit(supabase, null, "customer.subscription.deleted", "subscription", { stripe_subscription_id: subId })
        }
        break
      }
      case "invoice.created": {
        const invoiceId = obj.id as string
        const customerId = obj.customer as string
        const amountDue = Number(obj.amount_due ?? 0)
        if (supabase) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          const userId = (profile as { id?: string } | null)?.id ?? null
          if (userId) {
            await supabase.from("billing_invoices").insert({
              stripe_invoice_id: invoiceId,
              user_id: userId,
              amount_due_cents: Math.round(amountDue / 10),
              currency: String(obj.currency ?? "usd"),
              status: "open",
              due_date: obj.due_date ? new Date((obj.due_date as number) * 1000).toISOString() : null,
              issued_at: new Date().toISOString(),
              metadata: { event_id: event.id },
            })
          }
        }
        break
      }
      default:
        if (supabase) {
          await logBillingAudit(supabase, null, "stripe.webhook.received", eventType, { event_id: event.id })
        }
        break
    }
    return json({ received: true, type: eventType })
  } catch (err) {
    if (supabase) {
      await logBillingAudit(supabase, null, "stripe.webhook.error", eventType, { error: String(err), event_id: event.id })
    }
    return json({ error: "Webhook handler error" }, 500)
  }
})
