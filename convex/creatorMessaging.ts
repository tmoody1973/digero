/**
 * Creator Messaging Functions
 *
 * Queries and mutations for creator-to-follower messaging.
 * Includes internal functions for the sendCreatorMessage action.
 */

import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// =============================================================================
// Internal Queries (for use by actions)
// =============================================================================

/**
 * Get creator by ID (internal)
 * Used by sendCreatorMessage action to verify creator status
 */
export const getCreatorById = internalQuery({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    // Try to parse as Convex ID
    try {
      const creator = await ctx.db.get(args.creatorId as Id<"creatorProfiles">);
      return creator;
    } catch {
      // If not a valid ID, return null
      return null;
    }
  },
});

// =============================================================================
// Internal Mutations (for use by actions)
// =============================================================================

/**
 * Record a sent message (internal)
 * Called by sendCreatorMessage action after sending notification
 */
export const recordMessage = internalMutation({
  args: {
    creatorId: v.string(),
    title: v.string(),
    body: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    onesignalNotificationId: v.optional(v.string()),
    estimatedRecipients: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("creatorMessages", {
      creatorId: args.creatorId as Id<"creatorProfiles">,
      title: args.title,
      body: args.body,
      status: args.status,
      onesignalNotificationId: args.onesignalNotificationId,
      estimatedRecipients: args.estimatedRecipients,
      errorMessage: args.errorMessage,
      sentAt: Date.now(),
    });

    return messageId;
  },
});

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get message history for a creator
 * Returns messages sorted by sent date (most recent first)
 */
export const getMessageHistory = query({
  args: {
    creatorId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const messages = await ctx.db
      .query("creatorMessages")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId as Id<"creatorProfiles">))
      .order("desc")
      .take(limit);

    return messages;
  },
});

/**
 * Get total messages sent by a creator
 */
export const getMessageCount = query({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("creatorMessages")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId as Id<"creatorProfiles">))
      .filter((q) => q.eq(q.field("status"), "sent"))
      .collect();

    return messages.length;
  },
});

/**
 * Get a single message by ID
 */
export const getMessage = query({
  args: { messageId: v.id("creatorMessages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

// =============================================================================
// Public Mutations
// =============================================================================

/**
 * Delete a message from history
 * Note: This only removes from local history, cannot unsend the notification
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("creatorMessages"),
    creatorId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Verify ownership
    if (message.creatorId !== args.creatorId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});
