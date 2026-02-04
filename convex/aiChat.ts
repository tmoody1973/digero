/**
 * AI Chat Queries and Mutations
 *
 * CRUD operations for the aiChatMessages table.
 * Supports real-time subscriptions for live chat updates.
 * All operations enforce authentication and user ownership.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Chat message role validator
 */
const chatRole = v.union(v.literal("user"), v.literal("assistant"));

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get chat messages for the authenticated user
 *
 * Returns messages ordered by createdAt descending (newest first).
 * Supports optional limit for pagination (default 50).
 * Real-time subscriptions automatically update when new messages arrive.
 */
export const getMessages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit ?? 50;

    // Fetch messages ordered by createdAt descending
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first) for chat display
    return messages.reverse();
  },
});

/**
 * Get a single message by ID
 *
 * Returns the message if it exists and belongs to the authenticated user.
 */
export const getMessage = query({
  args: {
    id: v.id("aiChatMessages"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const message = await ctx.db.get(args.id);

    // Return null if message doesn't exist or user doesn't own it
    if (!message || message.userId !== userId) {
      return null;
    }

    return message;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send a user message
 *
 * Creates a new message with role "user".
 * Optionally includes imageUrl for multimodal input.
 */
export const sendMessage = mutation({
  args: {
    text: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Validate message is not empty
    if (!args.text.trim() && !args.imageUrl) {
      throw new Error("Message cannot be empty");
    }

    const messageId = await ctx.db.insert("aiChatMessages", {
      userId,
      text: args.text.trim(),
      role: "user",
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Save an AI assistant response
 *
 * Creates a new message with role "assistant".
 * Includes structured recipeData and clarificationQuestions.
 */
export const saveAiResponse = mutation({
  args: {
    text: v.string(),
    recipeData: v.optional(v.any()),
    clarificationQuestions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const messageId = await ctx.db.insert("aiChatMessages", {
      userId,
      text: args.text,
      role: "assistant",
      recipeData: args.recipeData,
      clarificationQuestions: args.clarificationQuestions,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Clear all chat messages for the authenticated user
 *
 * Deletes all messages in the user's chat history.
 * Use with caution - this is irreversible.
 */
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch all user's messages
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Delete each message
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deletedCount: messages.length };
  },
});

/**
 * Delete a single message
 *
 * Deletes a specific message after validating user ownership.
 */
export const deleteMessage = mutation({
  args: {
    id: v.id("aiChatMessages"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the message
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }

    // Validate ownership
    if (message.userId !== userId) {
      throw new Error("You do not have permission to delete this message");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
