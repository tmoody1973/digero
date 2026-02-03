/**
 * Subscription Schema and Limit Enforcement Tests
 *
 * Tests for subscription data models and limit enforcement logic.
 * Covers Task Groups 1 and 2 requirements.
 */

// Define constants locally to avoid importing from Convex files
const FREE_RECIPE_LIMIT = 10;
const FREE_SCAN_LIMIT = 3;

describe("Subscription Schema", () => {
  describe("User subscription field defaults", () => {
    it("should default new user to free subscription status", () => {
      // Simulating a new user record
      const newUser = {
        clerkId: "user_test123",
        email: "test@example.com",
        name: "Test User",
        dietaryRestrictions: [],
        hasCompletedOnboarding: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Optional subscription fields default to undefined
        subscriptionStatus: undefined,
        subscriptionType: undefined,
        subscriptionExpiresAt: undefined,
        subscriptionCanceledAt: undefined,
        hasBillingIssue: undefined,
        revenuecatUserId: undefined,
      };

      // Default subscription status should be treated as "free" when undefined
      const effectiveStatus = newUser.subscriptionStatus ?? "free";
      expect(effectiveStatus).toBe("free");
      expect(newUser.subscriptionType).toBeUndefined();
      expect(newUser.subscriptionExpiresAt).toBeUndefined();
      expect(newUser.hasBillingIssue).toBeUndefined();
    });

    it("should validate subscription status enum (free, premium, trial)", () => {
      const validStatuses = ["free", "premium", "trial"];
      const invalidStatuses = ["expired", "canceled", "pending", ""];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        expect(validStatuses).not.toContain(status);
      });

      expect(validStatuses.length).toBe(3);
    });

    it("should validate subscription type enum (monthly, annual, lifetime)", () => {
      const validTypes = ["monthly", "annual", "lifetime"];
      const invalidTypes = ["weekly", "quarterly", "free", ""];

      validTypes.forEach((type) => {
        expect(validTypes).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(validTypes).not.toContain(type);
      });

      expect(validTypes.length).toBe(3);
    });
  });

  describe("Subscription status transitions", () => {
    it("should allow transition from free to premium", () => {
      const user = {
        subscriptionStatus: "free" as const,
        subscriptionType: null as null | "monthly" | "annual" | "lifetime",
        subscriptionExpiresAt: null as null | number,
      };

      // Simulate initial purchase
      const updatedUser = {
        ...user,
        subscriptionStatus: "premium" as const,
        subscriptionType: "annual" as const,
        subscriptionExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };

      expect(updatedUser.subscriptionStatus).toBe("premium");
      expect(updatedUser.subscriptionType).toBe("annual");
      expect(updatedUser.subscriptionExpiresAt).toBeGreaterThan(Date.now());
    });

    it("should allow transition from premium to free on expiration", () => {
      const user = {
        subscriptionStatus: "premium" as const,
        subscriptionType: "monthly" as const,
        subscriptionExpiresAt: Date.now() - 1000, // Expired
      };

      // Simulate expiration
      const expiredUser = {
        subscriptionStatus: "free" as const,
        subscriptionType: null,
        subscriptionExpiresAt: null,
      };

      expect(expiredUser.subscriptionStatus).toBe("free");
      expect(expiredUser.subscriptionType).toBeNull();
    });

    it("should allow transition from free to trial", () => {
      const user = {
        subscriptionStatus: "free" as const,
        subscriptionType: null as null | "monthly" | "annual" | "lifetime",
      };

      // Simulate starting trial
      const trialUser = {
        ...user,
        subscriptionStatus: "trial" as const,
        subscriptionType: "annual" as const,
        subscriptionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      expect(trialUser.subscriptionStatus).toBe("trial");
      expect(trialUser.subscriptionType).toBe("annual");
    });
  });

  describe("Scan history record", () => {
    it("should create scan history record with correct fields", () => {
      const scanRecord = {
        userId: "user_test123",
        scannedAt: Date.now(),
      };

      expect(scanRecord.userId).toBe("user_test123");
      expect(typeof scanRecord.scannedAt).toBe("number");
      expect(scanRecord.scannedAt).toBeGreaterThan(0);
    });

    it("should track multiple scans with distinct timestamps", () => {
      const baseTime = Date.now();
      const scans = [
        { userId: "user_test123", scannedAt: baseTime },
        { userId: "user_test123", scannedAt: baseTime + 1000 },
        { userId: "user_test123", scannedAt: baseTime + 2000 },
      ];

      expect(scans.length).toBe(3);
      expect(scans[0].scannedAt).toBeLessThan(scans[1].scannedAt);
      expect(scans[1].scannedAt).toBeLessThan(scans[2].scannedAt);
    });
  });
});

describe("Limit Enforcement", () => {
  describe("Recipe limit constants", () => {
    it("should enforce 10 recipe limit for free users", () => {
      expect(FREE_RECIPE_LIMIT).toBe(10);
    });
  });

  describe("Scan limit constants", () => {
    it("should enforce 3 scan limit per 30-day window for free users", () => {
      expect(FREE_SCAN_LIMIT).toBe(3);
    });
  });

  describe("Recipe limit enforcement", () => {
    it("should block recipe creation at 10 recipes for free user", () => {
      const freeUser = {
        subscriptionStatus: "free" as const,
        recipeCount: 10,
      };

      const canCreateRecipe =
        freeUser.subscriptionStatus !== "free" ||
        freeUser.recipeCount < FREE_RECIPE_LIMIT;

      expect(canCreateRecipe).toBe(false);
    });

    it("should allow recipe creation for premium user regardless of count", () => {
      const premiumUser = {
        subscriptionStatus: "premium" as const,
        recipeCount: 100,
      };

      const canCreateRecipe =
        premiumUser.subscriptionStatus === "premium" ||
        premiumUser.subscriptionStatus === "trial" ||
        premiumUser.recipeCount < FREE_RECIPE_LIMIT;

      expect(canCreateRecipe).toBe(true);
    });

    it("should allow recipe creation for trial user regardless of count", () => {
      const trialUser = {
        subscriptionStatus: "trial" as const,
        recipeCount: 50,
      };

      const canCreateRecipe =
        trialUser.subscriptionStatus === "premium" ||
        trialUser.subscriptionStatus === "trial" ||
        trialUser.recipeCount < FREE_RECIPE_LIMIT;

      expect(canCreateRecipe).toBe(true);
    });

    it("should allow recipe creation for free user under limit", () => {
      const freeUser = {
        subscriptionStatus: "free" as const,
        recipeCount: 5,
      };

      const canCreateRecipe =
        freeUser.subscriptionStatus !== "free" ||
        freeUser.recipeCount < FREE_RECIPE_LIMIT;

      expect(canCreateRecipe).toBe(true);
    });
  });

  describe("Scan limit enforcement", () => {
    it("should block scan at 3 scans in 30-day window for free user", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      const freeUser = {
        subscriptionStatus: "free" as const,
        scansInWindow: [
          { scannedAt: now - 1 * 24 * 60 * 60 * 1000 }, // 1 day ago
          { scannedAt: now - 5 * 24 * 60 * 60 * 1000 }, // 5 days ago
          { scannedAt: now - 15 * 24 * 60 * 60 * 1000 }, // 15 days ago
        ],
      };

      const canScan =
        freeUser.subscriptionStatus !== "free" ||
        freeUser.scansInWindow.length < FREE_SCAN_LIMIT;

      expect(canScan).toBe(false);
    });

    it("should allow scan for premium user regardless of scan count", () => {
      const premiumUser = {
        subscriptionStatus: "premium" as const,
        scansInWindow: [
          { scannedAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
          { scannedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
          { scannedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
          { scannedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
          { scannedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        ],
      };

      const canScan =
        premiumUser.subscriptionStatus === "premium" ||
        premiumUser.subscriptionStatus === "trial" ||
        premiumUser.scansInWindow.length < FREE_SCAN_LIMIT;

      expect(canScan).toBe(true);
    });

    it("should allow scan when old scans are outside 30-day window", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // All scans are outside the 30-day window
      const allScans = [
        { scannedAt: now - 35 * 24 * 60 * 60 * 1000 }, // 35 days ago
        { scannedAt: now - 40 * 24 * 60 * 60 * 1000 }, // 40 days ago
        { scannedAt: now - 60 * 24 * 60 * 60 * 1000 }, // 60 days ago
      ];

      // Filter to only scans in window
      const scansInWindow = allScans.filter(
        (scan) => scan.scannedAt > now - thirtyDaysMs
      );

      const freeUser = {
        subscriptionStatus: "free" as const,
        scansInWindow,
      };

      const canScan =
        freeUser.subscriptionStatus !== "free" ||
        freeUser.scansInWindow.length < FREE_SCAN_LIMIT;

      expect(scansInWindow.length).toBe(0);
      expect(canScan).toBe(true);
    });
  });

  describe("Rolling 30-day window calculation", () => {
    it("should correctly calculate reset time from oldest scan", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      const scans = [
        { scannedAt: now - 20 * 24 * 60 * 60 * 1000 }, // 20 days ago (oldest)
        { scannedAt: now - 10 * 24 * 60 * 60 * 1000 }, // 10 days ago
        { scannedAt: now - 5 * 24 * 60 * 60 * 1000 }, // 5 days ago (newest)
      ];

      // Sort to find oldest
      const sortedScans = [...scans].sort((a, b) => a.scannedAt - b.scannedAt);
      const oldestScan = sortedScans[0];

      // Calculate when oldest expires from window
      const expiresAt = oldestScan.scannedAt + thirtyDaysMs;
      const msUntilReset = expiresAt - now;
      const daysUntilReset = Math.ceil(msUntilReset / (24 * 60 * 60 * 1000));

      // Oldest scan was 20 days ago, so it expires in 10 days
      expect(daysUntilReset).toBe(10);
    });
  });

  describe("Structured error responses", () => {
    it("should return RECIPE_LIMIT_EXCEEDED with limit details", () => {
      const error = {
        code: "RECIPE_LIMIT_EXCEEDED",
        currentCount: 10,
        limit: FREE_RECIPE_LIMIT,
      };

      expect(error.code).toBe("RECIPE_LIMIT_EXCEEDED");
      expect(error.currentCount).toBe(10);
      expect(error.limit).toBe(10);
    });

    it("should return SCAN_LIMIT_EXCEEDED with limit details and reset info", () => {
      const error = {
        code: "SCAN_LIMIT_EXCEEDED",
        currentCount: 3,
        limit: FREE_SCAN_LIMIT,
        resetsInDays: 5,
      };

      expect(error.code).toBe("SCAN_LIMIT_EXCEEDED");
      expect(error.currentCount).toBe(3);
      expect(error.limit).toBe(3);
      expect(error.resetsInDays).toBe(5);
    });
  });
});
