/**
 * AI Chat Usage Queries and Mutations
 *
 * Tracks daily Sous Chef AI chat message usage for free tier limits.
 * Free users are limited to 5 messages per day.
 * Plus and Creator tier users have unlimited messages.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hasPremiumAccess } from "./subscriptions";

// =============================================================================
// Constants
// =============================================================================

/** Maximum AI chat messages per day for free users */
export const FREE_DAILY_MESSAGE_LIMIT = 5;

/** Threshold for triggering upgrade prompt (80% of limit) */
export const UPGRADE_PROMPT_THRESHOLD = 4;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get today's date string in YYYY-MM-DD format (UTC)
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get daily AI chat usage for the current user
 *
 * Returns the number of messages sent today and limit information.
 * Used by the Sous Chef chat screen to display remaining messages.
 */
export const getDailyUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const today = getTodayDateString();

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    const isPremiumUser = hasPremiumAccess(user?.subscriptionStatus);

    // For premium users, return unlimited access
    if (isPremiumUser) {
      return {
        messagesUsedToday: 0,
        limit: null,
        remaining: null,
        isUnlimited: true,
        canSend: true,
        shouldShowUpgradePrompt: false,
      };
    }

    // Get today's usage record
    const usageRecord = await ctx.db
      .query("aiChatUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const messagesUsedToday = usageRecord?.messageCount ?? 0;
    const remaining = Math.max(0, FREE_DAILY_MESSAGE_LIMIT - messagesUsedToday);
    const canSend = messagesUsedToday < FREE_DAILY_MESSAGE_LIMIT;
    const shouldShowUpgradePrompt = messagesUsedToday >= UPGRADE_PROMPT_THRESHOLD;

    return {
      messagesUsedToday,
      limit: FREE_DAILY_MESSAGE_LIMIT,
      remaining,
      isUnlimited: false,
      canSend,
      shouldShowUpgradePrompt,
    };
  },
});

/**
 * Check if user can send a message
 *
 * Quick check for message sending permission.
 * Returns detailed information about why sending may be blocked.
 */
export const canSendMessage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        canSend: false,
        reason: "NOT_AUTHENTICATED",
        isUnlimited: false,
      };
    }

    const userId = identity.subject;
    const today = getTodayDateString();

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    const isPremiumUser = hasPremiumAccess(user?.subscriptionStatus);

    // Premium users always allowed
    if (isPremiumUser) {
      return {
        canSend: true,
        isUnlimited: true,
      };
    }

    // Get today's usage
    const usageRecord = await ctx.db
      .query("aiChatUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const messagesUsedToday = usageRecord?.messageCount ?? 0;

    if (messagesUsedToday >= FREE_DAILY_MESSAGE_LIMIT) {
      return {
        canSend: false,
        reason: "DAILY_LIMIT_REACHED",
        isUnlimited: false,
        remaining: 0,
        limit: FREE_DAILY_MESSAGE_LIMIT,
      };
    }

    return {
      canSend: true,
      isUnlimited: false,
      remaining: FREE_DAILY_MESSAGE_LIMIT - messagesUsedToday,
      limit: FREE_DAILY_MESSAGE_LIMIT,
    };
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Increment daily message usage
 *
 * Called after a user sends a message to the Sous Chef.
 * Creates or updates the daily usage record.
 * Returns the updated usage info.
 */
export const incrementUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const today = getTodayDateString();

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    const isPremiumUser = hasPremiumAccess(user?.subscriptionStatus);

    // Premium users don't need usage tracking
    if (isPremiumUser) {
      return {
        messagesUsedToday: 0,
        limit: null,
        remaining: null,
        isUnlimited: true,
        canSend: true,
        shouldShowUpgradePrompt: false,
      };
    }

    // Get existing usage record for today
    const existingRecord = await ctx.db
      .query("aiChatUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    let messagesUsedToday: number;

    if (existingRecord) {
      // Update existing record
      messagesUsedToday = existingRecord.messageCount + 1;
      await ctx.db.patch(existingRecord._id, {
        messageCount: messagesUsedToday,
      });
    } else {
      // Create new record
      messagesUsedToday = 1;
      await ctx.db.insert("aiChatUsage", {
        userId,
        date: today,
        messageCount: messagesUsedToday,
      });
    }

    const remaining = Math.max(0, FREE_DAILY_MESSAGE_LIMIT - messagesUsedToday);
    const canSend = messagesUsedToday < FREE_DAILY_MESSAGE_LIMIT;
    const shouldShowUpgradePrompt = messagesUsedToday >= UPGRADE_PROMPT_THRESHOLD;

    return {
      messagesUsedToday,
      limit: FREE_DAILY_MESSAGE_LIMIT,
      remaining,
      isUnlimited: false,
      canSend,
      shouldShowUpgradePrompt,
    };
  },
});

/**
 * Check and increment usage in one operation
 *
 * Atomic operation that checks if user can send and increments if allowed.
 * Returns success/failure with usage info.
 */
export const checkAndIncrementUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        error: "NOT_AUTHENTICATED",
      };
    }

    const userId = identity.subject;
    const today = getTodayDateString();

    // Get user subscription status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    const isPremiumUser = hasPremiumAccess(user?.subscriptionStatus);

    // Premium users always succeed
    if (isPremiumUser) {
      return {
        success: true,
        usage: {
          messagesUsedToday: 0,
          limit: null,
          remaining: null,
          isUnlimited: true,
          canSend: true,
          shouldShowUpgradePrompt: false,
        },
      };
    }

    // Get existing usage record
    const existingRecord = await ctx.db
      .query("aiChatUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const currentCount = existingRecord?.messageCount ?? 0;

    // Check if limit reached
    if (currentCount >= FREE_DAILY_MESSAGE_LIMIT) {
      return {
        success: false,
        error: "DAILY_LIMIT_REACHED",
        usage: {
          messagesUsedToday: currentCount,
          limit: FREE_DAILY_MESSAGE_LIMIT,
          remaining: 0,
          isUnlimited: false,
          canSend: false,
          shouldShowUpgradePrompt: true,
        },
      };
    }

    // Increment usage
    let messagesUsedToday: number;

    if (existingRecord) {
      messagesUsedToday = existingRecord.messageCount + 1;
      await ctx.db.patch(existingRecord._id, {
        messageCount: messagesUsedToday,
      });
    } else {
      messagesUsedToday = 1;
      await ctx.db.insert("aiChatUsage", {
        userId,
        date: today,
        messageCount: messagesUsedToday,
      });
    }

    const remaining = Math.max(0, FREE_DAILY_MESSAGE_LIMIT - messagesUsedToday);
    const canSend = messagesUsedToday < FREE_DAILY_MESSAGE_LIMIT;
    const shouldShowUpgradePrompt = messagesUsedToday >= UPGRADE_PROMPT_THRESHOLD;

    return {
      success: true,
      usage: {
        messagesUsedToday,
        limit: FREE_DAILY_MESSAGE_LIMIT,
        remaining,
        isUnlimited: false,
        canSend,
        shouldShowUpgradePrompt,
      },
    };
  },
});
