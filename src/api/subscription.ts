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
  ProrationInfo,
} from "@/types/subscription"

const BASE = "/subscription"

const MOCK_PLAN: Plan = {
  id: "pro",
  name: "Pro",
  price: 99,
  currency: "USD",
  interval: "monthly",
  features: ["10 companies monitored", "5,000 API calls/month", "5 team seats"],
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
  { id: "starter", name: "Starter", price: 29, currency: "USD", interval: "monthly", features: ["3 companies", "1,000 API calls"], quotas: { seats: 1, apiCalls: 1000 } },
  MOCK_PLAN,
  { id: "enterprise", name: "Enterprise", price: 299, currency: "USD", interval: "monthly", features: ["Unlimited companies", "50,000 API calls", "20 seats"], quotas: { seats: 20, apiCalls: 50000 } },
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
}
