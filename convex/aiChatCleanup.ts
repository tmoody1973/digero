/**
 * AI Chat Cleanup Internal Mutations
 *
 * Internal mutations for cleaning up old AI chat messages.
 * Called by cron job to maintain database size limits.
 */

import { internalMutation } from "./_generated/server";
import { BATCH_SIZE, getCutoffTimestamp } from "./lib/chatCleanup";

/**
 * Clean up old AI chat messages
 *
 * Deletes messages older than 30 days from all users.
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

    // Delete each message in the batch
    let deletedCount = 0;
    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }

    // Log cleanup statistics
    const cutoffDate = new Date(cutoffTimestamp).toISOString();
    console.log(`AI Chat Cleanup: Deleted ${deletedCount} messages older than ${cutoffDate}`);

    // Return statistics
    return {
      deletedCount,
      cutoffTimestamp,
      hasMoreToDelete: oldMessages.length === BATCH_SIZE,
    };
  },
});
