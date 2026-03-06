import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  SectionBlock,
  RetentionTable,
  RightsList,
  ContactBlock,
} from "@/components/privacy-policy"
import { PRIVACY_POLICY_CONTENT } from "@/content/privacy-policy"

export default function PrivacyPolicy() {
  const sections = Array.isArray(PRIVACY_POLICY_CONTENT.sections)
    ? PRIVACY_POLICY_CONTENT.sections
    : []
  const retentionCategories = Array.isArray(PRIVACY_POLICY_CONTENT.retentionCategories)
    ? PRIVACY_POLICY_CONTENT.retentionCategories
    : []
  const rights = Array.isArray(PRIVACY_POLICY_CONTENT.rights)
    ? PRIVACY_POLICY_CONTENT.rights
    : []
  const relatedLinks = Array.isArray(PRIVACY_POLICY_CONTENT.relatedLinks)
    ? PRIVACY_POLICY_CONTENT.relatedLinks
    : []

  return (
    <div className="min-h-screen bg-[rgb(var(--hero-bg))] print:bg-white">
      <Navbar />
      <AnimatedPage>
        <main className="print:pt-0" role="main">
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-[rgb(var(--hero-bg))] px-4 py-16 md:py-24 print:py-8"
            aria-labelledby="privacy-hero-title"
          >
            <div className="container mx-auto max-w-[1000px] text-center">
              <h1
                id="privacy-hero-title"
                className="font-display text-4xl font-bold tracking-tight text-[rgb(var(--foreground))] md:text-5xl lg:text-6xl"
              >
                {PRIVACY_POLICY_CONTENT.hero?.title ?? "Privacy Policy"}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[rgb(var(--muted-foreground))]">
                {PRIVACY_POLICY_CONTENT.hero?.subtitle ?? ""}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {PRIVACY_POLICY_CONTENT.hero?.lastUpdated ?? ""}
              </p>
            </div>
          </section>

          {/* Content */}
          <div className="container mx-auto max-w-[1000px] space-y-8 px-4 pb-16 print:space-y-6 print:pb-8">
            {/* Content sections */}
            {sections.map((section) => (
              <SectionBlock
                key={section.id}
                id={section.id}
                heading={section.title}
                body={section.content}
                subcontent={
                  Array.isArray(section.subsections) && section.subsections.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {(section.subsections ?? []).map((sub, idx) => (
                        <div key={idx}>
                          <h3 className="font-display text-lg font-semibold text-foreground">
                            {sub.title}
                          </h3>
                          <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
                            {sub.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : undefined
                }
              />
            ))}

            {/* Data Retention Table */}
            <section id="data-retention-table" className="scroll-mt-24 space-y-4">
              <RetentionTable
                caption="Data retention periods by category"
                summary="Table listing data categories, retention periods, and rationale for each"
                categories={retentionCategories}
              />
            </section>

            {/* Data Rights */}
            <RightsList title="Your Data Rights" rights={rights} />

            {/* Contact */}
            <ContactBlock
              contact={PRIVACY_POLICY_CONTENT.contact}
              ctaLabel="Submit a Data Request"
              ctaHref="/about-help#contact"
            />

            {/* Related links */}
            {relatedLinks.length > 0 && (
              <section className="border-t border-border pt-8" aria-label="Related policies">
                <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                  Related Policies
                </h2>
                <ul className="flex flex-wrap gap-4">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-primary transition-colors hover:text-primary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border bg-card py-8 print:py-4">
            <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
              <span className="text-sm text-muted-foreground">
                © Gbox360. All rights reserved.
              </span>
              <div className="flex gap-6 print:hidden">
                <Link
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Home
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </AnimatedPage>
    </div>
  )
}
