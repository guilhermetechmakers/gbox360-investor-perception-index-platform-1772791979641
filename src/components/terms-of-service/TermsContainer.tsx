import { useState } from "react"
import {
  SectionCard,
  VersionBadge,
  ContactLegalLink,
  AcceptTermsInline,
  LegalFooter,
  AnchorNav,
} from "@/components/terms-of-service"
import type { TermsSection } from "@/content/terms-of-service"

interface TermsContainerProps {
  language?: string
  showAcceptanceSection?: boolean
  onAccept?: (accepted: boolean) => void
  sections?: TermsSection[]
  version?: string
  lastUpdated?: string | null
  heroTitle?: string
  heroSubtitle?: string
  legalEmail?: string
  legalFormUrl?: string
  companyName?: string
  contactUrl?: string
}

export function TermsContainer({
  language = "en",
  showAcceptanceSection = false,
  onAccept,
  sections = [],
  version = "1.0",
  lastUpdated = null,
  heroTitle = "Terms of Service",
  heroSubtitle = "The legal terms governing your use of Gbox360.",
  legalEmail = "legal@gbox360.com",
  legalFormUrl = "/about-help#contact",
  companyName = "Gbox360",
  contactUrl = "/about-help#contact",
}: TermsContainerProps) {
  const safeSections = Array.isArray(sections) ? sections : []
  const navItems = safeSections.map((s) => ({ id: s.id, title: s.title }))

  return (
    <article className="min-h-screen bg-[rgb(var(--hero-bg))] print:bg-white" lang={language}>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-[rgb(var(--hero-bg))] px-4 py-16 md:py-24 print:py-8"
        aria-labelledby="terms-hero-title"
      >
        <div className="container mx-auto max-w-[1000px] text-center">
          <h1
            id="terms-hero-title"
            className="font-display text-4xl font-bold tracking-tight text-[rgb(var(--foreground))] md:text-5xl lg:text-6xl"
          >
            {heroTitle}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[rgb(var(--muted-foreground))]">
            {heroSubtitle}
          </p>
          <div className="mt-6 flex justify-center">
            <VersionBadge version={version} lastUpdated={lastUpdated} />
          </div>
        </div>
      </section>

      {/* Content with optional sidebar nav on desktop */}
      <div className="container mx-auto max-w-[1000px] px-4 pb-16 print:space-y-6 print:pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Sticky nav - hidden on mobile, visible on lg+ */}
          <aside className="hidden shrink-0 lg:block lg:w-48 lg:pt-8 print:hidden">
            <div className="sticky top-24">
              <AnchorNav items={navItems} />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-8">
            {safeSections.map((section) => (
              <SectionCard
                key={section.id}
                id={section.id}
                title={section.title}
                paragraphs={section.paragraphs ?? []}
                links={section.links}
              />
            ))}

            {/* Contact section - enhanced with ContactLegalLink */}
            <section
              id="contact-legal"
              className="scroll-mt-24 rounded-[18px] border border-border bg-card p-6 shadow-card"
              aria-labelledby="contact-legal-heading"
            >
              <h2
                id="contact-legal-heading"
                className="font-display text-2xl font-semibold tracking-tight text-foreground"
              >
                Contact for Legal Inquiries
              </h2>
              <p className="mt-4 text-muted-foreground">
                For questions about these Terms or legal matters, please reach out:
              </p>
              <div className="mt-6">
                <ContactLegalLink email={legalEmail} formUrl={legalFormUrl} />
              </div>
            </section>

            {/* Optional acceptance section for signup flows */}
            {showAcceptanceSection && onAccept && (
              <AcceptanceBlock onAccept={onAccept} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <LegalFooter companyName={companyName} contactUrl={contactUrl} />
    </article>
  )
}

function AcceptanceBlock({ onAccept }: { onAccept: (accepted: boolean) => void }) {
  const [checked, setChecked] = useState(false)

  const handleChange = (value: boolean) => {
    setChecked(value)
    onAccept(value)
  }

  return (
    <section
      className="rounded-[18px] border-2 border-primary/20 bg-card p-6 shadow-card"
      aria-label="Accept Terms"
    >
      <h3 className="font-display text-lg font-semibold text-foreground">
        Accept Terms to Continue
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        You must accept the Terms of Service to create an account.
      </p>
      <div className="mt-6">
        <AcceptTermsInline checked={checked} onChange={handleChange} />
      </div>
    </section>
  )
}
