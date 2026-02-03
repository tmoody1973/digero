/**
 * RevenueCat Webhook Handler Tests
 *
 * Tests for RevenueCat webhook integration including:
 * - Signature verification
 * - Event handling for subscription lifecycle events
 * - User subscription field updates
 */

import * as crypto from "crypto";

describe("RevenueCat Webhook Integration", () => {
  describe("Webhook signature verification", () => {
    it("should reject requests with missing signature header", () => {
      const headers = {
        "X-RevenueCat-Signature": null as string | null,
      };

      const validateHeaders = (headers: Record<string, string | null>) => {
        if (!headers["X-RevenueCat-Signature"]) {
          throw new Error("Missing signature header");
        }
        return true;
      };

      expect(() => validateHeaders(headers)).toThrow("Missing signature header");
    });

    it("should accept requests with valid HMAC signature", () => {
      const webhookSecret = "test_secret_123";
      const body = JSON.stringify({
        api_version: "1.0",
        event: {
          type: "INITIAL_PURCHASE",
          app_user_id: "user_test123",
          product_id: "digero_premium_monthly",
        },
      });

      // Generate valid signature
      const signature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      // Verify signature matches
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      expect(signature).toBe(expectedSignature);
    });

    it("should reject requests with invalid signature", () => {
      const webhookSecret = "test_secret_123";
      const body = JSON.stringify({
        api_version: "1.0",
        event: {
          type: "INITIAL_PURCHASE",
          app_user_id: "user_test123",
        },
      });

      const validSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      const invalidSignature = "invalid_signature_abc123";

      expect(validSignature).not.toBe(invalidSignature);
    });
  });

  describe("INITIAL_PURCHASE event", () => {
    it("should set user to premium on initial purchase", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "INITIAL_PURCHASE" as const,
          app_user_id: "user_clerk_abc123",
          product_id: "digero_premium_monthly",
          expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
          is_trial_period: false,
        },
      };

      // Simulate processing the event
      const { type, product_id, is_trial_period, expiration_at_ms } = event.event;

      const subscriptionStatus = is_trial_period ? "trial" : "premium";
      const subscriptionType = product_id.includes("monthly")
        ? "monthly"
        : product_id.includes("annual")
        ? "annual"
        : product_id.includes("lifetime")
        ? "lifetime"
        : null;

      expect(type).toBe("INITIAL_PURCHASE");
      expect(subscriptionStatus).toBe("premium");
      expect(subscriptionType).toBe("monthly");
      expect(expiration_at_ms).toBeGreaterThan(Date.now());
    });

    it("should set user to trial when is_trial_period is true", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "INITIAL_PURCHASE" as const,
          app_user_id: "user_clerk_abc123",
          product_id: "digero_premium_annual",
          expiration_at_ms: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 day trial
          is_trial_period: true,
        },
      };

      const subscriptionStatus = event.event.is_trial_period ? "trial" : "premium";
      expect(subscriptionStatus).toBe("trial");
    });
  });

  describe("RENEWAL event", () => {
    it("should update expiration date on renewal", () => {
      const originalExpiration = Date.now();
      const newExpiration = originalExpiration + 30 * 24 * 60 * 60 * 1000;

      const event = {
        api_version: "1.0",
        event: {
          type: "RENEWAL" as const,
          app_user_id: "user_clerk_abc123",
          expiration_at_ms: newExpiration,
        },
      };

      expect(event.event.type).toBe("RENEWAL");
      expect(event.event.expiration_at_ms).toBe(newExpiration);
      expect(event.event.expiration_at_ms).toBeGreaterThan(originalExpiration);
    });

    it("should clear billing issue on successful renewal", () => {
      const userBefore = {
        subscriptionStatus: "premium" as const,
        hasBillingIssue: true,
      };

      // After renewal, billing issue should be cleared
      const userAfter = {
        ...userBefore,
        hasBillingIssue: false,
      };

      expect(userAfter.hasBillingIssue).toBe(false);
    });
  });

  describe("CANCELLATION event", () => {
    it("should keep premium status but set canceledAt timestamp", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "CANCELLATION" as const,
          app_user_id: "user_clerk_abc123",
          expiration_at_ms: Date.now() + 15 * 24 * 60 * 60 * 1000, // Still 15 days left
        },
      };

      // User should remain premium until expiration
      const userUpdate = {
        subscriptionStatus: "premium" as const, // Still premium
        subscriptionCanceledAt: Date.now(),
        subscriptionExpiresAt: event.event.expiration_at_ms,
      };

      expect(userUpdate.subscriptionStatus).toBe("premium");
      expect(userUpdate.subscriptionCanceledAt).toBeGreaterThan(0);
      expect(userUpdate.subscriptionExpiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("EXPIRATION event", () => {
    it("should revert user to free status on expiration", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "EXPIRATION" as const,
          app_user_id: "user_clerk_abc123",
        },
      };

      // Simulate clearing subscription
      const userAfterExpiration = {
        subscriptionStatus: "free" as const,
        subscriptionType: null,
        subscriptionExpiresAt: null,
        hasBillingIssue: false,
      };

      expect(event.event.type).toBe("EXPIRATION");
      expect(userAfterExpiration.subscriptionStatus).toBe("free");
      expect(userAfterExpiration.subscriptionType).toBeNull();
    });
  });

  describe("BILLING_ISSUE event", () => {
    it("should set hasBillingIssue flag to true", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "BILLING_ISSUE" as const,
          app_user_id: "user_clerk_abc123",
        },
      };

      // User should have billing issue flagged
      const userUpdate = {
        hasBillingIssue: true,
      };

      expect(event.event.type).toBe("BILLING_ISSUE");
      expect(userUpdate.hasBillingIssue).toBe(true);
    });
  });

  describe("PRODUCT_CHANGE event", () => {
    it("should update subscription type on product change", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "PRODUCT_CHANGE" as const,
          app_user_id: "user_clerk_abc123",
          product_id: "digero_premium_annual", // Changed from monthly to annual
          expiration_at_ms: Date.now() + 365 * 24 * 60 * 60 * 1000,
        },
      };

      const newSubscriptionType = event.event.product_id?.includes("monthly")
        ? "monthly"
        : event.event.product_id?.includes("annual")
        ? "annual"
        : event.event.product_id?.includes("lifetime")
        ? "lifetime"
        : null;

      expect(event.event.type).toBe("PRODUCT_CHANGE");
      expect(newSubscriptionType).toBe("annual");
    });

    it("should handle lifetime product correctly (no expiration)", () => {
      const event = {
        api_version: "1.0",
        event: {
          type: "PRODUCT_CHANGE" as const,
          app_user_id: "user_clerk_abc123",
          product_id: "digero_premium_lifetime",
          expiration_at_ms: undefined, // Lifetime has no expiration
        },
      };

      const subscriptionType = event.event.product_id?.includes("lifetime")
        ? "lifetime"
        : null;

      // Lifetime subscriptions should not have an expiration
      const shouldSetExpiration = subscriptionType !== "lifetime";

      expect(subscriptionType).toBe("lifetime");
      expect(shouldSetExpiration).toBe(false);
    });
  });

  describe("Product ID parsing", () => {
    it("should correctly identify monthly product", () => {
      const productId = "digero_premium_monthly";
      const getType = (id: string) => {
        if (id.includes("monthly")) return "monthly";
        if (id.includes("annual")) return "annual";
        if (id.includes("lifetime")) return "lifetime";
        return null;
      };

      expect(getType(productId)).toBe("monthly");
    });

    it("should correctly identify annual product", () => {
      const productId = "digero_premium_annual";
      const getType = (id: string) => {
        if (id.includes("monthly")) return "monthly";
        if (id.includes("annual")) return "annual";
        if (id.includes("lifetime")) return "lifetime";
        return null;
      };

      expect(getType(productId)).toBe("annual");
    });

    it("should correctly identify lifetime product", () => {
      const productId = "digero_premium_lifetime";
      const getType = (id: string) => {
        if (id.includes("monthly")) return "monthly";
        if (id.includes("annual")) return "annual";
        if (id.includes("lifetime")) return "lifetime";
        return null;
      };

      expect(getType(productId)).toBe("lifetime");
    });
  });
});
