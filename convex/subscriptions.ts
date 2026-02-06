/**
 * Subscription Queries and Mutations
 *
 * Handles subscription-related operations including:
 * - Free tier limit enforcement (10 recipes, 3 scans per 30 days)
 * - Premium status checks (plus or creator tiers)
 * - Scan history tracking
 * - User subscription status updates (via webhooks)
 * - Member discount rate calculation
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of recipes for free users */
export const FREE_RECIPE_LIMIT = 10;

/** Maximum number of scans per rolling 30-day window for free users */
export const FREE_SCAN_LIMIT = 3;

/** Rolling window period in milliseconds (30 days) */
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Member discount rate for Plus and Creator tiers (percentage) */
export const MEMBER_DISCOUNT_RATE = 15;

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Subscription status types
 * - free: Basic users with limits
 * - plus: Paid subscribers ($4.99/mo or $49.99/yr)
 * - creator: Higher-tier subscribers ($9.99/mo or $89.99/yr) with extra benefits
 * - trial: Users in trial period (treated as plus for access)
 */
export const subscriptionStatusValidator = v.union(
  v.literal("free"),
  v.literal("plus"),
  v.literal("creator"),
  v.literal("trial")
);

/**
 * Subscription type validator
 */
export const subscriptionTypeValidator = v.union(
  v.literal("monthly"),
  v.literal("annual"),
  v.literal("lifetime")
);

/**
 * Type alias for subscription status
 */
export type SubscriptionStatus = "free" | "plus" | "creator" | "trial";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a subscription status grants premium access
 * Plus, Creator, and Trial users all have premium access
 */
export function hasPremiumAccess(status: string | undefined): boolean {
  return status === "plus" || status === "creator" || status === "trial";
}

/**
 * Check if a subscription status is creator tier
 */
export function hasCreatorAccess(status: string | undefined): boolean {
  return status === "creator";
}

/**
 * Get the member discount rate based on subscription status
 * Returns 15 for plus/creator tiers, 0 for free
 */
export function getMemberDiscountRateForStatus(status: string | undefined): number {
  if (status === "plus" || status === "creator") {
    return MEMBER_DISCOUNT_RATE;
  }
  return 0;
}

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get the user's current subscription status
 *
 * Returns the authenticated user's subscription info including
 * status, type, expiration date, and billing issues.
 */
export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return null;
    }

    return {
      status: user.subscriptionStatus ?? "free",
      type: user.subscriptionType ?? null,
      expiresAt: user.subscriptionExpiresAt ?? null,
      canceledAt: user.subscriptionCanceledAt ?? null,
      hasBillingIssue: user.hasBillingIssue ?? false,
    };
  },
});

/**
 * Check if user has premium access
 *
 * Returns true if user has active plus, creator, or trial subscription.
 * Used for quick entitlement checks.
 */
export const isPremium = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return false;
    }

    const status = user.subscriptionStatus ?? "free";
    return hasPremiumAccess(status);
  },
});

/**
 * Check if user has creator tier
 *
 * Returns true if user has active creator subscription.
 * Used for creator-specific features.
 */
export const isCreatorTier = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return false;
    }

    return hasCreatorAccess(user.subscriptionStatus);
  },
});

/**
 * Get member discount rate for the current user
 *
 * Returns the discount percentage (0, 15) based on subscription tier.
 * Plus and Creator tier users get 15% discount on creator shop products.
 */
export const getMemberDiscountRate = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { discountRate: 0, tier: "free" as const };
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return { discountRate: 0, tier: "free" as const };
    }

    const status = (user.subscriptionStatus ?? "free") as SubscriptionStatus;
    const discountRate = getMemberDiscountRateForStatus(status);

    return {
      discountRate,
      tier: status,
    };
  },
});

/**
 * Get rolling 30-day scan count and reset info
 *
 * Queries scanHistory for scans in the last 30 days.
 * Returns count and when the oldest scan will expire from the window.
 */
export const getScanUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;

    // Get all scans in the 30-day window
    const scans = await ctx.db
      .query("scanHistory")
      .withIndex("by_user_scanned_at", (q) =>
        q.eq("userId", userId).gte("scannedAt", thirtyDaysAgo)
      )
      .collect();

    const count = scans.length;

    // Calculate when the oldest scan will expire from the window
    let resetsInDays: number | null = null;
    if (scans.length > 0) {
      // Sort to find the oldest scan in the window
      const sortedScans = [...scans].sort((a, b) => a.scannedAt - b.scannedAt);
      const oldestScan = sortedScans[0];
      const expiresAt = oldestScan.scannedAt + THIRTY_DAYS_MS;
      const msUntilReset = expiresAt - Date.now();
      resetsInDays = Math.ceil(msUntilReset / (24 * 60 * 60 * 1000));
    }

    return {
      currentCount: count,
      limit: FREE_SCAN_LIMIT,
      remaining: Math.max(0, FREE_SCAN_LIMIT - count),
      resetsInDays,
    };
  },
});

/**
 * Get user's total recipe count
 *
 * Returns the number of recipes the user has saved.
 */
export const getRecipeCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      currentCount: recipes.length,
      limit: FREE_RECIPE_LIMIT,
      remaining: Math.max(0, FREE_RECIPE_LIMIT - recipes.length),
    };
  },
});

/**
 * Get combined usage stats for settings display
 *
 * Returns both recipe and scan usage in a single query.
 */
export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const clerkId = identity.subject;

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    const status = user?.subscriptionStatus ?? "free";
    const isPremiumUser = hasPremiumAccess(status);
    const isCreatorUser = hasCreatorAccess(status);

    // Get recipe count
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get scan count in 30-day window
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    const scans = await ctx.db
      .query("scanHistory")
      .withIndex("by_user_scanned_at", (q) =>
        q.eq("userId", userId).gte("scannedAt", thirtyDaysAgo)
      )
      .collect();

    // Calculate reset time
    let scansResetsInDays: number | null = null;
    if (scans.length > 0) {
      const sortedScans = [...scans].sort((a, b) => a.scannedAt - b.scannedAt);
      const oldestScan = sortedScans[0];
      const expiresAt = oldestScan.scannedAt + THIRTY_DAYS_MS;
      const msUntilReset = expiresAt - Date.now();
      scansResetsInDays = Math.ceil(msUntilReset / (24 * 60 * 60 * 1000));
    }

    return {
      isPremium: isPremiumUser,
      isCreator: isCreatorUser,
      tier: status,
      memberDiscountRate: getMemberDiscountRateForStatus(status),
      recipes: {
        currentCount: recipes.length,
        limit: isPremiumUser ? null : FREE_RECIPE_LIMIT,
        remaining: isPremiumUser
          ? null
          : Math.max(0, FREE_RECIPE_LIMIT - recipes.length),
      },
      scans: {
        currentCount: scans.length,
        limit: isPremiumUser ? null : FREE_SCAN_LIMIT,
        remaining: isPremiumUser
          ? null
          : Math.max(0, FREE_SCAN_LIMIT - scans.length),
        resetsInDays: isPremiumUser ? null : scansResetsInDays,
      },
    };
  },
});

// =============================================================================
// LIMIT CHECK HELPERS (Queries used by mutations)
// =============================================================================

/**
 * Check if user can create a new recipe
 *
 * Returns whether the recipe creation is allowed based on subscription status
 * and current recipe count.
 */
export const checkRecipeLimit = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { allowed: false, error: "Authentication required" };
    }

    const userId = identity.subject;
    const clerkId = identity.subject;

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    // Premium users (plus, creator, trial) always allowed
    if (hasPremiumAccess(user?.subscriptionStatus)) {
      return { allowed: true };
    }

    // Free users - check limit
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const currentCount = recipes.length;

    if (currentCount >= FREE_RECIPE_LIMIT) {
      return {
        allowed: false,
        currentCount,
        limit: FREE_RECIPE_LIMIT,
        error: "RECIPE_LIMIT_EXCEEDED",
      };
    }

    return {
      allowed: true,
      currentCount,
      limit: FREE_RECIPE_LIMIT,
    };
  },
});

/**
 * Check if user can perform a scan
 *
 * Returns whether scanning is allowed based on subscription status
 * and scans in the rolling 30-day window.
 */
export const checkScanLimit = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { allowed: false, error: "Authentication required" };
    }

    const userId = identity.subject;
    const clerkId = identity.subject;

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    // Premium users (plus, creator, trial) always allowed
    if (hasPremiumAccess(user?.subscriptionStatus)) {
      return { allowed: true };
    }

    // Free users - check 30-day window
    const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;
    const scans = await ctx.db
      .query("scanHistory")
      .withIndex("by_user_scanned_at", (q) =>
        q.eq("userId", userId).gte("scannedAt", thirtyDaysAgo)
      )
      .collect();

    const currentCount = scans.length;

    // Calculate reset time
    let resetsInDays: number | null = null;
    if (scans.length > 0) {
      const sortedScans = [...scans].sort((a, b) => a.scannedAt - b.scannedAt);
      const oldestScan = sortedScans[0];
      const expiresAt = oldestScan.scannedAt + THIRTY_DAYS_MS;
      const msUntilReset = expiresAt - Date.now();
      resetsInDays = Math.ceil(msUntilReset / (24 * 60 * 60 * 1000));
    }

    if (currentCount >= FREE_SCAN_LIMIT) {
      return {
        allowed: false,
        currentCount,
        limit: FREE_SCAN_LIMIT,
        resetsInDays,
        error: "SCAN_LIMIT_EXCEEDED",
      };
    }

    return {
      allowed: true,
      currentCount,
      limit: FREE_SCAN_LIMIT,
      resetsInDays,
    };
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Record a scan in the scan history
 *
 * Called after a successful scan to track usage for limit enforcement.
 */
export const recordScan = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    const scanId = await ctx.db.insert("scanHistory", {
      userId,
      scannedAt: now,
    });

    return scanId;
  },
});

// =============================================================================
// INTERNAL MUTATIONS (for webhook use)
// =============================================================================

/**
 * Update user subscription status (internal - called from webhook)
 *
 * Updates user's subscription fields based on RevenueCat webhook events.
 */
export const updateSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    subscriptionStatus: subscriptionStatusValidator,
    subscriptionType: v.optional(subscriptionTypeValidator),
    subscriptionExpiresAt: v.optional(v.number()),
    subscriptionCanceledAt: v.optional(v.number()),
    hasBillingIssue: v.optional(v.boolean()),
    revenuecatUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error(`User not found for clerkId: ${args.clerkId}`);
    }

    const updates: Record<string, unknown> = {
      subscriptionStatus: args.subscriptionStatus,
      updatedAt: Date.now(),
    };

    if (args.subscriptionType !== undefined) {
      updates.subscriptionType = args.subscriptionType;
    }
    if (args.subscriptionExpiresAt !== undefined) {
      updates.subscriptionExpiresAt = args.subscriptionExpiresAt;
    }
    if (args.subscriptionCanceledAt !== undefined) {
      updates.subscriptionCanceledAt = args.subscriptionCanceledAt;
    }
    if (args.hasBillingIssue !== undefined) {
      updates.hasBillingIssue = args.hasBillingIssue;
    }
    if (args.revenuecatUserId !== undefined) {
      updates.revenuecatUserId = args.revenuecatUserId;
    }

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Set billing issue flag (internal - called from webhook)
 *
 * Sets or clears the billing issue flag on a user.
 */
export const setBillingIssue = internalMutation({
  args: {
    clerkId: v.string(),
    hasBillingIssue: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error(`User not found for clerkId: ${args.clerkId}`);
    }

    await ctx.db.patch(user._id, {
      hasBillingIssue: args.hasBillingIssue,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

/**
 * Clear subscription (internal - called from webhook on expiration)
 *
 * Resets user to free tier when subscription expires.
 */
export const clearSubscription = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error(`User not found for clerkId: ${args.clerkId}`);
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: "free",
      subscriptionType: undefined,
      subscriptionExpiresAt: undefined,
      hasBillingIssue: false,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
