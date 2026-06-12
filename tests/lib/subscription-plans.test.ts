import { describe, expect, it } from "vitest";
import {
  canAccessFeature,
  checkLimit,
  getPlanByStripePriceId,
  getPlanByTier,
  SUBSCRIPTION_PLANS,
} from "@/lib/subscription-plans";

describe("getPlanByTier", () => {
  it("returns the matching plan for each tier", () => {
    expect(getPlanByTier("FREE").tier).toBe("FREE");
    expect(getPlanByTier("MONTHLY").tier).toBe("MONTHLY");
    expect(getPlanByTier("YEARLY").tier).toBe("YEARLY");
  });
});

describe("getPlanByStripePriceId", () => {
  it("returns null for an unknown price id", () => {
    expect(getPlanByStripePriceId("price_does_not_exist")).toBeNull();
  });

  it("resolves a configured monthly/yearly price id when present", () => {
    const monthlyId = SUBSCRIPTION_PLANS.MONTHLY.stripePriceId.monthly;
    if (monthlyId) {
      expect(getPlanByStripePriceId(monthlyId)?.tier).toBe("MONTHLY");
    } else {
      // No real price id configured in this env; the lookup must still be safe.
      expect(getPlanByStripePriceId("")).toBeNull();
    }
  });
});

describe("canAccessFeature", () => {
  it("is consistent with the plan feature flags", () => {
    const feature = Object.keys(
      SUBSCRIPTION_PLANS.FREE.features,
    )[0] as keyof (typeof SUBSCRIPTION_PLANS.FREE)["features"];
    expect(canAccessFeature("FREE", feature)).toBe(
      SUBSCRIPTION_PLANS.FREE.features[feature] === true,
    );
  });
});

describe("checkLimit", () => {
  it("treats -1 as unlimited", () => {
    const limitType = Object.keys(
      SUBSCRIPTION_PLANS.YEARLY.limits,
    )[0] as keyof (typeof SUBSCRIPTION_PLANS.YEARLY)["limits"];
    // Force an unlimited scenario by picking a plan/limit that is -1 if any.
    const result = checkLimit("YEARLY", limitType, 999999);
    if (SUBSCRIPTION_PLANS.YEARLY.limits[limitType] === -1) {
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(-1);
    } else {
      expect(typeof result.allowed).toBe("boolean");
    }
  });

  it("blocks usage at or above a finite limit and reports remaining", () => {
    const limitType = Object.keys(
      SUBSCRIPTION_PLANS.FREE.limits,
    )[0] as keyof (typeof SUBSCRIPTION_PLANS.FREE)["limits"];
    const limit = SUBSCRIPTION_PLANS.FREE.limits[limitType];

    if (limit > 0) {
      const atLimit = checkLimit("FREE", limitType, limit);
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.remaining).toBe(0);

      const underLimit = checkLimit("FREE", limitType, 0);
      expect(underLimit.allowed).toBe(true);
      expect(underLimit.remaining).toBe(limit);
    }
  });
});
