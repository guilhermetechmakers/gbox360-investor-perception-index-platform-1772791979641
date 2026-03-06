/**
 * 404 Not Found — Enterprise-grade error page with Search & Filter discovery.
 * Integrates typeahead company search, NarrativeEvents/IPI filters, and navigation.
 * Gracefully degrades when APIs are unavailable.
 */
import { useMemo } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { AnimatedPage } from "@/components/AnimatedPage"
import { useCompanies } from "@/hooks/useCompanies"
import {
  ErrorHero,
  ActionBar,
  TypeaheadSearchModule,
  FilterPanel,
  ResultsPreviewCard,
  FloatingPromotionalCard,
} from "@/components/not-found"

export default function NotFound() {
  const { data: companiesData } = useCompanies()
  const previewItems = useMemo(() => {
    const list = Array.isArray(companiesData) ? companiesData : []
    return list.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      ticker: c.ticker,
    }))
  }, [companiesData])

  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))]">
      <Navbar />
      <AnimatedPage>
        <main className="container px-4 py-16 md:py-24">
          {/* Hero — max width 900–1000px, centered */}
          <section className="mx-auto max-w-[960px]">
            <ErrorHero />
            <div className="mt-10">
              <ActionBar />
            </div>
          </section>

          {/* Search & Filter — bento-style layout */}
          <section className="mx-auto mt-16 max-w-[960px]">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Search + Filters — main column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-[18px] border border-border bg-card p-6 shadow-card">
                  <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                    Find a company
                  </h2>
                  <TypeaheadSearchModule placeholder="Search companies to find IPI data..." />
                </div>
                <FilterPanel />
              </div>

              {/* Sidebar — Results preview + Promo */}
              <div className="lg:col-span-4 space-y-6">
                <ResultsPreviewCard
                  items={previewItems}
                  title="Quick access"
                  emptyMessage="Select a company above or use filters to see results."
                />
                <FloatingPromotionalCard
                  ctaLabel="Learn more"
                  ctaHref="/about-help"
                />
              </div>
            </div>
          </section>

          {/* Helper tip */}
          <section className="mx-auto mt-12 max-w-[960px]">
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Tip:</strong> Use the search above to find a company and jump to its IPI view, or navigate back to the dashboard or landing page using the buttons above.
            </div>
          </section>
        </main>
      </AnimatedPage>
    </div>
  )
}
