import { Navbar } from "@/components/layout/Navbar"
import { AnimatedPage } from "@/components/AnimatedPage"
import { TermsContainer } from "@/components/terms-of-service"
import {
  TERMS_OF_SERVICE_CONTENT,
  type TermsSection,
} from "@/content/terms-of-service"

export default function TermsOfService() {
  const sections = Array.isArray(TERMS_OF_SERVICE_CONTENT.sections)
    ? (TERMS_OF_SERVICE_CONTENT.sections as TermsSection[])
    : []
  const hero = TERMS_OF_SERVICE_CONTENT.hero ?? {}
  const contact = TERMS_OF_SERVICE_CONTENT.contact ?? {}

  return (
    <div className="min-h-screen bg-[rgb(var(--hero-bg))] print:bg-white">
      <Navbar />
      <AnimatedPage>
        <TermsContainer
          sections={sections}
          version={TERMS_OF_SERVICE_CONTENT.version ?? "1.0"}
          lastUpdated={TERMS_OF_SERVICE_CONTENT.lastUpdated ?? null}
          heroTitle={hero.title ?? "Terms of Service"}
          heroSubtitle={hero.subtitle ?? ""}
          legalEmail={contact.email ?? "legal@gbox360.com"}
          legalFormUrl={contact.formUrl ?? "/about-help#contact"}
          companyName="Gbox360"
          contactUrl="/about-help#contact"
        />
      </AnimatedPage>
    </div>
  )
}
