# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Gbox360 — Development Blueprint

## Project Concept
Gbox360 is a B2B web application that delivers a real-time, explainable Investor Perception Index (IPI) for public companies. It ingests constrained live data (one reliable news feed, one read-only social feed, and batch earnings transcripts), preserves raw payloads for audit, normalizes inputs into an immutable NarrativeEvent model, and computes a simplified, explainable IPI using provisional weights (Narrative 40%, Credibility 40%, Risk proxy 20%). The app serves institutional investors, corporate finance/IR teams, research groups, compliance teams, and admins. Sprint 1 (Vertical MVP) delivers end-to-end flow: user login, company/time-window selection, live IPI score, top 3 contributing narratives, and a drill-down “Why did this move?” with raw payload provenance and replay capability.

## Problem Statement
- Core problems:
  - Practitioners lack a single, explainable metric capturing investor perception across narratives, authority, and credibility.
  - Existing tools provide sentiment dashboards without narrative explainability or auditable raw payloads.
  - Operations teams need replayable, immutable event trails for compliance, debugging, and model tuning.
- Who experiences these problems:
  - Portfolio managers, sell-side/buy-side analysts, IR and corporate finance teams, compliance/audit teams, platform admins.
- Why these problems matter:
  - Decisions and regulatory responses depend on accurate insight into investor perception; opaque metrics risk misaction and noncompliance.
  - Lack of auditability undermines trust and enterprise adoption.
- Current gaps without this solution:
  - No enterprise-grade, narrative-driven IPI with preserved raw payloads, authority/credibility weighting, and replayable pipelines.

## Solution
- How the application addresses the problems:
  - Ingests constrained live sources, archives raw payloads to S3, maps inputs to an immutable NarrativeEvent canonical model, computes a defensible IPI, and surfaces explainability and provenance for each score change.
- Approach & methodology:
  - Queue-based ingestion workers with idempotency and retry/backoff; store raw payloads in S3 and metadata in Postgres; lightweight NLP (rules + embeddings) for topic classification; deterministic scoring engine with provisional weights; RBAC and audit trails; admin replay and dry-run tools.
- Key differentiators:
  - Narrative-first IPI (not raw sentiment); append-only canonical events and raw payload archival for audits; explainability UI with top narratives, authority/credibility breakdowns, and weight sandboxing for simulations.
- Value created:
  - Faster, auditable decision-making; clarity on drivers of perception; compliance-ready archives and replay capabilities for remediation and model tuning.

## Requirements

### 1. Pages (UI Screens)
For each page: Purpose, key sections/components, and contribution to problem solving.

- Landing Page (Public)
  - Purpose: Convert visitors to trials/demos.
  - Key sections: Hero with IPI sample visual, three-step “How it works”, feature grid, customer logos, CTA.
  - Contribution: Attracts enterprise leads and explains the narrative-driven value.

- Login / Signup
  - Purpose: Unified auth entry supporting trials and enterprise onboarding.
  - Key components: Email/password, SSO placeholder, signup fields (company, role), TOS checkbox, MFA prompt.
  - Contribution: Secure onboarding for authorized users; supports enterprise SSO later.

- Email Verification
  - Purpose: Confirm user email for account activation.
  - Key components: Resend button, auto-poller to detect verification, support link.
  - Contribution: Ensures verified accounts for auditability and communications.

- Dashboard (Authenticated)
  - Purpose: Primary landing for users; quick snapshot of watched companies and recent IPI shifts.
  - Key components: Top nav (company search, global search, notifications), Watchlist with IPI sparks, Recent alerts, Quick actions, Recommended company cards.
  - Contribution: Rapidly surfaces perceptual changes and entry points to company views.

- Company View (IPI Summary)
  - Purpose: Detailed IPI for a selected company/time window.
  - Key components: Header (ticker/time-window), IPI card (0–100 + Δ), top 3 narratives (summaries + authority/credibility badges), timeline feed of NarrativeEvent cards, buttons: Drill-down, Export, Flag, View raw payload.
  - Contribution: Primary decisioning view; explains which narratives move IPI and provides provenance.

- Drill-down / “Why did this move?”
  - Purpose: Deep explainability and simulation.
  - Key components: Numeric decomposition (Narrative/Credibility/Risk), interactive decomposition chart, event list with provenance, weights sandbox sliders + simulate, replay controls (play/pause/step), export/report creation.
  - Contribution: Enables root-cause analysis, sensitivity testing, and audit evidence.

- Subscription Management / Checkout / Payment
  - Purpose: Manage plan tiers, payment methods, seat counts, and billing.
  - Key components: Plan summary & usage metrics, change plan CTA with proration notes, payment methods list (Stripe), promo code/invoice toggle, cancel flow.
  - Contribution: Monetization and entitlement management.

- Order / Transaction History
  - Purpose: User access to invoices and transaction history.
  - Key components: Transactions table, filters, invoice download (PDF/CSV), invoice detail modal.
  - Contribution: Financial transparency and compliance.

- Admin Dashboard
  - Purpose: Platform and tenant operations (admins only).
  - Key components: System health (ingest queue length, worker status), tenant summary with usage, quick links (user mgmt, audit logs, data replay), alerts feed.
  - Contribution: Operational visibility and incident response.

- Admin — Audit Logs
  - Purpose: Immutable audit trail for ingestion and user actions.
  - Key components: Filterable event log, raw payload ID link (archived viewer), export CSV, retention indicator.
  - Contribution: Compliance, forensic analysis, and transparency.

- Admin — Data Replay
  - Purpose: Reprocess append-only NarrativeEvent streams into pipelines.
  - Key components: Select tenant/company/time-window, preflight checks, dry-run logs, cost/resource estimate, simulate vs execute, progress bar, job history.
  - Contribution: Bug fixes, model tuning, and reproducible reprocessing.

- Admin — User Management
  - Purpose: Manage tenant users, roles, invites.
  - Key components: User table with roles/last login, invite modal, bulk actions (deactivate/reset password).
  - Contribution: Enterprise user governance and RBAC.

- Admin — Reports & Analytics
  - Purpose: Scheduled/ad-hoc reports on usage, ingest reliability, and IPI metrics.
  - Key components: Templates, schedule/delivery controls, ad-hoc query builder.
  - Contribution: Operational insights and SLA reporting.

- Audit/Raw Payload Viewer (read-only)
  - Purpose: Inspect archived raw payload JSON and provenance.
  - Key components: Raw JSON viewer, checksum, S3 metadata, download link.
  - Contribution: Evidence for audits and troubleshooting.

- About & Help / Docs Hub
  - Purpose: Onboarding, FAQs, and product docs.
  - Key components: How-it-works, onboarding checklist, contact support form, API docs link.
  - Contribution: Reduces support friction and educates users on model/provisional weights.

- Privacy Policy / Terms of Service
  - Purpose: Legal compliance and contract terms.
  - Key components: Retention table, subscription terms, acceptance checkbox on signup.
  - Contribution: Regulatory compliance and customer trust.

- 404 / 500 Error Pages
  - Purpose: Friendly error handling and troubleshooting guidance.
  - Key components: Clear messaging, support contact, error reference code, retry link.
  - Contribution: UX resilience and diagnostics.

- Loading & Success Modals
  - Purpose: Standardized feedback during async ops.
  - Key components: Skeletons, spinner, success banner with “view results”.
  - Contribution: Clear user feedback for long-running tasks.

- Settings & Preferences / User Profile
  - Purpose: User preferences, notification settings, API keys, team management for admins.
  - Key components: Profile edit, notifications/webhooks, API keys, batch transcript upload, team invites.
  - Contribution: Personalization and enterprise integration controls.

- Company View Exports & Reports
  - Purpose: Export evidence packages for regulatory review.
  - Key components: Export CSV/JSON, S3 presigned link generator, export job status.
  - Contribution: Compliance-ready deliverables.

- Password Reset / Email flows
  - Purpose: Account recovery and security.
  - Key components: Request reset, tokenized set-new-password, strength meter.
  - Contribution: Secure account lifecycle.

### 2. Features
Core features with technical details and implementation notes.

- User Authentication & Account Management
  - Technical: JWT short-lived access tokens + refresh rotation; bcrypt/argon2 password hashing; rate-limited endpoints; SendGrid transactional emails; optional TOTP MFA; SAML/OAuth placeholders.
  - Notes: Implement RBAC with tenant-scoped roles; session revocation endpoint; email verification flow stored with token expiry.

- Resilient Data Ingestion
  - Technical: Source adapters (News API, Social read-only, Batch transcripts) -> queue (RabbitMQ/SQS) -> worker pool; idempotency keys; retry/backoff; dead-letter queue.
  - Notes: Archive raw payloads to S3 with a unique key; write metadata to Postgres; expose ingestion metrics.

- Canonical NarrativeEvent Model & Storage
  - Technical: Postgres append-only table with schema:
    - event_id (UUID), company_id, source, platform, speaker {entity, inferred_role}, audience_class, raw_text, published_at, ingested_at, source_payload_id, s3_key, authority_score, credibility_scores, narrative_topic_ids, created_at.
  - Notes: Immutability enforced by application logic; provide indexes on company_id, published_at, topic_id.

- Raw Payload Archival & Replay
  - Technical: S3 object per raw payload with checksum & metadata; Postgres mapping event_id -> s3_key; presigned URL generator; Replay API to enqueue events for reprocessing (dry-run & execute).
  - Notes: Preserve original payload; replay idempotently with same event_id.

- Topic Classification & Narrative Persistence
  - Technical: Hybrid approach:
    - Rule-based high-signal patterns (company mentions, earnings keywords).
    - Embedding-based clustering (OpenAI/Cohere embeddings) with cosine similarity threshold; local vector DB (e.g., Pinecone or simple Postgres vector extension) for MVP.
    - Time-decay function for persistence: exponential decay (score_t = score_0 * e^{-λΔt}).
  - Notes: Store topic IDs on NarrativeEvent; compute persistence aggregations per company/time-window.

- Authority Weighting & Credibility Proxy
  - Technical: Static authority mapping (Analyst=0.6, Media=0.3, Retail=0.1) as base weights (example values; configurable); credibility heuristics detect management language and repetition consistency across sources.
  - Notes: Compute authority_score and credibility_proxy per event and persist for explainability.

- IPI Scoring Engine & Weights Management
  - Technical: Deterministic aggregator:
    - For a time window, aggregate narrative persistence * authority adjustment -> Narrative component.
    - Aggregate credibility proxies -> Credibility component.
    - Compute simple risk proxy (volatility signal or negative narrative indicators) -> Risk component.
    - Combine using provisional weights (40/40/20) to produce 0–100 IPI.
  - Notes: Expose endpoints: GET /api/ipi/current, /api/ipi/timeseries, /api/ipi/simulate (custom weights). Cache short-lived results; precompute for popular tickers.

- Drill-down & Explainability Toolkit
  - Technical: APIs returning top-n narratives with event lists, authority/credibility breakdowns, and raw payload pointers; UI sandbox simulator calls simulation API.
  - Notes: Mark provisional weights and log simulations in audit trail.

- Search & Filter
  - Technical: Company typeahead via Postgres FTS or Elasticsearch; filter combinators for events (time-window, source, role, authority band); pagination and virtualization.
  - Notes: Debounce for typeahead (200–300ms).

- Export & Reporting
  - Technical: Async export jobs (queue + worker), store output artifacts in S3, email/webhook notify on completion, presigned download links.
  - Notes: Access control on exports and quotas per plan.

- Billing & Subscription Management
  - Technical: Stripe integration for subscriptions, webhooks handling, proration, seat management, invoice generation and storage.
  - Notes: Enforce entitlement checks on feature access.

- Admin Audit, Monitoring & Replay Controls
  - Technical: RBAC-protected endpoints; exportable logs; health metrics via Prometheus; replay gating with preflight estimated resource use; alerting integrations (Slack/email/webhook).
  - Notes: Include retention policies for raw payloads per plan in UI.

- Security & Compliance
  - Technical: TLS for all traffic, encrypt S3 with SSE, encrypt DB at rest, role-based access, logging & audit trails, rate limits, CSP/secure headers.
  - Notes: Provide DPO contact in Privacy Policy; retain raw payloads per retention table.

### 3. User Journeys
Step-by-step flows for primary user types.

- Analyst (trial/pro)
  1. Signup (email) → verify email → login.
  2. Onboarding checklist → add companies to watchlist.
  3. Dashboard shows watchlist IPI sparks and recent alerts.
  4. Select company → Company View (default 1W) loads current IPI and top 3 narratives.
  5. Click “Why did this move?” → Drill-down page opens; inspect events, view raw payloads, run weights sandbox simulation, export event list for desk notes.

- Portfolio Manager (pro/enterprise)
  1. Login (SSO or email) → select portfolio companies.
  2. Receive email alert for significant IPI movement → open Dashboard → jump to Company View.
  3. Review IPI decomposition and timeline; flag event for team; request replay (if necessary) via admin process.

- IR / Corporate Finance
  1. Login → search company → open Company View.
  2. Inspect top narratives mentioning management commentary; view credibility proxy and raw transcript snippets.
  3. Draft IR response (external to app) and export evidence package (CSV/JSON) for legal review.

- Admin / Platform Operator
  1. Login → Admin Dashboard → review ingestion queue length and worker status.
  2. Inspect Audit Logs for recent ingestion failures; open raw payload viewer to diagnose.
  3. Initiate Data Replay (dry-run) for a tenant/company/time-window; review preflight estimate; execute replay; monitor progress bar and job history.

- Compliance / Auditor
  1. Request evidence package for a specific IPI movement date range.
  2. Admin exports audit window: download CSV of NarrativeEvents and presigned raw payloads.
  3. Validate raw payload checksums and audit trail entries.

- New Enterprise Customer (Sales-assisted)
  1. Contact Sales → receive enterprise invite (SSO placeholder).
  2. Admin sets up tenant, configures ingestion adapters (keys), invites users with roles.
  3. Onboarding: admin uploads batched transcripts, verifies ingestion health, configures entitlement/plan seats.

## UI Guide
---

## Visual Style

### Color Palette:
- Primary Green: #2f6f63 — used for primary call-to-action buttons and active UI states
- Secondary Teal/Gray-Teal: #2b6250 — used for secondary actions and subtle accents
- Neutral White: #ffffff — header background, cards, and primary surface areas
- Page Background Taupe: #a79e96 — outer background framing the UI, provides contrast to white surfaces
- Hero Beige: #f3efe6 — large hero background area, warm and soft
- Text Dark: #1f1f1f — primary text color for headings
- Body Text Gray: #555555 — secondary text and descriptions
- Card Shadow: rgba(0,0,0,0.08) — soft drop shadow for panels
- Accent Brown (in floating card): #3b2b1e — card backdrop in the lower-right callout
- Accent Orange (in floating card CTA): #e07a4c — “Learn more” emphasis

### Typography & Layout:
- Heading Typography: serif display font (e.g., Playfair Display or Georgia), heavy weight, large scale to create a premium, editorial feel
- Body Typography: clean sans-serif (e.g., Inter or Roboto), regular to medium weights for readability
- Hierarchy: large hero heading, medium subheading, small muted body copy; strong contrast between heading and body
- Layout Patterns: wide hero with centered content, generous left/right padding, rounded card surfaces, soft shadows; 12-column grid implied with a max content width around 900–1000px for the hero
- Spacing: ample vertical rhythm (large top margins on hero, comfortable line-height, 24–32px gaps between sections)

### Key Design Elements
#### Card Design:
- Surface: pure white cards with 16px–20px rounded corners
- Shadow: subtle elevated look using soft shadows (0 6px 20px rgba(0,0,0,0.08))
- States: hover or focus lift with slight translate up or shadow intensification
- Hierarchy: strong foreground elements (buttons) over muted descriptions; floating promotional card uses brown gradient/shadow for depth

#### Navigation:
- Layout: white top navigation bar with logo left, centered navigation links, and action controls on the right
- Active/Hover: text links gain slight weight or underline on hover; primary action button stands out in green
- Collapsible/Expandable: standard horizontal nav; spacing accommodates responsive stacking

#### Data Visualization:
- Palette: neutral with teal/green accents
- Chart style: flat or softly shaded, muted gridlines, readability-first

#### Interactive Elements:
- Buttons: rounded rectangles, solid green primary with white text, secondary pill outlines or lighter fills for secondary actions
- Forms: input fields with light borders, rounded corners, clear focus rings in teal/green
- Hover/Active: subtle deepening or shadow enhancement; micro-interactions on hover for cards and CTAs

### Design Philosophy
- Premium fintech aesthetic: calm, trustworthy palette; serif headings + sans-serif body
- Clean, minimal, data-forward visuals for enterprise users
- Emphasis on clarity, accessibility, and subtle depth

Implementation Notes:
- Enforce consistent tokens for color, spacing, and typography.
- Build a reusable component library (buttons, cards, forms, modals, toasts, charts) matching the UI Component Kit asset.

## Instructions to AI Development Tool
This blueprint provides the complete context needed to build this application. When implementing any part of this project:
1. Refer back to the Project Concept, Problem Statement, and Solution sections to understand the "why" behind each requirement.
2. Ensure all features and pages align with solving the identified problems (explainability, auditability, and enterprise controls).
3. Verify all features and pages are built according to specifications before completing the project.
4. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.
5. Maintain consistency with the overall solution approach (append-only events, raw payload preservation, deterministic scoring with provisional weights).

Deployment, Architecture & Tech Notes (condensed)
- Backend: Postgres for canonical events & metadata; queue (SQS/RabbitMQ) and workers in Node.js/Python; REST + GraphQL APIs.
- Object Storage: AWS S3 for raw payloads & export artifacts; presigned URLs for access.
- Embeddings/LLM: OpenAI/Cohere for embeddings and lightweight extraction; store vectors in a vector index (Pinecone or Postgres vector).
- Auth & Billing: JWT + refresh tokens; Stripe for billing; SendGrid for emails; SAML/OAuth placeholders for enterprise.
- Monitoring: Prometheus + Grafana for metrics; alerting to Slack/email/webhook.
- Security: TLS, encryption at rest, RBAC, audit logs, rate limits.
- Testing/Data: Include synthetic sample dataset and demo payloads; create fixtures for NarrativeEvent examples.

Sprint 1 Deliverable (vertical MVP)
- End-to-end working flow enabling a user to log in, select a company and time window, view a computed IPI (0–100) with directional change, see top 3 contributing narratives, and drill down to underlying NarrativeEvents with raw payload access and replay capability. All raw payloads archived and reproducible via replay. Documentation of provisional weights and ability to simulate weight changes in a sandbox.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
