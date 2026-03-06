/**
 * Invoice API — endpoints for transaction history, filtering,
 * pagination, and downloads. Uses /api/billing/invoices (aligns with Billing API).
 * All responses validated with safe defaults.
 */

import { api } from "@/lib/api"
import type {
  Invoice,
  InvoiceListParams,
  InvoiceListResponse,
} from "@/types/invoice"

const BASE = "/billing/invoices"

/** Mock data for MVP when backend is unavailable */
function createMockInvoice(overrides: Partial<Invoice> = {}): Invoice {
  const base: Invoice = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Subscription renewal — Pro plan",
    planName: "Pro",
    amount: 99,
    currency: "USD",
    status: "paid",
    pdfUrl: "#",
    csvUrl: "#",
    items: [
      {
        id: "li-1",
        description: "Pro plan — Monthly",
        quantity: 1,
        unitPrice: 99,
        amount: 99,
      },
    ],
    billingAddress: {
      line1: "123 Business Ave",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "US",
    },
    paymentMethod: "Visa •••• 4242",
    lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
  return { ...base, ...overrides }
}

const MOCK_INVOICES: Invoice[] = [
  createMockInvoice({
    id: "inv-1",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Subscription renewal — Pro plan",
    status: "paid",
  }),
  createMockInvoice({
    id: "inv-2",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Subscription renewal — Pro plan",
    status: "paid",
  }),
  createMockInvoice({
    id: "inv-3",
    date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    description: "One-time charge — Setup fee",
    planName: undefined,
    status: "paid",
  }),
  createMockInvoice({
    id: "inv-4",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Upcoming invoice — Pro plan",
    status: "unpaid",
  }),
  createMockInvoice({
    id: "inv-5",
    date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Refund — Credit adjustment",
    status: "refunded",
    amount: -29,
  }),
]

export const invoiceApi = {
  /** GET invoices with filtering and pagination */
  async fetchInvoices(params: InvoiceListParams = {}): Promise<InvoiceListResponse | null> {
    try {
      const searchParams = new URLSearchParams()
      if (params.startDate) searchParams.set("startDate", params.startDate)
      if (params.endDate) searchParams.set("endDate", params.endDate)
      if (params.query) searchParams.set("query", params.query)
      if (params.status?.length) searchParams.set("status", params.status.join(","))
      if (params.page != null) searchParams.set("page", String(params.page))
      if (params.pageSize != null) searchParams.set("pageSize", String(params.pageSize))
      const qs = searchParams.toString()
      const res = await api.get<{ data?: Invoice[] | null; total?: number }>(
        `${BASE}?${qs}`
      )
      const data = Array.isArray(res?.data) ? res.data : []
      const total = Number.isFinite(res?.total) ? (res.total as number) : data.length
      return { data, total }
    } catch {
      let list = [...MOCK_INVOICES]
      if (params.startDate || params.endDate) {
        const start = params.startDate ? new Date(params.startDate).getTime() : 0
        const end = params.endDate ? new Date(params.endDate).getTime() : Infinity
        list = list.filter((i) => {
          const t = new Date(i.date).getTime()
          return t >= start && t <= end
        })
      }
      if (params.status?.length) {
        list = list.filter((i) => params.status?.includes(i.status))
      }
      if (params.query) {
        const q = (params.query ?? "").toLowerCase()
        list = list.filter(
          (i) =>
            i.description.toLowerCase().includes(q) ||
            (i.planName ?? "").toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q)
        )
      }
      const page = params.page ?? 1
      const pageSize = params.pageSize ?? 10
      const offset = (page - 1) * pageSize
      const paginated = list.slice(offset, offset + pageSize)
      return { data: paginated, total: list.length }
    }
  },

  /** GET single invoice detail */
  async fetchInvoiceDetail(id: string): Promise<Invoice | null> {
    try {
      const res = await api.get<Invoice | null>(`${BASE}/${id}`)
      return res ?? null
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id)
      return inv ?? null
    }
  },

  /** GET invoice download (PDF or CSV) */
  async downloadInvoice(
    invoiceId: string,
    format: "pdf" | "csv"
  ): Promise<Blob> {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
    const url = `${base}${BASE}/${invoiceId}/download?format=${format}`
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    return res.blob()
  },

  /** Export current view (CSV or PDF) — returns blob for multiple invoices */
  async exportView(
    invoiceIds: string[],
    format: "pdf" | "csv",
    invoices?: Invoice[]
  ): Promise<Blob> {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
    const url = `${base}${BASE}/export`
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ invoiceIds, format }),
      })
      if (res.ok) return res.blob()
    } catch {
      /* fall through to client-side CSV fallback */
    }
    if (format === "csv" && Array.isArray(invoices) && invoices.length > 0) {
      const escape = (s: string) =>
        s.includes(",") || s.includes('"') ? `"${(s ?? "").replace(/"/g, '""')}"` : (s ?? "")
      const headers = ["Date", "ID", "Description", "Plan", "Amount", "Currency", "Status"]
      const rows = invoices.map((i) =>
        [
          i.date,
          i.id,
          escape(i.description ?? ""),
          i.planName ?? "",
          i.amount ?? 0,
          i.currency ?? "USD",
          i.status,
        ].join(",")
      )
      const csv = [headers.join(","), ...rows].join("\n")
      return new Blob([csv], { type: "text/csv;charset=utf-8;" })
    }
    throw new Error("Export failed")
  },
}
