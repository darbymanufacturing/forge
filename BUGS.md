# FORGE — Known Issues & Bugs

This file tracks known issues, workarounds, and technical debt.
Update it whenever a bug is found or resolved.

---

## Open issues

### BUG-001 — `shopify.app.toml` has placeholder URLs
**Status:** Open — by design for Phase 1  
**Severity:** Low (dev only)  
**Description:**  
`shopify.app.toml` contains `client_id = ""` and
`application_url = "https://PLACEHOLDER.vercel.app"`. These must be filled in
with real values before `shopify app dev` will work end-to-end.  
**Resolution:**  
Run `shopify app config link` after creating the app in the Shopify Partner
dashboard, or manually populate:
- `client_id` — from Partner dashboard → App → Client ID
- `application_url` — your Vercel deployment URL  
**Workaround:** The code scaffold is complete; no functionality breaks.

---

### BUG-002 — Prisma migration not yet applied
**Status:** Open — requires user credentials  
**Severity:** Medium (app won't boot without a DB)  
**Description:**  
`prisma/schema.prisma` targets Supabase PostgreSQL but no migration has been
applied because `DATABASE_URL` and `DIRECT_URL` require a real Supabase project.
The `prisma/migrations/` directory does not exist yet.  
**Resolution:**
1. Create or confirm a Supabase project (use the Supabase MCP tool if in-session).
2. Populate `.env` with `DATABASE_URL` and `DIRECT_URL`.
3. Run `npm run db:migrate` — this generates and applies the initial migration.  
**Workaround:** Code compiles; only runtime DB calls will fail.

---

### BUG-003 — Polaris `s-*` web component TypeScript types are partial
**Status:** Open — upstream limitation  
**Severity:** Low (type errors in editor, not runtime)  
**Description:**  
`@shopify/polaris-types` (v1.0.1) provides typings for Shopify's new `s-*`
HTML custom elements (e.g., `<s-button>`, `<s-banner>`, `<s-badge>`). Some
components used in FORGE routes may have incomplete or missing type definitions.
This can cause TypeScript warnings in `app/routes/*.tsx` files.  
**Resolution:**  
Add type augmentations in `app/types/polaris.d.ts` if type errors block CI.
At runtime, the components work correctly in the Shopify Admin (they are
server-rendered by Shopify's own CDN).  
**Workaround:** `@ts-expect-error` or `// eslint-disable` comment on specific
offending lines. Check for `@shopify/polaris-types` updates — Shopify is
actively maintaining this package.

---

### BUG-004 — `forge-customizer.js` references a placeholder API endpoint
**Status:** Open — intentional Phase 1 stub  
**Severity:** Low (storefront shows empty UI, not broken)  
**Description:**  
`extensions/customizer/src/customizer.ts` calls
`/apps/forge/customizer-config?shop=…&productId=…`. This endpoint doesn't exist
yet — it's a Phase 3 deliverable. If the extension is installed on a store
before Phase 3 ships, the API call returns 404 and the component renders nothing
(silently, as designed — it never breaks the product page).  
**Resolution:** Build and deploy the `/apps/forge/customizer-config` route in
Phase 3.  
**Workaround:** The component gracefully handles the 404 and hides itself.

---

### BUG-005 — `app/routes/auth.login/route.tsx` uses `e.currentTarget.value` on onChange
**Status:** Open — may need Polaris types  
**Severity:** Low (TypeScript only)  
**Description:**  
The `onChange` handler on `<s-text-field>` casts to `React.ChangeEvent<HTMLInputElement>`.
The actual event type for Polaris web component custom events may differ.  
**Resolution:** Update the type cast when `@shopify/polaris-types` publishes
the correct custom event type for `s-text-field`.  
**Workaround:** The cast works at runtime; TypeScript may warn.

---

## Resolved issues

### ~~BUG-006~~ — Prisma schema multiline @relation syntax error ✅ Fixed
**Fixed in:** Phase 1 foundation PR  
**Description:** Prisma v6 did not accept multi-line `@relation(...)` with  
extra whitespace before array arguments. `prisma generate` failed with  
`P1012` validation errors.  
**Fix:** Collapsed `@relation` to a single line in `prisma/schema.prisma`  
(`CustomizerConfig.customizableProduct` relation).

### ~~BUG-007~~ — Polaris `background` and `gap` prop values ✅ Fixed
**Fixed in:** Phase 1 foundation PR  
**Description:** Used non-existent values `"info-subdued"`, `"warning-subdued"`,  
`"success-subdued"` for `<s-box background>`, and `"tight"` for `<s-stack gap>`.  
Valid background values: `'transparent' | 'subdued' | 'base' | 'strong'`.  
Valid gap values: SpacingKeyword (`'small'`, `'base'`, `'large'`, etc. or `'none'`).  
**Fix:** Changed to `background="subdued"` and `gap="base"` throughout routes.

### ~~BUG-008~~ — `s-text-field` has no `type` prop ✅ Fixed
**Fixed in:** Phase 1 foundation PR  
**Description:** Used `type="password"` on `s-text-field` — the component doesn't  
accept a `type` prop (use `s-password-field` for passwords).  
**Fix:** Removed `type` prop from the Printify token field.

---

## Technical debt

| ID | Item | Priority |
|---|---|---|
| TD-001 | `CustomizerConfig.designAreas` is `Json` — no Zod validation at write time | Medium |
| TD-002 | `Design.designData` is `Json` — schema validation deferred to Phase 3 | Medium |
| TD-003 | No E2E tests yet — Playwright suite planned for Phase 3 | Medium |
| TD-004 | LCP Lighthouse CI gate is configured but inert until Phase 3 | Low |
| TD-005 | `app/routes/app._index.tsx` upserts Shop on every page load — add a Prisma `findFirst` cache or React Router headers caching | Low |
| TD-006 | `GDPR customers/data_request` logs only — full data export not implemented | Medium (required before public launch) |
