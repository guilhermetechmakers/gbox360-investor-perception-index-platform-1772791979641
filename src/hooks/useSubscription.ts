import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { subscriptionApi } from "@/api/subscription"

export const subscriptionKeys = {
  all: ["subscription"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
  payments: () => [...subscriptionKeys.all, "payments"] as const,
  invoices: () => [...subscriptionKeys.all, "invoices"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
}

export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionApi.getSubscription(),
    staleTime: 1000 * 60 * 2,
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: subscriptionKeys.payments(),
    queryFn: async () => {
      const res = await subscriptionApi.getPaymentMethods()
      return Array.isArray(res) ? res : []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: subscriptionKeys.invoices(),
    queryFn: async () => {
      const res = await subscriptionApi.getInvoices()
      return Array.isArray(res) ? res : []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () => {
      const res = await subscriptionApi.getPlans()
      return Array.isArray(res) ? res : []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: [...subscriptionKeys.invoices(), id],
    queryFn: () => subscriptionApi.getInvoice(id as string),
    enabled: !!id,
  })
}

export function useChangePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, promoCode }: { planId: string; promoCode?: string }) =>
      subscriptionApi.changePlan(planId, promoCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.current() })
      qc.invalidateQueries({ queryKey: subscriptionKeys.invoices() })
    },
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ confirm, reason }: { confirm: boolean; reason?: string }) =>
      subscriptionApi.cancel(confirm, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.current() })
    },
  })
}

export function useAddPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      provider: string
      last4: string
      brand: string
      expMonth: number
      expYear: number
    }) => subscriptionApi.addPaymentMethod(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.payments() })
    },
  })
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subscriptionApi.removePaymentMethod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.payments() })
    },
  })
}

export function useSetDefaultPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subscriptionApi.setDefaultPaymentMethod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.payments() })
    },
  })
}

export function useApplyPromo() {
  return useMutation({
    mutationFn: (params: {
      code: string
      planId: string
      billingPeriod: "monthly" | "annual"
    }) => subscriptionApi.applyPromo(params),
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      planId: string
      billingPeriod: "monthly" | "annual"
      paymentMethod?: { last4: string; brand: string; expMonth: number; expYear: number }
      promoCode?: string
      enterpriseInvoice?: boolean
      billingDetails?: import("@/types/subscription").BillingDetails
      invoiceDetails?: import("@/types/subscription").InvoiceDetails
      metadata?: Record<string, unknown>
    }) => subscriptionApi.createSubscription(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.current() })
      qc.invalidateQueries({ queryKey: subscriptionKeys.invoices() })
      qc.invalidateQueries({ queryKey: subscriptionKeys.payments() })
    },
  })
}
