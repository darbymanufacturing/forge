/**
 * Billing utilities — plan limits and quota checks.
 *
 * Pricing tiers (no per-order fees on any tier, ever):
 *   FREE    — 5 products,         50 designs / month
 *   STARTER — 25 products,       500 designs / month  ($19/mo)
 *   GROWTH  — unlimited,       3,000 designs / month  ($49/mo)
 *   SCALE   — unlimited,        unlimited designs     ($129/mo)
 *
 * Beta launch partners pay $9.99/mo permanently (grandfathered).
 */

export type PlanTier = "FREE" | "STARTER" | "GROWTH" | "SCALE";

export interface PlanLimits {
  /** Maximum number of active customizable products. Infinity = unlimited. */
  products: number;
  /** Maximum designs submitted per calendar month. Infinity = unlimited. */
  designsPerMonth: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: { products: 5, designsPerMonth: 50 },
  STARTER: { products: 25, designsPerMonth: 500 },
  GROWTH: { products: Infinity, designsPerMonth: 3_000 },
  SCALE: { products: Infinity, designsPerMonth: Infinity },
} as const;

/**
 * Returns the limits for a given plan tier.
 */
export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Returns true if the shop can add another customizable product under
 * the given plan and current product count.
 */
export function isWithinProductQuota(
  plan: PlanTier,
  currentProductCount: number,
): boolean {
  return currentProductCount < PLAN_LIMITS[plan].products;
}

/**
 * Returns true if the shop can submit another design under the given plan
 * and designs-this-month count.
 */
export function isWithinDesignQuota(
  plan: PlanTier,
  designsThisMonth: number,
): boolean {
  return designsThisMonth < PLAN_LIMITS[plan].designsPerMonth;
}

/**
 * Human-readable plan display name.
 */
export function planDisplayName(plan: PlanTier): string {
  return (
    { FREE: "Free", STARTER: "Starter", GROWTH: "Growth", SCALE: "Scale" }[
      plan
    ] ?? plan
  );
}

/**
 * Monthly price in cents (USD). 0 = free.
 * Beta cohort ($9.99) is handled by the Shopify billing discount,
 * not by a separate tier in this enum.
 */
export const PLAN_PRICE_CENTS: Record<PlanTier, number> = {
  FREE: 0,
  STARTER: 1900,
  GROWTH: 4900,
  SCALE: 12900,
} as const;
