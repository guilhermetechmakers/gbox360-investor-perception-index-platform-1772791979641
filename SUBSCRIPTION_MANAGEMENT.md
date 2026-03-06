# Subscription Management — Developer Notes

## Overview

Subscription Management provides a dashboard for plan, billing, payment methods, team seats, usage, and invoices. It is built for runtime safety (guarded arrays, optional chaining) and is ready to connect to real backend APIs.

## Routes

- `/dashboard/subscription-management` — Main dashboard (plan summary, usage, payment methods, team seats, checkout shortcut, invoices tab).
- `/dashboard/subscription-management/checkout` — Checkout / plan selection and promo code.
- `/dashboard/subscription-management/invoices` — Invoices & transactions (also available as a tab on the main page).

## API Contract (Frontend Consumption)

Base URL: `VITE_API_URL` (default `http://localhost:3000/api`).

| Method | Endpoint | Response / Notes |
|--------|----------|------------------|
| GET | `/subscription` | `{ plan, subscription, status, currentPeriod?, usage?, billingMetadata? }` |
| GET | `/subscription/payments` | `{ methods?: PaymentMethod[] }` — use `data ?? []` |
| GET | `/subscription/plans` | `{ plans?: Plan[] }` — use `data ?? []` |
| GET | `/subscription/invoices` | `{ invoices?: Invoice[] }` — use `data ?? []` |
| GET | `/subscription/invoices/:id` | `{ pdfUrl?, csvUrl?, invoiceDetails }` |
| POST | `/subscription/change-plan` | Body: `{ planId, promoCode? }` → `{ updatedSubscription, prorations? }` |
| POST | `/subscription/cancel` | Body: `{ confirm: true, reason? }` → `{ status }` |
| POST | `/subscription/payment-methods` | Body: `{ action: 'add', data }` → `{ method }` |
| DELETE | `/subscription/payment-methods/:id` | → `{ success }` |
| POST | `/subscription/payment-methods/:id/default` | → `{ success }` (optional) |

## State Shape

- **Subscription (useSubscription):** `SubscriptionResponse` — plan, subscription, status, usage, billingMetadata.
- **Payment methods:** `PaymentMethod[]` — always initialized as `[]` when absent.
- **Invoices:** `Invoice[]` — same.
- **Plans:** `Plan[]` — used in PlanChangeModal and Checkout page.

## Runtime Safety

- All array state: `useState<T[]>([])`.
- API array responses: `getArrayFromResponse({ data: res?.x })` or `(res ?? []).map(...)`.
- Optional chaining used for nested API data.
- DataGuard helpers: `safeArray`, `safeNumber`, `coalesce` in `@/lib/data-guard`.

## Components

- **SubscriptionHeaderCard** — Plan name, status, next billing, API usage, Change plan / Manage billing / Cancel.
- **PaymentMethodsPanel** — List + add/remove/set default; **AddPaymentMethodModal** for add flow.
- **TeamSeatsPanel** — Seats used/total, invite by email, role select (no backend wiring in MVP).
- **UsageOverviewPanel** — Monitored companies, API usage progress, near-limit alert.
- **PlanChangeModal** — Plan list, promo code, enterprise invoice toggle, confirm.
- **CancelSubscriptionFlow** — 3 steps: confirm → reason → finalize.
- **CheckoutShortcutPanel** — CTA to checkout route.
- **InvoicesPanel** — Table of invoices with status, PDF/CSV download, view modal.
- **InvoiceViewModal** — Invoice details and download links.

## Setup

1. Ensure `VITE_API_URL` points to your API (e.g. `http://localhost:3000/api`).
2. Implement or mock the endpoints above; subscription dashboard and modals will work with mocked data.
3. For production: wire Stripe (or other) in the backend; keep card tokenization server-side only.
