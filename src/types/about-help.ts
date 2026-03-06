export interface FAQItem {
  id: string
  question: string
  answer: string
  order?: number
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  order?: number
}

export interface OnboardingChecklistItem {
  id: string
  label: string
  completed: boolean
}

/** Alias for OnboardingChecklistItem for checklist usage */
export type ChecklistItem = OnboardingChecklistItem

export type TicketUrgency = "Low" | "Medium" | "High"

export interface TicketPayload {
  subject: string
  description: string
  urgency: TicketUrgency
  createdBy?: string
  companyId?: string
}

export interface TicketResponse {
  id: string
  status: "received" | "failed"
  createdAt: string
}

export interface DocLink {
  label: string
  href: string
}
