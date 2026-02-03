/**
 * YouTube API Quota Tracking
 *
 * Tracks daily YouTube API quota usage to prevent exceeding limits.
 * Default quota: 10,000 units per day (resets at midnight Pacific Time)
 *
 * Quota costs:
 * - search.list: 100 units
 * - videos.list: 1 unit
 * - channels.list: 1 unit
 * - captions.list: 50 units
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * API operation costs in quota units
 */
export const QUOTA_COSTS = {
  SEARCH: 100,
  VIDEOS_LIST: 1,
  CHANNELS_LIST: 1,
  CAPTIONS_LIST: 50,
} as const;

/**
 * Default daily quota limit
 */
const DEFAULT_QUOTA_LIMIT = 10000;

/**
 * Get today's date string in YYYY-MM-DD format (Pacific Time)
 */
function getTodayDateString(): string {
  const now = new Date();
  // Convert to Pacific Time (YouTube quota resets at midnight PT)
  const pacificTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  return pacificTime.toISOString().split("T")[0];
}

/**
 * Get current quota usage for today
 */
export const getQuotaUsage = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDateString();

    const quota = await ctx.db
      .query("youtubeApiQuota")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (!quota) {
      return {
        date: today,
        unitsUsed: 0,
        quotaLimit: DEFAULT_QUOTA_LIMIT,
        remaining: DEFAULT_QUOTA_LIMIT,
        percentUsed: 0,
      };
    }

    return {
      date: quota.date,
      unitsUsed: quota.unitsUsed,
      quotaLimit: quota.quotaLimit,
      remaining: quota.quotaLimit - quota.unitsUsed,
      percentUsed: Math.round((quota.unitsUsed / quota.quotaLimit) * 100),
    };
  },
});

/**
 * Check if we have enough quota for an operation
 */
export const checkQuota = query({
  args: {
    requiredUnits: v.number(),
  },
  handler: async (ctx, args) => {
    const today = getTodayDateString();

    const quota = await ctx.db
      .query("youtubeApiQuota")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    const unitsUsed = quota?.unitsUsed ?? 0;
    const quotaLimit = quota?.quotaLimit ?? DEFAULT_QUOTA_LIMIT;
    const remaining = quotaLimit - unitsUsed;

    return {
      hasQuota: remaining >= args.requiredUnits,
      remaining,
      requiredUnits: args.requiredUnits,
    };
  },
});

/**
 * Record quota usage for an API operation
 */
export const recordQuotaUsage = mutation({
  args: {
    units: v.number(),
    operation: v.string(),
  },
  handler: async (ctx, args) => {
    const today = getTodayDateString();

    const existing = await ctx.db
      .query("youtubeApiQuota")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        unitsUsed: existing.unitsUsed + args.units,
      });

      return {
        date: today,
        unitsUsed: existing.unitsUsed + args.units,
        quotaLimit: existing.quotaLimit,
        operation: args.operation,
        unitsCost: args.units,
      };
    } else {
      // Create new record for today
      await ctx.db.insert("youtubeApiQuota", {
        date: today,
        unitsUsed: args.units,
        quotaLimit: DEFAULT_QUOTA_LIMIT,
      });

      return {
        date: today,
        unitsUsed: args.units,
        quotaLimit: DEFAULT_QUOTA_LIMIT,
        operation: args.operation,
        unitsCost: args.units,
      };
    }
  },
});

/**
 * Reset quota (for testing or manual override)
 */
export const resetQuota = mutation({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetDate = args.date ?? getTodayDateString();

    const existing = await ctx.db
      .query("youtubeApiQuota")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        unitsUsed: 0,
      });
    }

    return { date: targetDate, reset: true };
  },
});
