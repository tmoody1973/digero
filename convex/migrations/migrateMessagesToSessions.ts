/**
 * Migration: Add Sessions to Existing AI Chat Messages
 *
 * This migration creates sessions for existing messages that don't have sessionId.
 * Run once to migrate existing data to the new session-based structure.
 */

import { internalMutation } from "../_generated/server";

/**
 * Migrate existing messages to sessions
 *
 * Creates a session for each user and assigns all their messages to it.
 */
export const migrateMessagesToSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all messages that don't have a sessionId
    // Since we can't query for missing fields, we'll get all messages
    // and check in code
    const allMessages = await ctx.db.query("aiChatMessages").collect();

    // Group messages by userId
    const messagesByUser = new Map<string, typeof allMessages>();

    for (const message of allMessages) {
      // Check if message already has sessionId (skip if migrated)
      if ((message as any).sessionId) continue;

      const userId = message.userId;
      if (!messagesByUser.has(userId)) {
        messagesByUser.set(userId, []);
      }
      messagesByUser.get(userId)!.push(message);
    }

    const now = Date.now();
    let sessionsCreated = 0;
    let messagesUpdated = 0;

    // Create a session for each user and update their messages
    for (const [userId, messages] of messagesByUser) {
      if (messages.length === 0) continue;

      // Sort messages by creation time
      messages.sort((a, b) => a.createdAt - b.createdAt);

      // Create a session for this user
      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];

      // Generate title from first user message
      const firstUserMessage = messages.find((m) => m.role === "user");
      const title = firstUserMessage
        ? firstUserMessage.text.substring(0, 50) +
          (firstUserMessage.text.length > 50 ? "..." : "")
        : "Imported Chat";

      const sessionId = await ctx.db.insert("aiChatSessions", {
        userId,
        title,
        preview: lastMessage.text.substring(0, 100),
        messageCount: messages.length,
        createdAt: firstMessage.createdAt,
        updatedAt: lastMessage.createdAt,
      });

      sessionsCreated++;

      // Update all messages with the session ID
      for (const message of messages) {
        await ctx.db.patch(message._id, {
          sessionId,
        } as any);
        messagesUpdated++;
      }
    }

    console.log(
      `Migration complete: Created ${sessionsCreated} sessions, updated ${messagesUpdated} messages`
    );

    return {
      sessionsCreated,
      messagesUpdated,
    };
  },
});
