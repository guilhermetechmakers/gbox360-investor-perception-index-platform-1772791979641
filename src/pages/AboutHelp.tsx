import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { AnimatedPage } from "@/components/AnimatedPage"
import {
  AboutHeaderHero,
  ProductOverviewCard,
  FAQAccordion,
  OnboardingWalkthrough,
  ContactSupportForm,
  LinkPanel,
  FloatingPromoCard,
} from "@/components/about-help"
import { fetchFAQ, fetchOnboardingSteps } from "@/api/support"
import { MOCK_ONBOARDING_CHECKLIST } from "@/lib/support-mock"
import { Skeleton } from "@/components/ui/skeleton"

const OVERVIEW_TEXT = `The Investor Perception Index (IPI) is a 0–100 metric that captures how investors perceive public companies. Unlike raw sentiment dashboards, the IPI surfaces which narratives drive perception, weights them by authority and credibility, and provides auditable provenance for every score change.

We ingest constrained live data: one reliable news feed, one read-only social feed, and batch earnings transcripts. All raw payloads are archived for compliance. Inputs are normalized into an immutable NarrativeEvent model, then scored using provisional weights: Narrative 40%, Credibility 40%, Risk proxy 20%.`

const ARCHITECTURE_SUMMARY = `Data flows from source adapters into a queue, then to workers that archive raw payloads to object storage and write metadata to the database. A deterministic scoring engine aggregates narrative persistence, credibility proxies, and risk indicators. The drill-down view exposes decomposition, weights sandbox simulation, and replay controls for audit and model tuning.`

export default function AboutHelp() {
  const { data: faqData = [], isLoading: faqLoading } = useQuery({
    queryKey: ["about-help", "faq"],
    queryFn: fetchFAQ,
    staleTime: 1000 * 60 * 10,
  })

  const { data: onboardingData = [], isLoading: onboardingLoading } = useQuery({
    queryKey: ["about-help", "onboarding"],
    queryFn: fetchOnboardingSteps,
    staleTime: 1000 * 60 * 10,
  })

  const faqItems = Array.isArray(faqData) ? faqData : []
  const onboardingSteps = Array.isArray(onboardingData) ? onboardingData : []

  return (
    <div className="min-h-screen bg-[rgb(var(--hero-bg))]">
      <Navbar />
      <AnimatedPage>
        <AboutHeaderHero
          title="About & Help"
          subtitle="Product overview, FAQs, onboarding guidance, and support. Everything you need to get the most from the Investor Perception Index."
        />

        <div className="container mx-auto max-w-[1000px] space-y-8 px-4 pb-16">
          <section id="overview" className="scroll-mt-24">
            <ProductOverviewCard
              overviewText={OVERVIEW_TEXT}
              architectureSummary={ARCHITECTURE_SUMMARY}
            />
          </section>

          <section id="faq" className="scroll-mt-24">
            {faqLoading ? (
              <Skeleton className="h-64 w-full rounded-[1rem]" />
            ) : (
              <FAQAccordion faqItems={faqItems} allowMultiple={false} />
            )}
          </section>

          <section id="onboarding" className="scroll-mt-24">
            {onboardingLoading ? (
              <Skeleton className="h-80 w-full rounded-[1rem]" />
            ) : (
              <OnboardingWalkthrough
                steps={onboardingSteps}
                checklist={MOCK_ONBOARDING_CHECKLIST}
              />
            )}
          </section>

          <div className="grid gap-8 lg:grid-cols-3">
            <section id="contact" className="scroll-mt-24 lg:col-span-2">
              <ContactSupportForm />
            </section>
            <aside className="space-y-8">
              <LinkPanel />
              <FloatingPromoCard
                ctaLabel="View FAQ"
                onCTAClick={() => {
                  document.getElementById("faq")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
              />
            </aside>
          </div>
        </div>

        <footer className="border-t border-border bg-card py-8">
          <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
            <span className="text-sm text-muted-foreground">
              © Gbox360. All rights reserved.
            </span>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
            </div>
          </div>
        </footer>
      </AnimatedPage>
    </div>
  )
}
