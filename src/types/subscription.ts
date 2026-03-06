/**
 * Subscription Management — type definitions for plans, subscriptions,
 * payment methods, invoices, and usage. Aligned with API contracts.
 */

export type BillingInterval = "monthly" | "annual"

export type SubscriptionStatus = "active" | "trial" | "canceled" | "past_due"

export type InvoiceStatus = "paid" | "unpaid" | "past_due"

export interface PlanQuotas {
  seats?: number
  apiCalls?: number
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: BillingInterval
  priceMonthly?: number
  priceAnnual?: number
  features: string[]
  quotas: PlanQuotas
  entitlements?: string[]
  prorationPolicy?: string
}

export interface BillingDetails {
  contactName: string
  email: string
  companyName?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  taxId?: string
}

export interface InvoiceDetails {
  recipientName: string
  companyName: string
  billingAddress: string
  poNumber?: string
  paymentTerms?: string
}

export interface CardFields {
  cardNumber: string
  expiry: string
  cvc: string
  nameOnCard: string
}

export interface PromoResult {
  valid: boolean
  code: string
  discountType?: "percent" | "fixed"
  value?: number
  newTotal?: number
  message?: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate: string
  price: number
  currency: string
  billingMetadata?: Record<string, unknown>
}

export interface PaymentMethod {
  id: string
  userId: string
  provider: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export interface InvoiceLineItem {
  description: string
  amount: number
  quantity: number
}

export interface Invoice {
  id: string
  subscriptionId: string
  amountDue: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  issuedAt: string
  pdfUrl?: string
  csvUrl?: string
  lineItems?: InvoiceLineItem[]
}

export interface UsageMetrics {
  seats?: number
  seatsActive?: number
  seatsTotal?: number
  monitoredCompanies?: number
  apiCallsUsed?: number
  apiCallQuota?: number
}

export interface SubscriptionWithPlan extends Subscription {
  plan?: Plan
}

export interface SubscriptionResponse {
  plan: Plan | null
  subscription: Subscription | null
  status: SubscriptionStatus
  currentPeriod?: { start: string; end: string }
  usage?: UsageMetrics
  billingMetadata?: Record<string, unknown>
}

export interface ProrationInfo {
  creditAmount?: number
  chargeAmount?: number
  nextInvoiceAmount?: number
  currency?: string
  message?: string
}

export interface TeamMember {
  id: string
  email: string
  role: "owner" | "admin" | "user"
  lastLogin?: string
}

export interface PaymentMethodInput {
  provider: string
  last4: string
  brand: string
  expMonth: number
  expYear: number
}

export interface ChangePlanRequest {
  planId: string
  promoCode?: string
  prorationPreference?: "create_prorations" | "always_invoice"
}

export interface CancelSubscriptionRequest {
  confirm: boolean
  reason?: string
}
