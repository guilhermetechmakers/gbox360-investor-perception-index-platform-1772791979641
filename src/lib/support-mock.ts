/**
 * Mock support API for development and when backend is unavailable.
 * Swap to real API by using supportApi from api/support.ts with backend.
 */

import type {
  TicketPayload,
  TicketResponse,
  FAQItem,
  OnboardingStep,
  OnboardingChecklistItem,
} from "@/types/about-help"

function generateId(): string {
  return `tkt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export async function mockCreateTicket(
  _payload: TicketPayload
): Promise<TicketResponse> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    id: generateId(),
    status: "received",
    createdAt: new Date().toISOString(),
  }
}

export const MOCK_FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is the Investor Perception Index (IPI)?",
    answer:
      "The IPI is a 0–100 metric that captures how investors perceive public companies. It combines narrative persistence, authority/credibility weighting, and risk indicators into a single explainable score. Unlike raw sentiment dashboards, the IPI surfaces which narratives drive perception and provides auditable provenance for every score change.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "How are IPI weights determined?",
    answer:
      "Provisional weights are Narrative 40%, Credibility 40%, and Risk proxy 20%. These are configurable and can be simulated in the drill-down weights sandbox. All weight changes are logged for audit.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "What data sources does Gbox360 use?",
    answer:
      "We ingest constrained live data: one reliable news feed, one read-only social feed, and batch earnings transcripts. All raw payloads are archived to object storage for compliance and replay.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "How do I export evidence for regulatory review?",
    answer:
      "From the Company View, use the Export button to generate CSV/JSON evidence packages. Exports include NarrativeEvents and presigned links to raw payloads. Access is controlled by your plan.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "What is the drill-down 'Why did this move?' view?",
    answer:
      "The drill-down view shows numeric decomposition (Narrative/Credibility/Risk), an interactive chart, event list with provenance, and a weights sandbox for simulation. You can replay events and export reports for desk notes.",
    order: 5,
  },
]

export const MOCK_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "step-1",
    title: "Verify your email",
    description:
      "Check your inbox and click the verification link to activate your account.",
    order: 1,
  },
  {
    id: "step-2",
    title: "Add companies to your watchlist",
    description:
      "Search for companies and add them to your watchlist to track their IPI.",
    order: 2,
  },
  {
    id: "step-3",
    title: "Explore the Company View",
    description:
      "Select a company and time window to see the current IPI, top narratives, and timeline.",
    order: 3,
  },
  {
    id: "step-4",
    title: "Try the drill-down view",
    description:
      "Click 'Why did this move?' to see decomposition, weights sandbox, and raw payload access.",
    order: 4,
  },
]

export const MOCK_ONBOARDING_CHECKLIST: OnboardingChecklistItem[] = [
  { id: "check-1", label: "Email verified", completed: false },
  { id: "check-2", label: "Added at least one company to watchlist", completed: false },
  { id: "check-3", label: "Viewed a company IPI summary", completed: false },
  { id: "check-4", label: "Opened drill-down view", completed: false },
]
