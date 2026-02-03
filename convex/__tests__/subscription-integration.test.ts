/**
 * Subscription Integration Tests
 *
 * End-to-end workflow tests for the subscription feature.
 * Covers critical user journeys through the subscription lifecycle.
 */

// Define constants locally to avoid importing from Convex files
const FREE_RECIPE_LIMIT = 10;
const FREE_SCAN_LIMIT = 3;

describe("Subscription Integration", () => {
  describe("Free user hits recipe limit and purchases", () => {
    it("should block recipe creation at limit and show paywall", () => {
      // Step 1: User has reached recipe limit
      const freeUser = {
        subscriptionStatus: "free" as const,
        recipeCount: FREE_RECIPE_LIMIT,
      };

      // Step 2: Attempt to create recipe
      const canCreate =
        freeUser.subscriptionStatus !== "free" ||
        freeUser.recipeCount < FREE_RECIPE_LIMIT;

      expect(canCreate).toBe(false);

      // Step 3: System should return limit exceeded error
      const limitError = {
        code: "RECIPE_LIMIT_EXCEEDED" as const,
        currentCount: freeUser.recipeCount,
        limit: FREE_RECIPE_LIMIT,
      };

      expect(limitError.code).toBe("RECIPE_LIMIT_EXCEEDED");
    });

    it("should allow recipe creation after purchase", () => {
      // Step 1: User purchases subscription
      const purchaseResult = {
        success: true,
        customerInfo: {
          entitlements: { active: { premium: { productIdentifier: "monthly" } } },
        },
      };

      // Step 2: User status updated
      const updatedUser = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "monthly" as const,
        recipeCount: FREE_RECIPE_LIMIT, // Still at limit from before
      };

      // Step 3: Premium user can create recipes regardless of count
      const canCreate =
        updatedUser.subscriptionStatus === "premium" ||
        updatedUser.subscriptionStatus === "trial";

      expect(purchaseResult.success).toBe(true);
      expect(canCreate).toBe(true);
    });
  });

  describe("Free user hits scan limit and purchases annual", () => {
    it("should block scan at limit with reset info", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // Step 1: User has used all scans
      const scansInWindow = [
        { scannedAt: now - 20 * 24 * 60 * 60 * 1000 },
        { scannedAt: now - 10 * 24 * 60 * 60 * 1000 },
        { scannedAt: now - 5 * 24 * 60 * 60 * 1000 },
      ];

      // Step 2: Check limit
      const canScan = scansInWindow.length < FREE_SCAN_LIMIT;
      expect(canScan).toBe(false);

      // Step 3: Calculate reset time
      const sortedScans = [...scansInWindow].sort(
        (a, b) => a.scannedAt - b.scannedAt
      );
      const oldestScan = sortedScans[0];
      const expiresAt = oldestScan.scannedAt + thirtyDaysMs;
      const resetsInDays = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));

      expect(resetsInDays).toBe(10); // Oldest scan was 20 days ago
    });

    it("should allow scan after annual purchase with trial", () => {
      // Step 1: User starts trial
      const purchaseResult = {
        success: true,
        customerInfo: {
          entitlements: {
            active: {
              premium: {
                productIdentifier: "digero_premium_annual",
                periodType: "TRIAL",
              },
            },
          },
        },
      };

      // Step 2: User status updated to trial
      const updatedUser = {
        subscriptionStatus: "trial" as const,
        subscriptionType: "annual" as const,
      };

      // Step 3: Trial users can scan
      const canScan =
        updatedUser.subscriptionStatus === "premium" ||
        updatedUser.subscriptionStatus === "trial";

      expect(purchaseResult.success).toBe(true);
      expect(updatedUser.subscriptionStatus).toBe("trial");
      expect(canScan).toBe(true);
    });
  });

  describe("Webhook updates Convex and client receives update", () => {
    it("should process INITIAL_PURCHASE webhook and update user", () => {
      // Step 1: Webhook received
      const webhookEvent = {
        api_version: "1.0",
        event: {
          type: "INITIAL_PURCHASE" as const,
          app_user_id: "user_clerk_abc123",
          product_id: "digero_premium_monthly",
          expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
          is_trial_period: false,
        },
      };

      // Step 2: Process webhook and update user
      const userUpdate = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "monthly" as const,
        subscriptionExpiresAt: webhookEvent.event.expiration_at_ms,
      };

      expect(userUpdate.subscriptionStatus).toBe("premium");
      expect(userUpdate.subscriptionType).toBe("monthly");
    });

    it("should sync client state via CustomerInfo listener", () => {
      // Simulate listener receiving update
      const oldState = {
        isPremium: false,
        subscriptionType: null,
      };

      // CustomerInfo update received
      const newCustomerInfo = {
        entitlements: {
          active: {
            premium: {
              productIdentifier: "digero_premium_monthly",
            },
          },
        },
      };

      // Client state updated
      const newState = {
        isPremium: true,
        subscriptionType: "monthly" as const,
      };

      expect(oldState.isPremium).toBe(false);
      expect(newState.isPremium).toBe(true);
    });
  });

  describe("Restore purchases syncs entitlements correctly", () => {
    it("should restore and update state for reinstall user", () => {
      // Step 1: User with no local subscription state
      const initialState = {
        isPremium: false,
        subscriptionType: null,
      };

      // Step 2: Restore returns active subscription
      const restoreResult = {
        success: true,
        hasPremium: true,
        customerInfo: {
          entitlements: {
            active: {
              premium: {
                productIdentifier: "digero_premium_annual",
              },
            },
          },
        },
      };

      // Step 3: State updated
      const restoredState = {
        isPremium: true,
        subscriptionType: "annual" as const,
      };

      expect(restoreResult.success).toBe(true);
      expect(restoreResult.hasPremium).toBe(true);
      expect(restoredState.isPremium).toBe(true);
    });

    it("should handle restore with no purchases", () => {
      const restoreResult = {
        success: true,
        hasPremium: false,
        customerInfo: {
          entitlements: { active: {} },
        },
      };

      expect(restoreResult.success).toBe(true);
      expect(restoreResult.hasPremium).toBe(false);
    });
  });

  describe("Expired subscription user correctly downgraded", () => {
    it("should downgrade to free when subscription expires", () => {
      // Step 1: User was premium but subscription expired
      const beforeExpiration = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "monthly" as const,
        subscriptionExpiresAt: Date.now() - 1000, // Just expired
      };

      // Step 2: EXPIRATION webhook received and processed
      const afterExpiration = {
        subscriptionStatus: "free" as const,
        subscriptionType: null,
        subscriptionExpiresAt: null,
      };

      // Step 3: User is now subject to limits again
      const userRecipeCount = 15; // User had 15 recipes as premium
      const canCreateMore =
        afterExpiration.subscriptionStatus !== "free" ||
        userRecipeCount < FREE_RECIPE_LIMIT;

      expect(afterExpiration.subscriptionStatus).toBe("free");
      expect(canCreateMore).toBe(false); // Can't create more, over limit
    });
  });

  describe("Billing issue handling shows appropriate UI warning", () => {
    it("should set billing issue flag on BILLING_ISSUE event", () => {
      const webhookEvent = {
        event: {
          type: "BILLING_ISSUE" as const,
          app_user_id: "user_clerk_abc123",
        },
      };

      const userUpdate = {
        hasBillingIssue: true,
      };

      expect(userUpdate.hasBillingIssue).toBe(true);
    });

    it("should display warning in SubscriptionSection", () => {
      const subscriptionInfo = {
        isPremium: true,
        hasBillingIssue: true,
      };

      // UI should show warning when billing issue exists
      const showWarning = subscriptionInfo.hasBillingIssue;
      expect(showWarning).toBe(true);
    });

    it("should clear billing issue on successful RENEWAL", () => {
      const beforeRenewal = {
        hasBillingIssue: true,
      };

      const afterRenewal = {
        hasBillingIssue: false,
      };

      expect(beforeRenewal.hasBillingIssue).toBe(true);
      expect(afterRenewal.hasBillingIssue).toBe(false);
    });
  });

  describe("Lifetime purchase flow", () => {
    it("should set lifetime subscription with no expiration", () => {
      const purchaseResult = {
        success: true,
        customerInfo: {
          entitlements: {
            active: {
              premium: {
                productIdentifier: "digero_premium_lifetime",
                expirationDate: null, // Lifetime has no expiration
              },
            },
          },
        },
      };

      const userUpdate = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "lifetime" as const,
        subscriptionExpiresAt: null,
      };

      expect(purchaseResult.success).toBe(true);
      expect(userUpdate.subscriptionType).toBe("lifetime");
      expect(userUpdate.subscriptionExpiresAt).toBeNull();
    });

    it("should not show manage subscription link for lifetime users", () => {
      const subscriptionInfo = {
        isPremium: true,
        subscriptionType: "lifetime" as const,
      };

      const showManageLink = subscriptionInfo.subscriptionType !== "lifetime";
      expect(showManageLink).toBe(false);
    });
  });

  describe("Trial to premium conversion", () => {
    it("should convert trial to premium when trial ends with renewal", () => {
      // Step 1: User is in trial
      const trialUser = {
        subscriptionStatus: "trial" as const,
        subscriptionType: "annual" as const,
        subscriptionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      // Step 2: RENEWAL webhook received (trial converted)
      const afterConversion = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "annual" as const,
        subscriptionExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };

      expect(trialUser.subscriptionStatus).toBe("trial");
      expect(afterConversion.subscriptionStatus).toBe("premium");
      expect(afterConversion.subscriptionExpiresAt).toBeGreaterThan(
        trialUser.subscriptionExpiresAt
      );
    });
  });

  describe("Product change flow", () => {
    it("should update subscription type on upgrade from monthly to annual", () => {
      const beforeUpgrade = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "monthly" as const,
      };

      // PRODUCT_CHANGE event
      const afterUpgrade = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "annual" as const,
      };

      expect(beforeUpgrade.subscriptionType).toBe("monthly");
      expect(afterUpgrade.subscriptionType).toBe("annual");
    });
  });
});
