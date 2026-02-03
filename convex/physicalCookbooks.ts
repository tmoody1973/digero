/**
 * Physical Cookbooks Mutations and Queries
 *
 * CRUD operations and query functions for the physicalCookbooks table.
 * Used for storing metadata about physical cookbooks users scan recipes from.
 * All mutations enforce authentication and user ownership.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new physical cookbook
 *
 * Creates a cookbook with the provided name and optional author/cover image.
 * Sets userId from authenticated user and createdAt to current timestamp.
 */
export const createPhysicalCookbook = mutation({
  args: {
    name: v.string(),
    author: v.optional(v.string()),
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

    const cookbookId = await ctx.db.insert("physicalCookbooks", {
      userId,
      name: args.name,
      author: args.author,
      coverImageId: args.coverImageId,
      createdAt: now,
    });

    return cookbookId;
  },
});

/**
 * Get or create a physical cookbook by name
 *
 * Finds an existing cookbook with the same name for the user,
 * or creates a new one if it doesn't exist.
 * Useful for reusing cookbook references across scan sessions.
 */
export const getOrCreateByName = mutation({
  args: {
    name: v.string(),
    author: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Try to find existing cookbook with same name
    const existing = await ctx.db
      .query("physicalCookbooks")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", userId).eq("name", args.name)
      )
      .first();

    if (existing) {
      // Update cover image if provided and not already set
      if (args.coverImageId && !existing.coverImageId) {
        await ctx.db.patch(existing._id, {
          coverImageId: args.coverImageId,
        });
      }
      // Update author if provided and not already set
      if (args.author && !existing.author) {
        await ctx.db.patch(existing._id, {
          author: args.author,
        });
      }
      return existing._id;
    }

    // Create new cookbook
    const now = Date.now();
    const cookbookId = await ctx.db.insert("physicalCookbooks", {
      userId,
      name: args.name,
      author: args.author,
      coverImageId: args.coverImageId,
      createdAt: now,
    });

    return cookbookId;
  },
});

/**
 * Update a physical cookbook
 *
 * Updates the cookbook with provided fields. Validates user ownership.
 */
export const updatePhysicalCookbook = mutation({
  args: {
    id: v.id("physicalCookbooks"),
    name: v.optional(v.string()),
    author: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the cookbook
    const cookbook = await ctx.db.get(args.id);
    if (!cookbook) {
      throw new Error("Cookbook not found");
    }

    // Validate ownership
    if (cookbook.userId !== userId) {
      throw new Error("You do not have permission to update this cookbook");
    }

    // Build update object with only provided fields
    const { id, ...updateFields } = args;
    const updates: Record<string, unknown> = {};

    if (updateFields.name !== undefined) {
      updates.name = updateFields.name;
    }
    if (updateFields.author !== undefined) {
      updates.author = updateFields.author;
    }
    if (updateFields.coverImageId !== undefined) {
      updates.coverImageId = updateFields.coverImageId;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }

    return args.id;
  },
});

/**
 * Delete a physical cookbook
 *
 * Deletes a cookbook by ID after validating user ownership.
 * Note: Recipes referencing this cookbook will retain the reference
 * but it will point to a deleted document.
 */
export const deletePhysicalCookbook = mutation({
  args: {
    id: v.id("physicalCookbooks"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the cookbook
    const cookbook = await ctx.db.get(args.id);
    if (!cookbook) {
      throw new Error("Cookbook not found");
    }

    // Validate ownership
    if (cookbook.userId !== userId) {
      throw new Error("You do not have permission to delete this cookbook");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Generate upload URL for cookbook cover image
 *
 * Returns a signed URL for uploading an image to Convex file storage.
 * Used for cover photo uploads during scanning sessions.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all physical cookbooks for the authenticated user
 *
 * Returns cookbooks filtered by userId, ordered by createdAt descending.
 */
export const getPhysicalCookbooks = query({
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

    let cookbooksQuery = ctx.db
      .query("physicalCookbooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.limit) {
      return await cookbooksQuery.take(args.limit);
    }

    return await cookbooksQuery.collect();
  },
});

/**
 * Get a single physical cookbook by ID
 *
 * Returns the cookbook if it exists and belongs to the authenticated user.
 * Returns null if the cookbook doesn't exist or user doesn't have access.
 */
export const getPhysicalCookbookById = query({
  args: {
    id: v.id("physicalCookbooks"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const cookbook = await ctx.db.get(args.id);

    // Return null if cookbook doesn't exist or user doesn't own it
    if (!cookbook || cookbook.userId !== userId) {
      return null;
    }

    return cookbook;
  },
});

/**
 * Get physical cookbook by ID with cover URL
 *
 * Returns cookbook with resolved cover image URL from storage.
 */
export const getPhysicalCookbookWithCover = query({
  args: {
    id: v.id("physicalCookbooks"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const cookbook = await ctx.db.get(args.id);

    // Return null if cookbook doesn't exist or user doesn't own it
    if (!cookbook || cookbook.userId !== userId) {
      return null;
    }

    // Resolve cover image URL
    let coverImageUrl = null;
    if (cookbook.coverImageId) {
      coverImageUrl = await ctx.storage.getUrl(cookbook.coverImageId);
    }

    return {
      ...cookbook,
      coverImageUrl,
    };
  },
});

/**
 * Get recipes scanned from a physical cookbook
 *
 * Returns all recipes that reference a specific physical cookbook.
 */
export const getRecipesByPhysicalCookbook = query({
  args: {
    physicalCookbookId: v.id("physicalCookbooks"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify user owns the cookbook
    const cookbook = await ctx.db.get(args.physicalCookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      return [];
    }

    // Get recipes from this cookbook
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_physical_cookbook", (q) =>
        q.eq("physicalCookbookId", args.physicalCookbookId)
      )
      .collect();

    return recipes;
  },
});
