/**
 * Subscription API — endpoints for plan, payments, invoices, and cancellation.
 * All responses validated with safe defaults for runtime safety.
 * Falls back to mock data when backend is unavailable (MVP).
 */

import { api } from "@/lib/api"
import { getArrayFromResponse } from "@/lib/data-guard"
import type {
  Plan,
  Subscription,
  SubscriptionResponse,
  PaymentMethod,
  Invoice,
  InvoiceLineItem,
  ProrationInfo,
  BillingDetails,
  InvoiceDetails,
  PromoResult,
} from "@/types/subscription"

const BASE = "/subscription"

const MOCK_PLAN: Plan = {
  id: "pro",
  name: "Pro",
  price: 99,
  currency: "USD",
  interval: "monthly",
  priceMonthly: 99,
  priceAnnual: 990,
  features: ["10 companies monitored", "5,000 API calls/month", "5 team seats"],
  entitlements: ["Full IPI access", "Priority support", "Export reports"],
  quotas: { seats: 5, apiCalls: 5000 },
}

const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub-1",
  userId: "user-1",
  planId: "pro",
  status: "active",
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  price: 99,
  currency: "USD",
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", userId: "user-1", provider: "stripe", last4: "4242", brand: "visa", expMonth: 12, expYear: 2026, isDefault: true },
]

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-1", subscriptionId: "sub-1", amountDue: 99, currency: "USD", status: "paid", dueDate: new Date().toISOString(), issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), pdfUrl: "#", csvUrl: "#" },
  { id: "inv-2", subscriptionId: "sub-1", amountDue: 99, currency: "USD", status: "paid", dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), issuedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), pdfUrl: "#", csvUrl: "#" },
]

const MOCK_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "USD",
    interval: "monthly",
    priceMonthly: 29,
    priceAnnual: 290,
    features: ["3 companies monitored", "1,000 API calls/month", "1 team seat"],
    entitlements: ["Basic IPI access", "Email support"],
    quotas: { seats: 1, apiCalls: 1000 },
  },
  {
    ...MOCK_PLAN,
    priceMonthly: 99,
    priceAnnual: 990,
    features: ["10 companies monitored", "5,000 API calls/month", "5 team seats"],
    entitlements: ["Full IPI access", "Priority support", "Export reports"],
    quotas: { seats: 5, apiCalls: 5000 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    currency: "USD",
    interval: "monthly",
    priceMonthly: 299,
    priceAnnual: 2990,
    features: ["Unlimited companies", "50,000 API calls/month", "20 team seats"],
    entitlements: ["Full IPI access", "Dedicated support", "Custom integrations", "SLA"],
    quotas: { seats: 20, apiCalls: 50000 },
  },
]

export const subscriptionApi = {
  /** GET current subscription, plan, and usage */
  async getSubscription(): Promise<SubscriptionResponse> {
    try {
      const res = await api.get<SubscriptionResponse>(BASE)
      return {
        plan: res?.plan ?? MOCK_PLAN,
        subscription: res?.subscription ?? MOCK_SUBSCRIPTION,
        status: res?.status ?? "active",
        currentPeriod: res?.currentPeriod ?? { start: MOCK_SUBSCRIPTION.currentPeriodStart, end: MOCK_SUBSCRIPTION.currentPeriodEnd },
        usage: res?.usage ?? { seats: 3, seatsActive: 2, seatsTotal: 5, monitoredCompanies: 4, apiCallsUsed: 1200, apiCallQuota: 5000 },
        billingMetadata: res?.billingMetadata,
      }
    } catch {
      return {
        plan: MOCK_PLAN,
        subscription: MOCK_SUBSCRIPTION,
        status: "active",
        currentPeriod: { start: MOCK_SUBSCRIPTION.currentPeriodStart, end: MOCK_SUBSCRIPTION.currentPeriodEnd },
        usage: { seats: 3, seatsActive: 2, seatsTotal: 5, monitoredCompanies: 4, apiCallsUsed: 1200, apiCallQuota: 5000 },
      }
    }
  },

  /** GET payment methods */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const res = await api.get<{ methods?: PaymentMethod[] | null }>(`${BASE}/payments`)
      return getArrayFromResponse({ data: res?.methods })
    } catch {
      return MOCK_PAYMENT_METHODS
    }
  },

  /** POST change plan */
  async changePlan(planId: string, promoCode?: string): Promise<{
    updatedSubscription: Subscription
    prorations?: ProrationInfo
  }> {
    try {
      return await api.post<{ updatedSubscription: Subscription; prorations?: ProrationInfo }>(
        `${BASE}/change-plan`,
        { planId, promoCode: promoCode || undefined }
      )
    } catch {
      const plan = MOCK_PLANS.find((p) => p.id === planId) ?? MOCK_PLAN
      return { updatedSubscription: { ...MOCK_SUBSCRIPTION, planId: plan.id, price: plan.price } }
    }
  },

  /** POST cancel subscription */
  async cancel(confirm: boolean, reason?: string): Promise<{ status: string }> {
    try {
      return await api.post<{ status: string }>(`${BASE}/cancel`, { confirm, reason })
    } catch {
      return { status: "canceled" }
    }
  },

  /** POST add payment method (tokenized data in production) */
  async addPaymentMethod(data: {
    provider: string
    last4: string
    brand: string
    expMonth: number
    expYear: number
  }): Promise<{ method: PaymentMethod }> {
    try {
      return await api.post<{ method: PaymentMethod }>(`${BASE}/payment-methods`, {
        action: "add",
        data,
      })
    } catch {
      const method: PaymentMethod = {
        id: `pm-${Date.now()}`,
        userId: "user-1",
        provider: data.provider,
        last4: data.last4,
        brand: data.brand,
        expMonth: data.expMonth,
        expYear: data.expYear,
        isDefault: MOCK_PAYMENT_METHODS.length === 0,
      }
      return { method }
    }
  },

  /** DELETE payment method */
  async removePaymentMethod(id: string): Promise<{ success: boolean }> {
    try {
      return await api.delete<{ success: boolean }>(`${BASE}/payment-methods/${id}`)
    } catch {
      return { success: true }
    }
  },

  /** POST set default payment method */
  async setDefaultPaymentMethod(id: string): Promise<{ success: boolean }> {
    try {
      return await api.post<{ success: boolean }>(`${BASE}/payment-methods/${id}/default`, {})
    } catch {
      return { success: true }
    }
  },

  /** GET invoices list */
  async getInvoices(): Promise<Invoice[]> {
    try {
      const res = await api.get<{ invoices?: Invoice[] | null }>(`${BASE}/invoices`)
      return getArrayFromResponse({ data: res?.invoices })
    } catch {
      return MOCK_INVOICES
    }
  },

  /** GET single invoice details and download URLs */
  async getInvoice(id: string): Promise<{
    pdfUrl?: string
    csvUrl?: string
    invoiceDetails: Invoice
  }> {
    try {
      return await api.get<{
        pdfUrl?: string
        csvUrl?: string
        invoiceDetails: Invoice
      }>(`${BASE}/invoices/${id}`)
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id)
      return { pdfUrl: inv?.pdfUrl, csvUrl: inv?.csvUrl, invoiceDetails: inv ?? MOCK_INVOICES[0] }
    }
  },

  /** GET available plans (for plan change modal) */
  async getPlans(): Promise<Plan[]> {
    try {
      const res = await api.get<{ plans?: Plan[] | null }>(`${BASE}/plans`)
      return getArrayFromResponse({ data: res?.plans })
    } catch {
      return MOCK_PLANS
    }
  },

  /** POST apply promo code */
  async applyPromo(params: {
    code: string
    planId: string
    billingPeriod: "monthly" | "annual"
  }): Promise<PromoResult> {
    try {
      return await api.post<PromoResult>(`${BASE}/promos/apply`, params)
    } catch {
      const plan = MOCK_PLANS.find((p) => p.id === params.planId)
      const basePrice =
        params.billingPeriod === "annual"
          ? plan?.priceAnnual ?? (plan?.price ?? 0) * 12
          : plan?.priceMonthly ?? plan?.price ?? 0
      const code = (params.code ?? "").toUpperCase()
      if (code === "WELCOME10") {
        return {
          valid: true,
          code: params.code,
          discountType: "percent",
          value: 10,
          newTotal: basePrice * 0.9,
          message: "10% discount applied",
        }
      }
      return {
        valid: false,
        code: params.code,
        message: "Invalid or expired promo code",
      }
    }
  },

  /** POST create subscription */
  async createSubscription(params: {
    planId: string
    billingPeriod: "monthly" | "annual"
    paymentMethod?: { last4: string; brand: string; expMonth: number; expYear: number }
    promoCode?: string
    enterpriseInvoice?: boolean
    billingDetails?: BillingDetails
    invoiceDetails?: InvoiceDetails
    metadata?: Record<string, unknown>
  }): Promise<{ subscription: Subscription; invoice?: Invoice }> {
    try {
      return await api.post<{ subscription: Subscription; invoice?: Invoice }>(
        `${BASE}/subscriptions`,
        params
      )
    } catch {
      const plan = MOCK_PLANS.find((p) => p.id === params.planId) ?? MOCK_PLAN
      const price =
        params.billingPeriod === "annual"
          ? plan.priceAnnual ?? plan.price * 12
          : plan.priceMonthly ?? plan.price
      return {
        subscription: {
          ...MOCK_SUBSCRIPTION,
          planId: plan.id,
          price,
          billingMetadata: params.metadata,
        },
      }
    }
  },

  /** POST create invoice (enterprise) */
  async createInvoice(params: {
    subscriptionId: string
    billingDetails: BillingDetails
    invoiceDetails: InvoiceDetails
    lineItems?: { description: string; amount: number }[]
  }): Promise<{ invoice: Invoice; pdfUrl?: string }> {
    try {
      return await api.post<{ invoice: Invoice; pdfUrl?: string }>(
        `${BASE}/invoices`,
        params
      )
    } catch {
      const items = params.lineItems ?? []
      const total = items.reduce(
        (a, i) => a + (i.amount ?? 0) * 1,
        0
      )
      return {
        invoice: {
          id: `inv-${Date.now()}`,
          subscriptionId: params.subscriptionId,
          amountDue: total,
          currency: "USD",
          status: "unpaid",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          issuedAt: new Date().toISOString(),
          pdfUrl: "#",
          lineItems: items.map((i): InvoiceLineItem => ({
            description: i.description ?? "",
            amount: i.amount ?? 0,
            quantity: 1,
          })),
        },
        pdfUrl: "#",
      }
    }
  },
}
