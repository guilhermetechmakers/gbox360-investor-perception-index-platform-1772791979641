/**
 * Billing API — endpoints for subscriptions, payment methods, invoices,
 * entitlements, and metadata. Aligns with /api/billing/* routes.
 * All responses validated with safe defaults (Mandatory Coding Standards).
 */

import { api } from "@/lib/api"
import { getArrayFromResponse } from "@/lib/data-guard"
import type { BillingMetadata } from "@/types/invoice"

const BASE = "/billing"

/** Subscription list item (safe shape from API) */
export interface BillingSubscriptionItem {
  id: string
  userId?: string
  planId: string
  status: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  quantity?: number
  canceledAt?: string | null
}

/** Entitlement check result */
export interface EntitlementCheckResult {
  allowed: boolean
  reason?: string
  planId?: string
  action?: string
  resource?: string
}

/** Invoice list item (aligned with types/invoice) */
export interface BillingInvoiceItem {
  id: string
  date?: string
  description?: string
  planName?: string
  amount: number
  currency: string
  status: string
  pdfUrl?: string
  csvUrl?: string
}

/** Payment method item */
export interface BillingPaymentMethodItem {
  id: string
  userId?: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export const billingApi = {
  /** GET billing metadata for an invoice */
  async fetchBillingMetadata(invoiceId: string): Promise<BillingMetadata | null> {
    try {
      const res = await api.get<BillingMetadata | null>(
        `${BASE}/invoices/${invoiceId}/metadata`
      )
      return res ?? null
    } catch {
      return null
    }
  },

  /** GET subscriptions for current user */
  async getSubscriptions(): Promise<BillingSubscriptionItem[]> {
    try {
      const res = await api.get<{ data?: BillingSubscriptionItem[] | null }>(
        `${BASE}/subscriptions`
      )
      return getArrayFromResponse({ data: res?.data })
    } catch {
      return []
    }
  },

  /** POST create subscription */
  async createSubscription(params: {
    planId: string
    promoCode?: string
    quantity?: number
    billingPeriod?: "monthly" | "annual"
    paymentMethodId?: string
    metadata?: Record<string, unknown>
  }): Promise<{ subscription?: BillingSubscriptionItem; invoiceId?: string }> {
    const res = await api.post<{
      subscription?: BillingSubscriptionItem
      invoiceId?: string
    }>(`${BASE}/subscriptions`, params)
    return {
      subscription: res?.subscription ?? undefined,
      invoiceId: res?.invoiceId ?? undefined,
    }
  },

  /** PATCH update subscription (plan change, quantity) */
  async updateSubscription(
    subscriptionId: string,
    params: {
      newPlanId?: string
      quantity?: number
      prorate?: boolean
    }
  ): Promise<{ subscription?: BillingSubscriptionItem; proration?: unknown }> {
    const res = await api.patch<{
      subscription?: BillingSubscriptionItem
      proration?: unknown
    }>(`${BASE}/subscriptions/${subscriptionId}`, params)
    return {
      subscription: res?.subscription ?? undefined,
      proration: res?.proration ?? undefined,
    }
  },

  /** DELETE cancel subscription */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<{ status: string }> {
    const res = await api.delete<{ status?: string }>(
      `${BASE}/subscriptions/${subscriptionId}?cancelAtPeriodEnd=${cancelAtPeriodEnd}`
    )
    return { status: res?.status ?? "canceled" }
  },

  /** GET payment methods */
  async listPaymentMethods(): Promise<BillingPaymentMethodItem[]> {
    try {
      const res = await api.get<{ methods?: BillingPaymentMethodItem[] | null }>(
        `${BASE}/payments/methods`
      )
      return getArrayFromResponse({ data: res?.methods })
    } catch {
      return []
    }
  },

  /** POST add payment method (token or paymentMethodId from Stripe) */
  async addPaymentMethod(params: {
    paymentMethodId?: string
    token?: string
  }): Promise<{ method?: BillingPaymentMethodItem }> {
    const res = await api.post<{ method?: BillingPaymentMethodItem }>(
      `${BASE}/payments/methods`,
      params
    )
    return { method: res?.method ?? undefined }
  },

  /** POST set default payment method */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    await api.post(`${BASE}/payments/methods/${paymentMethodId}/default`, {})
  },

  /** DELETE detach payment method */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await api.delete(`${BASE}/payments/methods/${paymentMethodId}`)
  },

  /** GET invoices with optional filters */
  async getInvoices(params?: {
    startDate?: string | null
    endDate?: string | null
    status?: string[]
    page?: number
    pageSize?: number
  }): Promise<{ data: BillingInvoiceItem[]; total: number }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.startDate) searchParams.set("startDate", params.startDate)
      if (params?.endDate) searchParams.set("endDate", params.endDate)
      if (params?.status?.length) searchParams.set("status", params.status.join(","))
      if (params?.page != null) searchParams.set("page", String(params.page))
      if (params?.pageSize != null) searchParams.set("pageSize", String(params.pageSize))
      const qs = searchParams.toString()
      const res = await api.get<{ data?: BillingInvoiceItem[] | null; total?: number }>(
        `${BASE}/invoices${qs ? `?${qs}` : ""}`
      )
      const data = getArrayFromResponse({ data: res?.data })
      const total = Number.isFinite(res?.total) ? (res?.total ?? 0) : data.length
      return { data, total }
    } catch {
      return { data: [], total: 0 }
    }
  },

  /** GET single invoice */
  async getInvoice(invoiceId: string): Promise<BillingInvoiceItem | null> {
    try {
      const res = await api.get<BillingInvoiceItem | null>(
        `${BASE}/invoices/${invoiceId}`
      )
      return res ?? null
    } catch {
      return null
    }
  },

  /** GET invoice download (PDF or CSV) — returns blob */
  async downloadInvoice(
    invoiceId: string,
    format: "pdf" | "csv"
  ): Promise<Blob> {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
    const url = `${base}${BASE}/invoices/${invoiceId}/download?format=${format}`
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {}
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    return res.blob()
  },

  /** GET entitlements check — enforce plan-based access */
  async checkEntitlements(
    action: string,
    resource: string
  ): Promise<EntitlementCheckResult> {
    try {
      const res = await api.get<EntitlementCheckResult>(
        `${BASE}/entitlements/check?action=${encodeURIComponent(action)}&resource=${encodeURIComponent(resource)}`
      )
      return {
        allowed: res?.allowed ?? false,
        reason: res?.reason,
        planId: res?.planId,
        action: res?.action ?? action,
        resource: res?.resource ?? resource,
      }
    } catch {
      return { allowed: false, action, resource, reason: "Check failed" }
    }
  },

  /** POST add billing metadata (for downstream export) */
  async addBillingMetadata(metadata: Record<string, unknown>): Promise<void> {
    await api.post(`${BASE}/metadata`, { metadata })
  },
}
