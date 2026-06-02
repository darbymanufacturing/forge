# FORGE — Changelog

All notable changes to FORGE are documented here.
Format: `[Phase X — PR Title] YYYY-MM-DD`

---

## [Phase 1 — Foundation Scaffold] 2026-05-22

### Added

**Shopify app skeleton (React Router 7)**
- `package.json` — exact dependency versions from official Shopify React Router template; added `vitest`, `esbuild`, `tsx` for FORGE-specific needs.
- `shopify.app.toml` — app configuration with scopes (`read/write_products`, `read/write_orders`), app-specific webhooks, and GDPR privacy compliance URLs.
- `vite.config.ts` — Vite 6 config with React Router plugin, HMR, CORS for Shopify Admin embedding.
- `tsconfig.json` — strict TypeScript, ES2022 target, bundler module resolution.
- `.eslintrc.cjs` — ESLint with React, TypeScript, import, JSX-a11y rules.
- `.npmrc` — `engine-strict=true`, `shamefully-hoist=true`.
- `.prettierignore` — excludes build artifacts and extension assets.
- `env.d.ts` — Vite + React Router type references.
- `.graphqlrc.ts` — GraphQL codegen config for Shopify Admin API.

**Application files**
- `app/db.server.ts` — Prisma client singleton (prevents connection flooding in HMR).
- `app/shopify.server.ts` — `shopifyApp()` init with Prisma session storage, scopes, API version October 2025.
- `app/root.tsx` — HTML document shell with Shopify CDN font preconnect.
- `app/routes/app.tsx` — Embedded admin layout with App Bridge, FORGE nav (Dashboard / Products / Settings).
- `app/routes/app._index.tsx` — Dashboard: upserts Shop on first load, tracks `firstProductLiveAt` activation metric, shows plan + quota summary, contextual banner for un-activated merchants.
- `app/routes/app.products.tsx` — Customizable products list with quota-aware "Add product" CTA.
- `app/routes/app.settings.tsx` — Printify connection UI stub + plan display.
- `app/routes/auth.$.tsx` — Auth catch-all route.
- `app/routes/auth.login/route.tsx` — Login page (Polaris web components).
- `app/routes/auth.login/error.server.ts` — `loginErrorMessage()` helper.

**Webhook handlers**
- `webhooks.app.uninstalled.tsx` — Deletes sessions on uninstall; keeps Shop/product data for reinstalls.
- `webhooks.app.scopes_update.tsx` — Updates session scope string.
- `webhooks.customers.data_request.tsx` — GDPR: logs data request (full export is Phase N TODO).
- `webhooks.customers.redact.tsx` — GDPR: deletes Design rows for the customer's orders.
- `webhooks.shop.redact.tsx` — GDPR: hard-deletes all Shop data 48h after uninstall.

**Database schema** (`prisma/schema.prisma`)
- Provider: PostgreSQL (Supabase). Dual URLs: `DATABASE_URL` (pooled) + `DIRECT_URL` (direct, for migrations).
- `Session` model — required by `@shopify/shopify-app-session-storage-prisma`.
- `Shop` model — `domain`, `plan` (enum), `installedAt`, `firstProductLiveAt` (activation metric), `printifyShopId`.
- `PlanTier` enum — `FREE | STARTER | GROWTH | SCALE`.
- `CustomizableProduct` model — links Shopify product GID to FORGE config; `status` (DRAFT/LIVE/ARCHIVED); unique constraint on `(shopId, shopifyProductId)`.
- `CustomizerConfig` model — `designAreas: Json`, `allowedFonts`, `allowedColors`, `baseImageUrl`.
- `Design` model — customer-submitted customizations; `designData: Json`; `renderedImageUrl`; status workflow (PENDING → RENDERED → SUBMITTED / FAILED); indexes on `(shopId, createdAt)` and `shopifyOrderId`.

**Billing utilities** (`app/utils/billing.server.ts`)
- `PLAN_LIMITS` — constant object with exact limits per tier.
- `getPlanLimits(plan)` — returns limit object.
- `isWithinProductQuota(plan, count)` — quota check.
- `isWithinDesignQuota(plan, count)` — quota check.
- `planDisplayName(plan)` — human-readable name.
- `PLAN_PRICE_CENTS` — monthly price in cents (no per-order fees documented explicitly).

**Theme App Extension** (`extensions/customizer/`)
- `shopify.extension.toml` — type `"theme"`, handle `"forge-customizer"`, API version 2025-10.
- `blocks/customizer.liquid` — App Block for product pages; mounts `<forge-customizer>` web component with product ID + shop attributes; includes built JS/CSS assets.
- `blocks/app-embed.liquid` — App Embed Block; page-scoped script loading (only loads on product pages) to minimise perf impact.
- `src/customizer.ts` — `ForgeCustomizer` custom element stub. Loads config from API, renders loading shimmer → placeholder UI. Fails silently in production (never breaks product page). Phase 3 replaces placeholder with real 2D canvas.
- `extensions/customizer/assets/.gitkeep` — reserves built asset directory.

**Build pipeline** (`scripts/build-extension.ts`)
- esbuild: IIFE format, ES2020 target, minified in production, sourcemaps in watch mode.
- Gzip check: reads built file, gzips in memory, **fails CI with exit code 1 if > 150 KB** (non-negotiable gate).
- Watch mode via `--watch` flag (used by `npm run build:customizer -- --watch`).
- Auto-creates empty `forge-customizer.css` if not present (prevents 404 on theme load).

**Tests** (`app/utils/billing.server.test.ts`)
- Vitest test suite: `PLAN_LIMITS`, `getPlanLimits`, `isWithinProductQuota`, `isWithinDesignQuota`, `planDisplayName`, `PLAN_PRICE_CENTS`.
- All 18 test cases document and enforce the pricing spec.
- `vitest.config.ts` — node environment, `vite-tsconfig-paths`, coverage on `app/utils/**`.

**CI** (`.github/workflows/ci.yml`)
- Runs on push to `main`, `claude/**`, `feature/**`; on PR to `main`.
- Concurrency group with cancel-in-progress.
- Steps: checkout → Node 22 setup (npm cache) → install → prisma generate → typecheck → lint → test → build admin app → build customizer (bundle gate).

**Documentation**
- `README.md` — setup instructions, performance budget table, pricing tiers, project structure, roadmap.
- `AGENTS.md` — agent handoff: full context, what's built, what's not, key files, constraints, activation metric, Phase 2 tasks.
- `BUGS.md` — 6 known issues documented with resolution paths and workarounds.
- `.env.example` — all required environment variables with descriptions.

### Changed
- `README.md` — replaced the one-liner with full project documentation.
- `.gitignore` — updated to cover React Router, Shopify CLI, and extension build artifacts.

---

## [Unreleased]

### Phase 2 — Printify Integration (planned)
- `PodProvider` interface definition
- Printify API client (`app/services/printify.server.ts`)
- Product import + blueprint sync
- Token-per-shop storage
- Rate limiting (200 product publishes / 30 min)

### Phase 3 — Storefront 2D Customizer (planned)
- Real 2D canvas rendering in `forge-customizer.ts`
- `/apps/forge/customizer-config` API endpoint
- Text + image layer placement
- Real-time preview (< 300 ms p95 gate)
- Lighthouse CI gate for LCP < 2.5 s

### Phase 4 — Onboarding Flow (planned)
- < 10 minute activation experience
- Sets `Shop.firstProductLiveAt`
- Activation metric reporting

### Phase 5 — Billing (planned)
- Shopify managed app pricing (recurring, 30-day)
- Beta $9.99 rate via Shopify discount
- In-app quota enforcement connected to billing tier

### Phase 6 — Order Fulfillment (planned)
- Capture customization on add-to-cart
- Render artwork
- Submit to Printify with fulfillment data
