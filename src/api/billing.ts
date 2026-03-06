/**
 * Billing API — endpoints for billing metadata per invoice.
 * Optional; surfaces entitlements and account info.
 */

import { api } from "@/lib/api"
import type { BillingMetadata } from "@/types/invoice"

const BASE = "/billing"

export const billingApi = {
  /** GET billing metadata for an invoice */
  async fetchBillingMetadata(invoiceId: string): Promise<BillingMetadata | null> {
    try {
      const res = await api.get<BillingMetadata | null>(
        `${BASE}/${invoiceId}/metadata`
      )
      return res ?? null
    } catch {
      return null
    }
  },
}
