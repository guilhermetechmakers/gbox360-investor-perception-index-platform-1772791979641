# Billing & Subscription Management — Runbook

This runbook describes how to test each billing panel, simulate admin vs user flows, and extend the system for SSO and webhooks.

## Overview

- **Frontend:** Dashboard → Subscription (plan, payment methods, seats, usage, invoices), Checkout, Order/Transaction History.
- **API base:** `VITE_API_URL` (e.g. `http://localhost:3000/api`). Billing routes live under `/billing/*`.
- **Stripe:** Webhooks are received by the Supabase Edge Function `stripe-webhook`; configure Stripe to send events to that URL.

---

## 1. Testing Each Panel

### 1.1 Subscription Management (`/dashboard/subscription-management`)

- **Current plan & status:** Renders `SubscriptionHeaderCard` with plan name, status, period end, and usage. Data from `useSubscription()` (GET `/subscription` or backend GET `/billing/subscriptions`).
- **How to test:** Log in as a user, open Subscription. Expect plan name, next billing date, and usage metrics (or placeholders if no backend).
- **Tabs:** Overview (usage, payment methods, team seats, checkout shortcut), Invoices (list + link to Transaction History).

### 1.2 Checkout / Payment (`/dashboard/subscription-management/checkout`)

- **Plan selector:** `PlanSummaryPanel` — choose plan, monthly/annual. Data from `usePlans()`.
- **Billing & payment:** `BillingDetailsForm`, optional enterprise invoice toggle, `PaymentForm` (card fields) or `EnterpriseInvoiceSection`, `PromoCodeSection`, `TermsAndSubmit`.
- **Order summary:** Sticky card with subtotal, discount, total; proration note.
- **How to test:** Select plan, fill billing details, (optionally) enter card or enterprise details, accept terms, submit. Expect success state with `ConfirmationPanel` or error toast. With backend disabled, mock create subscription runs and shows success.

### 1.3 Order / Transaction History (`/dashboard/subscription-management/invoices`)

- **List:** `InvoiceListTable` — columns: date, ID, description, amount, status; actions View, Download PDF/CSV.
- **Filters:** `FiltersBar` — query, date range, status. Pagination below.
- **Detail modal:** `InvoiceDetailModal` — line items, billing address, download actions.
- **How to test:** Open Transaction History; apply filters; click View on a row to open modal; click Download to get PDF/CSV (backend or client-side CSV fallback).

---

## 2. Simulating Admin vs User Flows

### 2.1 User flow (no admin)

- Log in as a normal user.
- **Subscription:** See own plan only; change plan, add/remove payment methods, cancel subscription (all scoped to own user via API auth).
- **Invoices:** See only own invoices; download only own.
- **Entitlements:** `useEntitlementsCheck(action, resource)` or `useCanPerform(action, resource)` — backend GET `/billing/entitlements/check?action=&resource=` returns `{ allowed, reason?, planId? }`. Use to gate features (e.g. export, advanced IPI) by plan.

### 2.2 Admin flow

- Log in as admin (e.g. user with admin role in your auth system).
- **Billing data:** If your backend exposes admin-only routes (e.g. list all subscriptions, all invoices), use those from an admin dashboard. This app does not expose admin billing UI by default; add routes and UI as needed.
- **Audit:** `billing_audit_log` table stores webhook and key actions; query with service role or an admin-only API for compliance.

### 2.3 Simulating “no subscription” or “past_due”

- **No subscription:** Ensure backend returns empty or null subscription; UI shows “Set up payment” / “Choose a plan” and links to Checkout.
- **Past due:** Backend sets `status: 'past_due'` on subscription; `SubscriptionHeaderCard` can show a banner and restrict actions until paid.

---

## 3. API Endpoints (Contract)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/subscriptions` | List current user’s subscriptions |
| POST | `/billing/subscriptions` | Create subscription (planId, promoCode, quantity, billingPeriod, paymentMethodId, metadata) |
| PATCH | `/billing/subscriptions/:id` | Update (newPlanId, quantity, prorate) |
| DELETE | `/billing/subscriptions/:id` | Cancel (query: cancelAtPeriodEnd) |
| GET | `/billing/payments/methods` | List payment methods |
| POST | `/billing/payments/methods` | Add (paymentMethodId or token) |
| POST | `/billing/payments/methods/:id/default` | Set default |
| DELETE | `/billing/payments/methods/:id` | Detach |
| GET | `/billing/invoices` | List invoices (query: startDate, endDate, status, page, pageSize) |
| GET | `/billing/invoices/:id` | Single invoice |
| GET | `/billing/invoices/:id/download?format=pdf\|csv` | Download (returns blob) |
| GET | `/billing/invoices/:id/metadata` | Billing metadata for export |
| GET | `/billing/entitlements/check?action=&resource=` | Entitlement check |
| POST | `/billing/metadata` | Add billing metadata (body: { metadata }) |
| POST | `/billing/webhooks/stripe` | Stripe webhook (signature verification required) |

The frontend uses `api.get/post/patch/delete` from `@/lib/api` with base `VITE_API_URL`; invoice list/download use `/billing/invoices` (see `src/api/invoice.ts` and `src/api/billing.ts`).

---

## 4. Stripe Webhook (Edge Function)

- **Function:** `supabase/functions/stripe-webhook/index.ts`.
- **URL:** `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`.
- **Secrets:** Set `STRIPE_WEBHOOK_SECRET` (Stripe webhook signing secret). Optional: `STRIPE_SECRET_KEY` if the function calls Stripe API.
- **Events handled:** `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.created`.
- **Behavior:** Verifies `Stripe-Signature` with HMAC SHA-256; updates `billing_invoices` and `billing_subscriptions`; writes `billing_audit_log`.
- **Local test:** Use Stripe CLI: `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook` (or your local Edge Function URL) and use the printed webhook secret.

If your backend is Node/Express, you can instead implement POST `/api/billing/webhooks/stripe` and forward the same request (body + `Stripe-Signature` header) to this Edge Function or reimplement verification and handlers there.

---

## 5. Extending for SSO and Webhooks

### 5.1 SSO (e.g. SAML/OIDC)

- **Auth:** Handled by your auth provider (Supabase Auth or other). Billing does not replace auth.
- **Linking Stripe customer:** After SSO login, ensure the user record has `stripe_customer_id` (create customer on first billing action if missing). The Edge Function and backend should set `profiles.stripe_customer_id` when creating a Stripe customer.
- **Entitlements:** Keep using GET `/billing/entitlements/check`; the backend resolves the user from the session/JWT and checks plan/entitlements.

### 5.2 Outbound webhooks (e.g. “subscription.updated” to your CRM)

- Add a step in your backend or Edge Function after updating `billing_subscriptions`: call your CRM webhook with subscription payload.
- Or use Supabase Database webhooks / Triggers to call an external URL when `billing_subscriptions` or `billing_invoices` change.
- Do not expose internal IDs or PII in public URLs; use secrets or signed payloads.

### 5.3 Additional Stripe events

- In `stripe-webhook/index.ts`, add `case "event.type":` blocks.
- Map Stripe object to `billing_*` tables and `billing_audit_log`.
- Redeploy: `supabase functions deploy stripe-webhook`.

---

## 6. Runtime Safety (Mandatory)

- All API responses: use `data ?? []`, `Array.isArray(x) ? x : []`, optional chaining, and destructuring with defaults so the UI never assumes arrays or objects are present.
- See `src/lib/data-guard.ts` and usage in `src/api/billing.ts`, `src/api/invoice.ts`, and `src/hooks/useSubscription.ts`.

---

## 7. Database (Supabase)

- Migration: `supabase/migrations/20250306140000_billing_subscription_schema.sql`.
- Tables: `billing_plans`, `billing_subscriptions`, `billing_invoices`, `billing_payment_methods`, `billing_usage`, `billing_audit_log`, `billing_metadata`; `profiles.stripe_customer_id`.
- RLS: Users can read/update own subscriptions, invoices, payment methods, metadata; read own usage and audit log. Service role used in Edge Function for inserts/updates.

Apply: `supabase db push` or run the migration in the Supabase dashboard.
