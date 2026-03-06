/**
 * Static content for the Privacy Policy page.
 * Structure supports i18n and CMS integration in the future.
 */

export interface RetentionCategory {
  category: string
  dataTypes: string
  retentionPeriod: string
  rationale: string
}

export interface DataRight {
  id: string
  title: string
  description: string
  actionInstructions: string
  timeline?: string
}

export interface PrivacyContact {
  dpoName: string
  email: string
  phone: string
  address?: string
  notes?: string
}

export interface PrivacySection {
  id: string
  title: string
  content: string
  subsections?: Array<{ title: string; content: string }>
}

export const PRIVACY_HERO = {
  title: "Privacy Policy",
  subtitle:
    "How we collect, use, store, and protect your data. Transparent policies for enterprise trust and regulatory compliance.",
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "data-collection",
    title: "Data Collection",
    content:
      "We collect information necessary to provide the Investor Perception Index service. This includes account registration data (name, email, company, role), usage data (company selections, time-window preferences, export requests), and technical data (IP address, browser type, session identifiers). Data is collected through our web application, API integrations, and support channels.",
    subsections: [
      {
        title: "Account Data",
        content:
          "When you sign up, we collect your email address, name, company affiliation, and role. This enables account management, authentication, and entitlement checks.",
      },
      {
        title: "Usage Data",
        content:
          "We record which companies you watch, time windows selected, drill-down interactions, and export requests. This supports service delivery, analytics, and product improvement.",
      },
    ],
  },
  {
    id: "data-usage",
    title: "Data Usage",
    content:
      "Your data is used to deliver the IPI service, personalize your experience, enforce subscription entitlements, and improve our platform. We process data in accordance with applicable laws and our contractual obligations. Raw payloads ingested for IPI computation are archived for audit and replay; they are not used for marketing or sold to third parties.",
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content:
      "We share data only as necessary to operate the service. This includes cloud infrastructure providers (hosting, storage), authentication providers (where SSO is used), payment processors (Stripe for billing), and analytics tools (aggregated, non-identifying usage metrics). We require processors to adhere to data protection agreements and do not sell personal data.",
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content:
      "We retain data according to the categories and periods set out in the table below. Retention periods reflect legal requirements, operational needs, and our commitment to minimize data retention. Raw payloads and audit trails are retained per your subscription plan.",
  },
  {
    id: "security",
    title: "Security Measures",
    content:
      "We implement technical and organizational measures to protect your data: TLS for all traffic, encryption at rest for databases and object storage, role-based access control, audit logging, rate limiting, and secure development practices. Access to production data is restricted and monitored.",
  },
  {
    id: "international-transfers",
    title: "International Transfers",
    content:
      "Data may be processed in regions outside your jurisdiction. Where applicable, we rely on adequacy decisions, standard contractual clauses, or other lawful transfer mechanisms to ensure appropriate safeguards.",
  },
  {
    id: "cookies",
    title: "Cookies and Tracking",
    content:
      "We use essential cookies for authentication and session management. Optional analytics cookies may be used to improve the product; you can manage preferences in your account settings. See our Cookie Policy for details.",
  },
]

export const RETENTION_CATEGORIES: RetentionCategory[] = [
  {
    category: "Account & Profile Data",
    dataTypes: "Email, name, company, role",
    retentionPeriod: "Duration of account + 30 days after deletion request",
    rationale: "Required for service delivery; retained briefly after deletion for compliance and recovery support.",
  },
  {
    category: "Usage & Session Logs",
    dataTypes: "IP, session IDs, API calls, page views",
    retentionPeriod: "90 days",
    rationale: "Operational and security monitoring; aggregated analytics may be retained longer in anonymized form.",
  },
  {
    category: "Raw Payloads (Archived)",
    dataTypes: "Ingested news, social, transcript data",
    retentionPeriod: "Per plan: 1–7 years (see retention table in subscription)",
    rationale: "Compliance and audit trail; retention varies by plan tier.",
  },
  {
    category: "NarrativeEvent Metadata",
    dataTypes: "Event IDs, company IDs, timestamps, scores",
    retentionPeriod: "Duration of account + retention period",
    rationale: "Core IPI data; retained for audit and replay capability.",
  },
  {
    category: "Billing & Invoices",
    dataTypes: "Payment method, transaction history, invoices",
    retentionPeriod: "7 years for tax/legal compliance",
    rationale: "Regulatory and accounting requirements.",
  },
  {
    category: "Support & Communications",
    dataTypes: "Support tickets, emails",
    retentionPeriod: "3 years after last contact",
    rationale: "Customer service and dispute resolution.",
  },
]

export const DATA_RIGHTS: DataRight[] = [
  {
    id: "access",
    title: "Right of Access",
    description: "You may request a copy of the personal data we hold about you.",
    actionInstructions: "Request via email to privacy@gbox360.com or through the contact form below.",
    timeline: "We respond within 30 days.",
  },
  {
    id: "correction",
    title: "Right to Rectification",
    description: "You may request correction of inaccurate or incomplete personal data.",
    actionInstructions: "Update your profile in Settings or contact us for corrections.",
    timeline: "Corrections applied within 14 days.",
  },
  {
    id: "deletion",
    title: "Right to Erasure",
    description: "You may request deletion of your personal data, subject to legal retention requirements.",
    actionInstructions: "Submit a deletion request via the contact form or email.",
    timeline: "We process within 30 days; some data may be retained for legal obligations.",
  },
  {
    id: "portability",
    title: "Data Portability",
    description: "You may request your data in a structured, machine-readable format.",
    actionInstructions: "Request via email to privacy@gbox360.com.",
    timeline: "Provided within 30 days.",
  },
  {
    id: "objection",
    title: "Right to Object",
    description: "You may object to processing based on legitimate interests or for direct marketing.",
    actionInstructions: "Contact us with your objection; we will assess and respond.",
    timeline: "We respond within 30 days.",
  },
  {
    id: "withdrawal",
    title: "Withdrawal of Consent",
    description: "Where processing is based on consent, you may withdraw consent at any time.",
    actionInstructions: "Withdraw via account settings or by contacting us.",
    timeline: "Effective upon receipt; processing will cease where consent was the sole basis.",
  },
]

export const PRIVACY_CONTACT: PrivacyContact = {
  dpoName: "Data Protection Officer",
  email: "privacy@gbox360.com",
  phone: "+1 (555) 123-4567",
  address: "Gbox360, 123 Compliance Street, Suite 100, New York, NY 10001",
  notes:
    "For privacy inquiries, data subject requests, or to report a privacy concern, please contact us. We aim to respond within 5 business days.",
}

/** Unified content object for the Privacy Policy page (supports CMS/i18n) */
export const PRIVACY_POLICY_CONTENT = {
  hero: {
    title: PRIVACY_HERO.title,
    subtitle: PRIVACY_HERO.subtitle,
    lastUpdated: "Last updated: March 2025",
  },
  sections: PRIVACY_SECTIONS,
  retentionCategories: RETENTION_CATEGORIES,
  rights: DATA_RIGHTS,
  contact: PRIVACY_CONTACT,
  relatedLinks: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookie-policy", label: "Cookie Policy" },
  ],
}
