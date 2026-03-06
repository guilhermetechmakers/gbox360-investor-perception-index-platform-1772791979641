import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedPage } from "@/components/AnimatedPage"
import { BarChart3, FileCheck, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))]">
      <Navbar />
      <AnimatedPage>
        {/* Hero */}
        <section className="bg-[rgb(var(--hero-bg))] border-b border-border">
          <div className="container px-4 py-16 md:py-24">
            <div className="mx-auto max-w-[900px] text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Real-time, explainable Investor Perception Index
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Narrative-driven IPI for public companies. Auditable raw payloads, authority & credibility weighting, and replayable pipelines for institutional investors and IR teams.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link to="/auth?tab=signup">
                  <Button
                    size="lg"
                    className="text-base rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:ring-ring"
                  >
                    Get started
                  </Button>
                </Link>
                <Link to="/auth?tab=login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base rounded-lg border-secondary/50 hover:bg-secondary/10 hover:border-secondary transition-all duration-200"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            {/* IPI sample visual placeholder */}
            <div className="mx-auto mt-16 max-w-4xl">
              <Card className="overflow-hidden rounded-[18px] shadow-card transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] border-border">
                <CardContent className="flex h-48 items-center justify-center bg-muted/30 p-8">
                  <BarChart3 className="h-24 w-24 text-primary/40" aria-hidden />
                  <span className="ml-4 text-muted-foreground">IPI sample chart (0–100)</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border bg-card py-16">
          <div className="container px-4">
            <h2 className="font-display text-3xl font-semibold text-center text-foreground">
              How it works
            </h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Ingest", desc: "Constrained live data: news, social, earnings transcripts.", icon: FileCheck },
                { step: "2", title: "Score", desc: "Narrative 40%, Credibility 40%, Risk 20%. Explainable IPI 0–100.", icon: BarChart3 },
                { step: "3", title: "Audit", desc: "Raw payloads archived. Replay and provenance for compliance.", icon: Shield },
              ].map(({ step, title, desc, icon: Icon }) => (
                <Card key={step} className="animate-fade-in-up rounded-[18px] shadow-card border-border transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-xl font-display">{title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Customer logos / Trusted by */}
        <section className="border-t border-border bg-[rgb(var(--hero-bg))] py-12">
          <div className="container px-4">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by leading teams
            </p>
            <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Institutional investors", "IR & Corporate Finance", "Research & Compliance"].map((label, i) => (
                <span
                  key={i}
                  className="text-sm font-medium text-muted-foreground/80"
                  aria-hidden
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-[rgb(var(--hero-bg))] py-16">
          <div className="container px-4">
            <h2 className="font-display text-3xl font-semibold text-center text-foreground">
              Features
            </h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {[
                "Top 3 contributing narratives with authority & credibility badges",
                "Drill-down: Why did this move? Weights sandbox & replay",
                "Export evidence packages (CSV/JSON) for regulatory review",
                "Admin: Audit logs, data replay, user management",
              ].map((text, i) => (
                <Card key={i} className="animate-fade-in-up rounded-[18px] shadow-card border-border transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card py-16">
          <div className="container px-4 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Ready to get started?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start your trial or request a demo for your team.
            </p>
            <Link to="/auth?tab=signup">
              <Button
                size="lg"
                className="mt-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Start free trial
              </Button>
            </Link>
          </div>
        </section>

        <footer className="border-t border-border bg-card py-8">
          <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
            <span className="text-sm text-muted-foreground">© Gbox360. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
        </footer>
      </AnimatedPage>
    </div>
  )
}
