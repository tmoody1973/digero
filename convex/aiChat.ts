/**
 * AI Chat Queries and Mutations
 *
 * CRUD operations for AI chat sessions and messages.
 * Supports real-time subscriptions for live chat updates.
 * All operations enforce authentication and user ownership.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Chat message role validator
 */
const chatRole = v.union(v.literal("user"), v.literal("assistant"));

// ============================================================================
// SESSION QUERIES
// ============================================================================

/**
 * Get all chat sessions for the authenticated user
 *
 * Returns sessions ordered by updatedAt descending (most recent first).
 */
export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const sessions = await ctx.db
      .query("aiChatSessions")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return sessions;
  },
});

/**
 * Get a single session by ID
 */
export const getSession = query({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== identity.subject) {
      return null;
    }

    return session;
  },
});

// ============================================================================
// MESSAGE QUERIES
// ============================================================================

/**
 * Get chat messages for a specific session
 *
 * Returns messages ordered by createdAt ascending (oldest first for chat display).
 */
export const getMessages = query({
  args: {
    sessionId: v.id("aiChatSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit ?? 100;

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }

    // Fetch messages for session
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_session_created", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .take(limit);

    return messages;
  },
});

/**
 * Get a single message by ID
 */
export const getMessage = query({
  args: {
    id: v.id("aiChatMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const message = await ctx.db.get(args.id);

    if (!message || message.userId !== identity.subject) {
      return null;
    }

    return message;
  },
});

// ============================================================================
// SESSION MUTATIONS
// ============================================================================

/**
 * Create a new chat session
 *
 * Returns the new session ID.
 */
export const createSession = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    const sessionId = await ctx.db.insert("aiChatSessions", {
      userId,
      title: args.title ?? "New Chat",
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return sessionId;
  },
});

/**
 * Update session title
 */
export const updateSessionTitle = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return args.sessionId;
  },
});

/**
 * Delete a chat session and all its messages
 */
export const deleteSession = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Session not found");
    }

    // Delete all messages in session
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete session
    await ctx.db.delete(args.sessionId);

    return { deletedMessages: messages.length };
  },
});

// ============================================================================
// MESSAGE MUTATIONS
// ============================================================================

/**
 * Send a user message
 *
 * Creates a new message with role "user".
 * Updates session metadata (messageCount, updatedAt, preview).
 */
export const sendMessage = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    text: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    // Validate message is not empty
    if (!args.text.trim() && !args.imageUrl) {
      throw new Error("Message cannot be empty");
    }

    const now = Date.now();
    const messageText = args.text.trim();

    // Create message
    const messageId = await ctx.db.insert("aiChatMessages", {
      userId,
      sessionId: args.sessionId,
      text: messageText,
      role: "user",
      imageUrl: args.imageUrl,
      createdAt: now,
    });

    // Update session metadata
    const isFirstMessage = session.messageCount === 0;
    const preview = messageText.substring(0, 100);

    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
      updatedAt: now,
      // Auto-generate title from first message if default
      ...(isFirstMessage && session.title === "New Chat"
        ? { title: messageText.substring(0, 50) + (messageText.length > 50 ? "..." : "") }
        : {}),
      // Update preview
      preview,
    });

    return messageId;
  },
});

/**
 * Save an AI assistant response
 *
 * Creates a new message with role "assistant".
 * Updates session messageCount and updatedAt.
 */
export const saveAiResponse = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    text: v.string(),
    recipeData: v.optional(v.any()),
    clarificationQuestions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const now = Date.now();

    // Create message
    const messageId = await ctx.db.insert("aiChatMessages", {
      userId,
      sessionId: args.sessionId,
      text: args.text,
      role: "assistant",
      recipeData: args.recipeData,
      clarificationQuestions: args.clarificationQuestions,
      createdAt: now,
    });

    // Update session metadata
    await ctx.db.patch(args.sessionId, {
      messageCount: session.messageCount + 1,
      updatedAt: now,
    });

    return messageId;
  },
});

/**
 * Delete a single message
 */
export const deleteMessage = mutation({
  args: {
    id: v.id("aiChatMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.userId !== identity.subject) {
      throw new Error("Permission denied");
    }

    // Update session message count
    const session = await ctx.db.get(message.sessionId);
    if (session) {
      await ctx.db.patch(message.sessionId, {
        messageCount: Math.max(0, session.messageCount - 1),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Clear all messages in a session
 */
export const clearSession = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Session not found");
    }

    // Delete all messages
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Reset session
    await ctx.db.patch(args.sessionId, {
      messageCount: 0,
      preview: undefined,
      updatedAt: Date.now(),
    });

    return { deletedCount: messages.length };
  },
});
