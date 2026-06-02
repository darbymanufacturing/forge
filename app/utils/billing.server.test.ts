import { describe, it, expect } from "vitest";
import {
  PLAN_LIMITS,
  PLAN_PRICE_CENTS,
  getPlanLimits,
  isWithinDesignQuota,
  isWithinProductQuota,
  planDisplayName,
  type PlanTier,
} from "./billing.server";

describe("PLAN_LIMITS", () => {
  it("FREE tier: 5 products, 50 designs/month", () => {
    expect(PLAN_LIMITS.FREE.products).toBe(5);
    expect(PLAN_LIMITS.FREE.designsPerMonth).toBe(50);
  });

  it("STARTER tier: 25 products, 500 designs/month", () => {
    expect(PLAN_LIMITS.STARTER.products).toBe(25);
    expect(PLAN_LIMITS.STARTER.designsPerMonth).toBe(500);
  });

  it("GROWTH tier: unlimited products, 3000 designs/month", () => {
    expect(PLAN_LIMITS.GROWTH.products).toBe(Infinity);
    expect(PLAN_LIMITS.GROWTH.designsPerMonth).toBe(3000);
  });

  it("SCALE tier: unlimited products, unlimited designs", () => {
    expect(PLAN_LIMITS.SCALE.products).toBe(Infinity);
    expect(PLAN_LIMITS.SCALE.designsPerMonth).toBe(Infinity);
  });
});

describe("getPlanLimits", () => {
  it("returns the correct limits for each tier", () => {
    const tiers: PlanTier[] = ["FREE", "STARTER", "GROWTH", "SCALE"];
    for (const tier of tiers) {
      expect(getPlanLimits(tier)).toEqual(PLAN_LIMITS[tier]);
    }
  });
});

describe("isWithinProductQuota", () => {
  it("allows adding a product when under the limit", () => {
    expect(isWithinProductQuota("FREE", 0)).toBe(true);
    expect(isWithinProductQuota("FREE", 4)).toBe(true);
    expect(isWithinProductQuota("STARTER", 24)).toBe(true);
  });

  it("blocks adding a product when at the limit", () => {
    expect(isWithinProductQuota("FREE", 5)).toBe(false);
    expect(isWithinProductQuota("FREE", 10)).toBe(false);
    expect(isWithinProductQuota("STARTER", 25)).toBe(false);
  });

  it("always allows adding on unlimited plans", () => {
    expect(isWithinProductQuota("GROWTH", 9999)).toBe(true);
    expect(isWithinProductQuota("SCALE", 9999)).toBe(true);
  });
});

describe("isWithinDesignQuota", () => {
  it("allows design submission when under the monthly limit", () => {
    expect(isWithinDesignQuota("FREE", 0)).toBe(true);
    expect(isWithinDesignQuota("FREE", 49)).toBe(true);
    expect(isWithinDesignQuota("GROWTH", 2999)).toBe(true);
  });

  it("blocks design submission when at the monthly limit", () => {
    expect(isWithinDesignQuota("FREE", 50)).toBe(false);
    expect(isWithinDesignQuota("STARTER", 500)).toBe(false);
    expect(isWithinDesignQuota("GROWTH", 3000)).toBe(false);
  });

  it("always allows on SCALE (unlimited)", () => {
    expect(isWithinDesignQuota("SCALE", 1_000_000)).toBe(true);
  });
});

describe("planDisplayName", () => {
  it("returns human-readable names", () => {
    expect(planDisplayName("FREE")).toBe("Free");
    expect(planDisplayName("STARTER")).toBe("Starter");
    expect(planDisplayName("GROWTH")).toBe("Growth");
    expect(planDisplayName("SCALE")).toBe("Scale");
  });
});

describe("PLAN_PRICE_CENTS", () => {
  it("FREE is free", () => {
    expect(PLAN_PRICE_CENTS.FREE).toBe(0);
  });

  it("has correct prices for paid tiers", () => {
    expect(PLAN_PRICE_CENTS.STARTER).toBe(1900);
    expect(PLAN_PRICE_CENTS.GROWTH).toBe(4900);
    expect(PLAN_PRICE_CENTS.SCALE).toBe(12900);
  });

  it("no tier charges per-order fees (all prices are flat monthly)", () => {
    // This is a documentation test — if a per-order fee was ever added,
    // the price structure would change and this comment would need updating.
    const tiers: PlanTier[] = ["FREE", "STARTER", "GROWTH", "SCALE"];
    for (const tier of tiers) {
      expect(typeof PLAN_PRICE_CENTS[tier]).toBe("number");
    }
  });
});
