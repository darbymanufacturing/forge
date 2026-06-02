# FORGE

**Storefront product customizer for Shopify merchants on Printify.**

No transaction fees. Mobile-first. First customizable product live in under 10 minutes.

---

## Performance budget (non-negotiable gates)

| Metric | Limit |
|---|---|
| Customizer JS bundle (gzipped) | **< 150 KB** |
| LCP on mobile | **< 2.5 s** |
| Preview update latency (p95) | **< 300 ms** |
| Per-order fees | **$0, forever** |

CI fails hard if the bundle gate is violated.

---

## Tech stack

| Layer | Technology |
|---|---|
| Admin app | Shopify App Template — React Router 7, TypeScript, Polaris |
| Database | Supabase PostgreSQL via Prisma |
| Storefront customizer | Theme App Extension (Online Store 2.0), vanilla TypeScript, esbuild |
| Hosting | Vercel |
| POD provider | Printify (Gelato in Phase 2) |
| Billing | Shopify managed app pricing — no usage / per-order charges |

---

## Pricing tiers

| Tier | Products | Designs / month | Price |
|---|---|---|---|
| Free | 5 | 50 | $0 |
| Starter | 25 | 500 | $19/mo |
| Growth | Unlimited | 3,000 | $49/mo |
| Scale | Unlimited | Unlimited | $129/mo |

Beta launch partners: permanent $9.99/mo rate.

---

## Prerequisites (before `npm run dev`)

1. **Shopify Partner account** — [partners.shopify.com](https://partners.shopify.com)
2. **Development store** — create one in your Partner dashboard
3. **Shopify app** — create at Partners → Apps → Create app; copy the API key & secret
4. **Supabase project** — [supabase.com](https://supabase.com); get the DB connection strings
5. **Node.js ≥ 22.12** — check with `node --version`

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET, DATABASE_URL, DIRECT_URL

# 3. Run database migrations
npm run db:migrate

# 4. Generate Prisma client
npm run db:generate

# 5. Start dev server (opens a tunnel to your dev store)
npm run dev
```

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the embedded admin app with Shopify CLI tunnel |
| `npm run build` | Build the admin app for production |
| `npm run build:customizer` | Build the storefront extension (enforces 150 KB gate) |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:migrate` | Run Prisma migrations against your database |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run setup` | Generate client + deploy migrations (used in production startup) |

---

## Project structure

```
app/
  db.server.ts          # Prisma client singleton
  shopify.server.ts     # Shopify app configuration & auth exports
  root.tsx              # HTML document shell
  routes/
    app.tsx             # Embedded admin layout + nav
    app._index.tsx      # Dashboard (activation metric tracking)
    app.products.tsx    # Customizable products list
    app.settings.tsx    # Printify connection + plan
    auth.$.tsx          # Auth catch-all
    auth.login/         # Login page
    webhooks.*          # Shopify & GDPR webhook handlers
  utils/
    billing.server.ts   # Plan limits, quota helpers (tested)

extensions/
  customizer/           # Theme App Extension (Online Store 2.0)
    src/
      customizer.ts     # TypeScript web component (entry point)
    blocks/
      customizer.liquid # App block — product page
      app-embed.liquid  # App embed — page-scoped script loading
    assets/             # Built JS/CSS (generated, not committed)

prisma/
  schema.prisma         # Session + Shop + Product + Config + Design

scripts/
  build-extension.ts    # esbuild + 150 KB size gate

.github/workflows/
  ci.yml                # CI: typecheck → lint → test → build → bundle gate
```

---

## Roadmap

| Phase | Deliverable |
|---|---|
| 1 ✅ | Foundation scaffold, DB schema, extension stub, CI |
| 2 | Printify integration: token connect, product import, variant sync |
| 3 | Storefront 2D customizer: live preview, text/image zones, perf gates |
| 4 | Onboarding flow: < 10 min activation, > 50% activation metric |
| 5 | Shopify managed billing: four tiers + beta $9.99 rate |
| 6 | Order fulfillment: capture design on checkout → render → submit to Printify |
