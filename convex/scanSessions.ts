/**
 * Scan Sessions Mutations and Queries
 *
 * CRUD operations for managing cookbook scanning sessions.
 * Tracks active sessions, links to physical cookbooks, and
 * manages the list of recipes scanned in each session.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Session status validator
 */
const sessionStatus = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled")
);

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Start a new scan session
 *
 * Creates a new scanning session for a cookbook.
 * Optionally links to an existing physical cookbook.
 */
export const startSession = mutation({
  args: {
    bookName: v.string(),
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Cancel any existing active sessions for this user
    const activeSessions = await ctx.db
      .query("scanSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        status: "cancelled",
        completedAt: now,
      });
    }

    // Create new session
    const sessionId = await ctx.db.insert("scanSessions", {
      userId,
      bookName: args.bookName,
      physicalCookbookId: args.physicalCookbookId,
      coverImageId: args.coverImageId,
      status: "active",
      scannedRecipeIds: [],
      startedAt: now,
    });

    return sessionId;
  },
});

/**
 * Update an active scan session
 *
 * Updates session fields like cookbook name, cover image, or physical cookbook link.
 * Only works on active sessions.
 */
export const updateSession = mutation({
  args: {
    sessionId: v.id("scanSessions"),
    bookName: v.optional(v.string()),
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validate ownership
    if (session.userId !== userId) {
      throw new Error("You do not have permission to update this session");
    }

    // Validate session is active
    if (session.status !== "active") {
      throw new Error("Cannot update a completed or cancelled session");
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (args.bookName !== undefined) {
      updates.bookName = args.bookName;
    }
    if (args.physicalCookbookId !== undefined) {
      updates.physicalCookbookId = args.physicalCookbookId;
    }
    if (args.coverImageId !== undefined) {
      updates.coverImageId = args.coverImageId;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.sessionId, updates);
    }

    return args.sessionId;
  },
});

/**
 * Add a scanned recipe to the session
 *
 * Appends a recipe ID to the session's scannedRecipeIds array.
 */
export const addRecipeToSession = mutation({
  args: {
    sessionId: v.id("scanSessions"),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validate ownership
    if (session.userId !== userId) {
      throw new Error("You do not have permission to update this session");
    }

    // Validate session is active
    if (session.status !== "active") {
      throw new Error("Cannot add recipes to a completed or cancelled session");
    }

    // Add recipe ID to array
    await ctx.db.patch(args.sessionId, {
      scannedRecipeIds: [...session.scannedRecipeIds, args.recipeId],
    });

    return args.sessionId;
  },
});

/**
 * Complete a scan session
 *
 * Marks the session as completed and sets the completedAt timestamp.
 */
export const completeSession = mutation({
  args: {
    sessionId: v.id("scanSessions"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Fetch the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validate ownership
    if (session.userId !== userId) {
      throw new Error("You do not have permission to complete this session");
    }

    // Validate session is active
    if (session.status !== "active") {
      throw new Error("Session is already completed or cancelled");
    }

    // Mark as completed
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: now,
    });

    return args.sessionId;
  },
});

/**
 * Cancel a scan session
 *
 * Marks the session as cancelled. Does not delete scanned recipes.
 */
export const cancelSession = mutation({
  args: {
    sessionId: v.id("scanSessions"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Fetch the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validate ownership
    if (session.userId !== userId) {
      throw new Error("You do not have permission to cancel this session");
    }

    // If session is already completed or cancelled, just return (idempotent)
    if (session.status !== "active") {
      return args.sessionId;
    }

    // Mark as cancelled
    await ctx.db.patch(args.sessionId, {
      status: "cancelled",
      completedAt: now,
    });

    return args.sessionId;
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the user's active scan session
 *
 * Returns the current active session if one exists, null otherwise.
 * A user can only have one active session at a time.
 */
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const session = await ctx.db
      .query("scanSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!session) {
      return null;
    }

    // Resolve cover image URL
    let coverImageUrl = null;
    if (session.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(session.coverImageId);
    }

    return {
      ...session,
      coverImageUrl,
    };
  },
});

/**
 * Get a scan session by ID
 *
 * Returns the session with resolved cover URL and recipe details.
 */
export const getSessionById = query({
  args: {
    sessionId: v.id("scanSessions"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      return null;
    }

    // Resolve cover image URL
    let coverImageUrl = null;
    if (session.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(session.coverImageId);
    }

    // Get scanned recipe details
    const recipes = await Promise.all(
      session.scannedRecipeIds.map((id) => ctx.db.get(id))
    );

    const scannedRecipes = recipes
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((r) => ({
        _id: r._id,
        title: r.title,
        ingredientCount: r.ingredients.length,
        instructionCount: r.instructions.length,
      }));

    return {
      ...session,
      coverImageUrl,
      scannedRecipes,
    };
  },
});

/**
 * Get user's recent scan sessions
 *
 * Returns completed sessions for history display.
 */
export const getRecentSessions = query({
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

    let sessionsQuery = ctx.db
      .query("scanSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    const sessions = args.limit
      ? await sessionsQuery.take(args.limit)
      : await sessionsQuery.collect();

    // Resolve cover URLs for each session
    const sessionsWithCovers = await Promise.all(
      sessions.map(async (session) => {
        let coverImageUrl = null;
        if (session.coverImageId) {
          coverImageUrl = await ctx.storage.getUrl(session.coverImageId);
        }
        return {
          ...session,
          coverImageUrl,
          recipeCount: session.scannedRecipeIds.length,
        };
      })
    );

    return sessionsWithCovers;
  },
});
