/**
 * Order / Transaction History — type definitions for invoices,
 * line items, addresses, and filters. Aligned with API contracts.
 */

export type InvoiceStatus =
  | "paid"
  | "unpaid"
  | "past_due"
  | "refunded"
  | "canceled"

export interface Address {
  line1: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface BillingMetadata {
  billingAccountId?: string
  customerId?: string
  entitlements?: string[]
}

export interface Invoice {
  id: string
  date: string
  description: string
  planName?: string
  amount: number
  currency: string
  status: InvoiceStatus
  pdfUrl?: string
  csvUrl?: string
  items?: InvoiceItem[]
  billingAddress?: Address
  paymentMethod?: string
  lastPaymentDate?: string
  metadata?: BillingMetadata
}

export interface FilterState {
  query: string
  startDate: string | null
  endDate: string | null
  status: string[]
}

export interface InvoiceListParams {
  startDate?: string | null
  endDate?: string | null
  query?: string
  status?: string[]
  page?: number
  pageSize?: number
}

export interface InvoiceListResponse {
  data: Invoice[]
  total: number
}
