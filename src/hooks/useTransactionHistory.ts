import { useQuery } from "@tanstack/react-query"
import { invoiceApi } from "@/api/invoice"
import type { InvoiceListParams } from "@/types/invoice"

export const transactionHistoryKeys = {
  all: ["transaction-history"] as const,
  list: (params: InvoiceListParams) =>
    [...transactionHistoryKeys.all, "list", params] as const,
}

export function useTransactionHistory(params: InvoiceListParams) {
  return useQuery({
    queryKey: transactionHistoryKeys.list(params),
    queryFn: async () => {
      const res = await invoiceApi.fetchInvoices(params)
      const data = Array.isArray(res?.data) ? res.data : []
      const total = Number.isFinite(res?.total) ? (res?.total ?? 0) : data.length
      return { data, total }
    },
    staleTime: 1000 * 60 * 2,
  })
}
