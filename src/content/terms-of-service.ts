/**
 * Static content for the Terms of Service page.
 * Structure supports i18n and CMS integration in the future.
 */

export interface TermsLink {
  text: string
  href: string
}

export interface TermsSection {
  id: string
  title: string
  paragraphs: string[]
  links?: TermsLink[]
  subsections?: Array<{ title: string; paragraphs: string[] }>
}

export interface TermsContact {
  email: string
  formUrl?: string
  companyName?: string
}

export interface TermsHero {
  title: string
  subtitle: string
}

export const TERMS_HERO: TermsHero = {
  title: "Terms of Service",
  subtitle:
    "The legal terms governing your use of Gbox360, including licensing, subscription terms, and your rights and responsibilities.",
}

export const TERMS_VERSION = "1.0"
export const TERMS_LAST_UPDATED = "March 2025"

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "Welcome to Gbox360. By accessing or using our Investor Perception Index (IPI) platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.",
      "These terms constitute a binding agreement between you (or the entity you represent) and Gbox360. We reserve the right to modify these terms at any time; continued use after changes constitutes acceptance.",
    ],
  },
  {
    id: "license-grant",
    title: "License Grant",
    paragraphs: [
      "Subject to your compliance with these terms and your subscription plan, Gbox360 grants you a limited, non-exclusive, non-transferable, revocable license to access and use the IPI platform for your internal business purposes.",
      "This license includes access to IPI scores, narrative insights, drill-down explainability, export capabilities, and other features as described in your plan. You may not sublicense, resell, or redistribute the service or its outputs without our prior written consent.",
    ],
  },
  {
    id: "restrictions",
    title: "Restrictions",
    paragraphs: [
      "You agree not to: reverse engineer, decompile, or disassemble the platform; circumvent security or access controls; use the service for unlawful purposes; scrape or bulk-download data beyond permitted export limits; share credentials or allow unauthorized access; or use the service to develop a competing product.",
      "Violation of these restrictions may result in immediate termination of your account and potential legal action.",
    ],
  },
  {
    id: "subscriptions-billing",
    title: "Subscriptions & Billing",
    paragraphs: [
      "Access to Gbox360 is provided through subscription plans (trial, pro, enterprise). Your plan determines feature access, seat counts, data retention, and pricing. Billing is handled through Stripe; you authorize us to charge your payment method according to your selected plan.",
      "Subscription fees are billed in advance (monthly or annually). You may change or cancel your plan through the Subscription Management page. Proration applies when upgrading or downgrading mid-cycle.",
    ],
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    paragraphs: [
      "You must provide valid payment information. Failure to pay may result in suspension or termination of service. We may change pricing with at least 30 days' notice; continued use after the notice period constitutes acceptance.",
      "All fees are in the currency specified at checkout. Taxes may apply depending on your jurisdiction. Refunds are handled per our refund policy, available in your account settings.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    paragraphs: [
      "You may cancel your account at any time through the Settings page. We may suspend or terminate your access for breach of these terms, non-payment, or at our discretion with reasonable notice.",
      "Upon termination, your right to access the platform ceases. We will retain data per our Privacy Policy and retention table. Export your data before cancellation if you need it.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    paragraphs: [
      "The IPI and related outputs are provided for informational purposes only. They do not constitute investment, legal, or financial advice. You are solely responsible for your decisions based on the data.",
      "The service is provided \"as is\" and \"as available.\" We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components. We disclaim all warranties, express or implied, to the maximum extent permitted by law.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, Gbox360 and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the service.",
      "Our total liability for any claims arising from these terms or the service shall not exceed the amount you paid us in the twelve (12) months preceding the claim. Some jurisdictions do not allow limitation of liability; in such cases, our liability is limited to the maximum permitted by law.",
    ],
  },
  {
    id: "indemnification",
    title: "Indemnification",
    paragraphs: [
      "You agree to indemnify, defend, and hold harmless Gbox360, its affiliates, officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from your use of the service, your violation of these terms, or your violation of any third-party rights.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "These terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions. Any dispute arising from these terms or the service shall be resolved in the state or federal courts located in New York County, New York.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    paragraphs: [
      "We may update these terms from time to time. We will notify you of material changes by email or through the platform. The \"Last updated\" date at the top of this page indicates when the terms were last revised.",
      "Your continued use of the service after changes take effect constitutes acceptance of the revised terms. If you do not agree, you must stop using the service and cancel your account.",
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    paragraphs: [
      "For legal inquiries, questions about these terms, or to exercise your rights, please contact us. We aim to respond within 5 business days.",
    ],
    links: [
      { text: "Legal inquiries", href: "mailto:legal@gbox360.com" },
      { text: "Support form", href: "/about-help#contact" },
    ],
  },
]

export const TERMS_CONTACT: TermsContact = {
  email: "legal@gbox360.com",
  formUrl: "/about-help#contact",
  companyName: "Gbox360",
}

/** Unified content object for the Terms of Service page */
export const TERMS_OF_SERVICE_CONTENT = {
  hero: TERMS_HERO,
  version: TERMS_VERSION,
  lastUpdated: TERMS_LAST_UPDATED,
  sections: TERMS_SECTIONS,
  contact: TERMS_CONTACT,
}
