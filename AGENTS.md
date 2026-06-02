# FORGE — Agent Handoff Document

This file is the authoritative briefing for any AI agent (or human) picking up
work on this repository. Read it before touching any code.

---

## What is FORGE?

A Shopify embedded app + storefront customizer for print-on-demand (POD)
merchants using **Printify** (Gelato planned for Phase 2). The target user is a
**non-technical solo merchant** selling t-shirts, mugs, posters, phone cases.

### Core competitive positioning (every decision must serve this)

| Point | Promise |
|---|---|
| Pricing | No per-order / transaction fees. **Ever.** |
| Performance | Mobile-first; JS bundle < 150 KB gzipped; LCP < 2.5 s; preview < 300 ms |
| Activation | First customizable product live in < 10 minutes |

### Competitors to displace
- **Customily** — market leader, 25k installs, $49/mo flat
- **Teeinblue** — 4.9 stars, $19–549/mo + per-order fees
- **Zakeke** — 3D/AR focus, $19.90/mo + 1.7–1.9% transaction fee (most complained about)
- **Inkybay** — $19.99/mo, weak mobile UX

---

## Current state (Phase 1 — Foundation)

### What has been built

Everything in this PR is foundational scaffolding. **No features are complete
yet.** The structure is fully in place for all subsequent phases to build on.

| Area | Status | Notes |
|---|---|---|
| Shopify app scaffold | ✅ | React Router 7, Polaris web components, auth, App Bridge |
| Database schema | ✅ | Prisma + PostgreSQL (Supabase). All core models defined. |
| Admin app routes | ✅ | Dashboard, Products, Settings, Auth, all webhook handlers |
| Theme app extension | ✅ | Structure, Liquid blocks, and TS web component stub |
| esbuild pipeline | ✅ | Bundles `extensions/customizer/src/customizer.ts` → assets |
| Bundle size gate | ✅ | CI fails hard if bundle > 150 KB gzipped |
| GDPR webhooks | ✅ | customers/data_request, customers/redact, shop/redact |
| Billing utilities | ✅ | `app/utils/billing.server.ts` — plan limits, quota helpers |
| Unit tests | ✅ | Vitest tests for billing utilities (all pass) |
| CI workflow | ✅ | `.github/workflows/ci.yml` — typecheck → lint → test → build |
| Environment config | ✅ | `.env.example` with all required variables documented |

### What is NOT built yet (by design)

- Printify API integration (Phase 2)
- Storefront 2D live preview with real canvas rendering (Phase 3)
- Onboarding flow (Phase 4)
- Shopify billing / subscription plans (Phase 5)
- Order fulfillment → Printify submission (Phase 6)

---

## Key files to know

| File | Purpose |
|---|---|
| `app/shopify.server.ts` | Shopify app init, auth exports. Start here for any auth work. |
| `app/db.server.ts` | Prisma client singleton. Import this for all DB access. |
| `prisma/schema.prisma` | Full database schema. All models documented inline. |
| `app/utils/billing.server.ts` | Plan limits + quota check functions. Tested. |
| `app/routes/app.tsx` | Admin app layout + nav. Modify to add new nav items. |
| `app/routes/app._index.tsx` | Dashboard — tracks activation metric. |
| `extensions/customizer/src/customizer.ts` | Storefront web component entry point. Phase 3 fills this. |
| `scripts/build-extension.ts` | esbuild + 150 KB gzip gate. |
| `.github/workflows/ci.yml` | CI pipeline. |
| `BUGS.md` | Known issues + workarounds. Read before debugging. |
| `CHANGELOG.md` | Full change history by phase/PR. |

---

## Database schema overview

```
Session           ← Shopify session storage (required by auth package)
Shop              ← One row per installed store. Tracks plan + activation.
  └─ CustomizableProduct ← Links Shopify product to FORGE config
       └─ CustomizerConfig  ← Design zones, fonts, colors (JSON columns)
  └─ Design       ← Customer-submitted customizations (quota metering + fulfillment)
```

### Plan tiers

| Tier | Products | Designs/mo | Price |
|---|---|---|---|
| FREE | 5 | 50 | $0 |
| STARTER | 25 | 500 | $19/mo |
| GROWTH | ∞ | 3,000 | $49/mo |
| SCALE | ∞ | ∞ | $129/mo |

Beta launch partners pay $9.99/mo permanently (handled via Shopify discount at billing time).

---

## Tech stack

```
Admin app:     Shopify React Router 7 template + TypeScript + Polaris web components
DB:            Supabase PostgreSQL via Prisma ORM
Hosting:       Vercel (React Router Vercel preset)
Customizer:    Theme App Extension (Online Store 2.0) + vanilla TypeScript + esbuild
Tests:         Vitest
Linting:       ESLint + Prettier
```

---

## Environment variables required

See `.env.example` for full documentation. Critical vars:

```
SHOPIFY_API_KEY         ← From Shopify Partner dashboard
SHOPIFY_API_SECRET      ← From Shopify Partner dashboard
SHOPIFY_APP_URL         ← Your Vercel URL
DATABASE_URL            ← Supabase pooled connection (transaction mode)
DIRECT_URL              ← Supabase direct connection (for migrations)
SCOPES                  ← read_products,write_products,read_orders,write_orders
```

---

## Constraints that must never be violated

1. **No per-order fees** — pricing is flat monthly only. No usage billing on designs.
2. **Bundle < 150 KB gzipped** — CI fails hard. No exceptions.
3. **LCP < 2.5 s on mobile** — enforced via Lighthouse CI once Phase 3 ships.
4. **Preview latency < 300 ms p95** — enforced in Phase 3 load tests.
5. **Non-technical merchant UX** — every flow must be completable by a non-developer.

---

## Development setup

```bash
node --version       # must be >=22.12
npm install
cp .env.example .env # fill in values
npm run db:migrate   # applies Prisma migrations to Supabase
npm run db:generate  # regenerates Prisma client
npm run dev          # starts Shopify CLI dev server with tunnel
```

---

## Running CI locally

```bash
npm run typecheck        # TypeScript
npm run lint             # ESLint
npm test                 # Vitest
npm run build            # Admin app (needs SHOPIFY_API_KEY etc.)
npm run build:customizer # Extension + 150 KB gate
```

---

## Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Foundation scaffold | ✅ Done |
| 2 | Printify integration | ⏳ Next |
| 3 | Storefront 2D customizer | ⏳ Planned |
| 4 | Onboarding flow | ⏳ Planned |
| 5 | Shopify billing | ⏳ Planned |
| 6 | Order fulfillment → Printify | ⏳ Planned |

### Phase 2 — Printify integration (next priority)

Key tasks:
- `PodProvider` interface: `getProducts()`, `syncVariants()`, `submitOrder()`
- Printify first implementation of the interface
- API token stored per-shop in `Shop.printifyShopId` (already in schema)
- Rate limit: 200 product publishes / 30 min — must be respected
- Product import UI in the admin app (wires into Phase 3 customizer setup)

---

## Activation metric

**Target: > 50% of installs get one customizable product live within 24 hours.**

Tracked via `Shop.firstProductLiveAt`. This is set when:
1. A `CustomizableProduct` transitions to status `LIVE`
2. The admin app dashboard reflects this with the `activated` flag

Every onboarding decision (Phase 4) must be measured against this metric.
