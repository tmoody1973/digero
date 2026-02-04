/**
 * AI Chat Cleanup Internal Mutations
 *
 * Internal mutations for cleaning up old AI chat messages and sessions.
 * Called by cron job to maintain database size limits.
 */

import { internalMutation } from "./_generated/server";
import { BATCH_SIZE, getCutoffTimestamp } from "./lib/chatCleanup";
import { Id } from "./_generated/dataModel";

/**
 * Clean up old AI chat messages
 *
 * Deletes messages older than 30 days from all users.
 * Updates session message counts accordingly.
 * Processes in batches to avoid timeout issues.
 * Logs statistics about cleanup operations.
 *
 * @returns Object containing cleanup statistics
 */
export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoffTimestamp = getCutoffTimestamp(now);

    // Query for old messages using the by_created index
    const oldMessages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoffTimestamp))
      .take(BATCH_SIZE);

    // Track affected sessions and their deleted message counts
    const sessionDeleteCounts = new Map<Id<"aiChatSessions">, number>();

    // Delete each message in the batch
    let deletedCount = 0;
    for (const message of oldMessages) {
      // Track session message count
      const currentCount = sessionDeleteCounts.get(message.sessionId) ?? 0;
      sessionDeleteCounts.set(message.sessionId, currentCount + 1);

      await ctx.db.delete(message._id);
      deletedCount++;
    }

    // Update session message counts
    for (const [sessionId, deleteCount] of sessionDeleteCounts) {
      const session = await ctx.db.get(sessionId);
      if (session) {
        await ctx.db.patch(sessionId, {
          messageCount: Math.max(0, session.messageCount - deleteCount),
          updatedAt: now,
        });
      }
    }

    // Log cleanup statistics
    const cutoffDate = new Date(cutoffTimestamp).toISOString();
    console.log(`AI Chat Cleanup: Deleted ${deletedCount} messages older than ${cutoffDate}`);
    console.log(`AI Chat Cleanup: Updated ${sessionDeleteCounts.size} sessions`);

    // Return statistics
    return {
      deletedCount,
      cutoffTimestamp,
      sessionsUpdated: sessionDeleteCounts.size,
      hasMoreToDelete: oldMessages.length === BATCH_SIZE,
    };
  },
});

/**
 * Clean up empty chat sessions
 *
 * Deletes sessions that have 0 messages.
 * Should run after message cleanup to remove orphaned sessions.
 */
export const cleanupEmptySessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find all sessions with 0 messages
    const emptySessions = await ctx.db
      .query("aiChatSessions")
      .filter((q) => q.eq(q.field("messageCount"), 0))
      .take(BATCH_SIZE);

    let deletedCount = 0;
    for (const session of emptySessions) {
      // Double-check no messages exist (in case messageCount is out of sync)
      const messages = await ctx.db
        .query("aiChatMessages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .first();

      if (!messages) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }

    console.log(`AI Chat Cleanup: Deleted ${deletedCount} empty sessions`);

    return {
      deletedCount,
      hasMoreToDelete: emptySessions.length === BATCH_SIZE,
    };
  },
});
