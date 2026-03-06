import { api } from "@/lib/api"
import {
  mockCreateTicket,
  MOCK_FAQ_ITEMS,
  MOCK_ONBOARDING_STEPS,
} from "@/lib/support-mock"
import type {
  TicketPayload,
  TicketResponse,
  FAQItem,
  OnboardingStep,
} from "@/types/about-help"

export const supportApi = {
  createTicket: async (payload: TicketPayload): Promise<TicketResponse> => {
    try {
      return await api.post<TicketResponse>("/support/tickets", payload)
    } catch {
      return mockCreateTicket(payload)
    }
  },
}

export const createSupportTicket = supportApi.createTicket

async function fetchWithFallback<T>(
  endpoint: string,
  fallback: T
): Promise<T> {
  try {
    const res = await api.get<{ data?: T } | T>(endpoint)
    const data = (res && typeof res === "object" && "data" in res
      ? (res as { data?: T }).data
      : res) ?? fallback
    return Array.isArray(data) ? (data as T) : fallback
  } catch {
    return fallback
  }
}

export async function fetchFAQ(): Promise<FAQItem[]> {
  const res = await fetchWithFallback<FAQItem[]>("/docs/faq", MOCK_FAQ_ITEMS)
  return Array.isArray(res) ? res : MOCK_FAQ_ITEMS
}

export async function fetchOnboardingSteps(): Promise<OnboardingStep[]> {
  const res = await fetchWithFallback<OnboardingStep[]>(
    "/docs/onboarding",
    MOCK_ONBOARDING_STEPS
  )
  return Array.isArray(res) ? res : MOCK_ONBOARDING_STEPS
}
