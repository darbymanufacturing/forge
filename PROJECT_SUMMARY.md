# FORGE — Project Summary for AI Agents

This document is a complete conceptual briefing for any AI agent picking up
work on FORGE. It contains no code — only the product idea, the market
context that shapes every decision, what has been built so far, and what
comes next. Read it cold before touching the repo, then read `AGENTS.md`
for technical specifics.

---

## What FORGE is

FORGE is a Shopify embedded app paired with a storefront product customizer
for print-on-demand (POD) merchants. Customers visiting a merchant's
Shopify store can personalise products — add their own text, upload an
image, choose colours — directly on the product page, see a live preview,
and place the order. The customised design is then forwarded to the
merchant's POD provider (Printify first, Gelato planned) for fulfillment.

In short: customers get a smooth in-store customisation experience, the
merchant doesn't have to build anything custom, and the POD pipeline is
fully automated.

---

## Who FORGE is for

The target user is a **non-technical solo POD merchant** on Shopify Basic
(roughly $39/month) who sells t-shirts, mugs, posters, phone cases, and
similar print-on-demand goods. They are not developers. They want to add a
product, draw a few customisation zones on it, and get a live customizer
on their storefront the same day.

A separate "launch partner cohort" of about 25–30 active POD students will
be the first paying users, on a permanently grandfathered $9.99/month
rate. They are the beta testers, first reviewers, and feedback loop.

Every UX decision is sized against the non-technical merchant — not against
a developer. If a developer would say "obvious", we still ask whether the
merchant in question understands it.

---

## The market FORGE is entering

Four established competitors define the category:

- **Customily** — the market leader (~25,000 installs), $49/month flat. The
  baseline to displace.
- **Teeinblue** — highest-rated (4.9 stars, ~2,500 installs), $19–549/month
  plus per-order fees. Loved for support and live preview.
- **Zakeke** — 3D/AR focused, $19.90/month plus a 1.7–1.9% transaction fee
  on every customised sale. The most complained-about pricing in the category.
- **Inkybay** — smaller (~750 installs), $19.99/month. Solid product but
  weak mobile UX.

Across their 1- and 2-star reviews, three complaints repeat: **hidden
transaction fees**, **slow / laggy preview, especially on mobile**, and
**a steep setup curve** that often costs hours to get one product live.

Across their 5-star reviews, three praises repeat: **support quality** (often
naming individual reps), **live preview reducing customer mistakes and
refunds**, and **POD fulfillment automation that actually works**.

FORGE positions directly against the complaints.

---

## FORGE's positioning (three promises)

1. **No transaction fees, ever.** Every paid tier is a flat monthly price.
   This is not a marketing line — it is structurally enforced. Quotas are
   measured on product count and design count, never on order revenue.
2. **Mobile-first performance.** The customizer is built as a minimal
   vanilla TypeScript web component injected as a Shopify Theme App
   Extension, so the storefront takes no framework runtime overhead.
3. **First customizable product live in under 10 minutes.** The onboarding
   flow is the single most important UX surface; a non-technical merchant
   must be able to install, connect Printify, configure one product, and
   see it live on their store inside ten minutes.

---

## Pricing tiers

| Tier | Products | Designs per month | Price |
|---|---|---|---|
| Free | 5 | 50 | $0 |
| Starter | 25 | 500 | $19/month |
| Growth | Unlimited | 3,000 | $49/month |
| Scale | Unlimited | Unlimited | $129/month |

Beta launch partners pay $9.99/month, permanently, via a Shopify-managed
discount. No per-order fees on any tier. Ever.

---

## Performance budget (non-negotiable gates)

These are gates, not aspirations. Code that violates them does not ship.

- **Customizer JavaScript bundle: under 150 KB gzipped.** Enforced in CI;
  the build fails hard if violated.
- **Largest Contentful Paint under 2.5 s on mobile.** Will be enforced via
  Lighthouse CI once the customizer is live on a real storefront page.
- **Preview update latency under 300 ms at p95.** Enforced by performance
  testing in the customizer phase.

These gates exist because mobile performance is the single biggest
complaint about the category. We will not become another laggy preview.

---

## The single metric that defines success

**Activation rate: the percentage of installs that get one customizable
product live on the storefront within 24 hours of installing the app.**

Target: above 50%.

The Shop record in the database has a `firstProductLiveAt` field that gets
set the moment a customizable product moves from draft to live. Everything
in the onboarding flow exists to drive this number up. Every product
decision in Phases 2–6 should be sized against its impact on activation.

---

## What FORGE explicitly is NOT building (yet, or maybe ever)

- **3D rendering, AR previews, AI image generation.** Zakeke's territory.
  These are the riskiest assumption to validate: do merchants actually
  pay for these, or do they pay for flat pricing and mobile UX?
  We build 2D first, gate everything else behind validated demand.
- **A general-purpose Shopify app.** FORGE is specifically for POD
  customisation. Non-POD use cases are out of scope.
- **A multi-platform tool.** Shopify first. Other ecommerce platforms not
  on the roadmap.

---

## Technology choices (and why)

- **Shopify App Template — React Router 7** (the current official template
  after the Remix → React Router merger). Ships with auth, sessions,
  webhooks, and Shopify-managed billing pre-wired. Chosen because "no
  shortcuts" means using Shopify's officially recommended stack.
- **Polaris web components** for the embedded admin UI — what merchants
  expect inside the Shopify Admin.
- **Theme App Extension** for the storefront customizer — the only
  Shopify-approved way to inject UI onto a storefront without editing
  theme code. Vanilla TypeScript (no React on the storefront) keeps the
  bundle small enough to defend the 150 KB gate.
- **Supabase PostgreSQL via Prisma** for the database. Postgres because
  the JSON columns (design zones, customer designs) need real JSONB.
- **Vercel** for hosting.
- **Printify** as the first POD provider, behind a generic provider
  interface so Gelato can be added as a second implementation later.
- **Shopify-managed app pricing** for billing, with recurring monthly
  subscriptions only. No usage-based charges — that would re-introduce
  per-order pricing through the back door.

---

## Current state — Phase 1 (Foundation) is complete

Phase 1 is the platform that everything else sits on. It is fully built,
tested, and pushed to a draft pull request. It contains:

- The complete Shopify app skeleton with auth, sessions, App Bridge, and
  the embedded admin layout (Dashboard, Products, Settings, Auth pages).
- All Shopify webhook handlers, including the three GDPR webhooks
  (customer data request, customer redact, shop redact) required for
  public-app App Store submission.
- The full database schema: Session, Shop (with plan tier and activation
  tracking), CustomizableProduct, CustomizerConfig (design zones), and
  Design (customer-submitted customisations, used for both quota metering
  and fulfillment).
- The four pricing tiers expressed as code, with unit tests that lock in
  the limits and document the no-per-order-fees promise.
- The Theme App Extension structure: Liquid blocks (one for the product
  page, one for page-scoped script loading), a TypeScript web component
  stub that mounts gracefully and never breaks the product page, and the
  esbuild pipeline that produces the storefront bundle.
- A CI pipeline that runs typecheck, lint, tests, both builds, and the
  150 KB bundle gate on every push and PR.
- Project documentation: a setup README, an agent handoff briefing
  (`AGENTS.md`), a bug tracker (`BUGS.md`), and a changelog.

The current customizer bundle is **1.1 KB gzipped** against the 150 KB
budget — a healthy margin to spend on real customisation features in
Phase 3.

No customer-facing features work yet. The foundation is intentionally
feature-free because every later phase plugs into it.

---

## What is NOT built yet

- Any Printify integration (Phase 2).
- The actual storefront 2D live-preview customizer with canvas rendering,
  text and image placement, fonts, and colour picking (Phase 3).
- The onboarding wizard that produces the under-10-minute activation
  (Phase 4).
- Connection to Shopify's billing API and the subscription plans (Phase 5).
- The order capture → artwork render → Printify submission pipeline
  (Phase 6).

---

## Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Foundation: app skeleton, schema, extension stub, CI | Complete |
| 2 | Printify integration: provider interface, product import, variant sync, token storage, rate-limit handling | Next |
| 3 | Storefront 2D customizer: live preview, design zones, text + image layers, performance gates enforced | Planned |
| 4 | Onboarding flow: under 10 minutes to first live product, activation metric instrumentation | Planned |
| 5 | Billing: Shopify-managed subscriptions for the four tiers, $9.99 beta discount, in-app quota enforcement | Planned |
| 6 | Order fulfillment: capture customisation at add-to-cart, render artwork, submit to Printify | Planned |

Phases can ship in this order with a working product at each step. The
beta cohort can start using FORGE meaningfully after Phase 4.

---

## Constraints that must never be relaxed

1. **Flat monthly pricing only.** No per-order fees, no usage billing on
   designs, no transaction percentages. This is the core market position
   and breaking it kills the product.
2. **Bundle under 150 KB gzipped.** CI fails hard. No exceptions.
3. **Non-technical merchant UX.** Every flow must be completable by a
   merchant who does not know what an API is.
4. **No code injection into merchant themes.** All storefront UI ships via
   Theme App Extensions. Apps that require theme code edits are exactly
   what the category complains about.
5. **Build 2D first.** Defer 3D, AR, and AI features until merchant
   demand for them is validated against the beta cohort.

---

## The single riskiest assumption

We assume merchants will pay specifically for **better mobile UX and flat
pricing**, rather than needing 3D, AR, or AI image generation to convert.

The first 30 days of beta cohort usage validates or invalidates this. If
it holds, we double down on Phases 3 and 4 and ignore 3D/AR for the
foreseeable future. If it does not, we revisit positioning before
scaling up acquisition.

---

## How to think about FORGE if you are an AI working on it

- Every change is measured against three things: the activation metric,
  the performance budget, and the non-technical merchant UX. If your
  change does not improve at least one of them and risks any of them,
  reconsider it.
- The foundation phase is done. Treat it as load-bearing. Do not refactor
  it speculatively — it works, it's tested, and feature phases depend on
  its exact shape (Shop, CustomizableProduct, CustomizerConfig, Design).
- Prefer extending the existing schema and routes over inventing new ones.
- When you must add storefront code, defend the 150 KB gzipped budget
  fiercely. Every kilobyte added is a kilobyte that must be justified
  against the mobile LCP gate.
- Read `AGENTS.md` for technical specifics. Read `BUGS.md` before
  debugging. Update `CHANGELOG.md` on every PR.
