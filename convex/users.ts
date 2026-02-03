/**
 * User Mutations and Queries
 *
 * CRUD operations and query functions for the users table.
 * Handles user profile management and Clerk data synchronization.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Cooking skill level validator
 */
const cookingSkillLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
);

// ============================================================================
// INTERNAL MUTATIONS (for webhook use)
// ============================================================================

/**
 * Create a new user (internal - called from webhook)
 *
 * Creates a user record from Clerk webhook data.
 * Sets default values for profile fields.
 */
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // User already exists, update instead
      const now = Date.now();
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      cookingSkillLevel: undefined,
      dietaryRestrictions: [],
      hasCompletedOnboarding: false,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Update user from webhook (internal - called from webhook)
 *
 * Updates user record with data from Clerk webhook.
 */
export const updateUserFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) {
      updates.email = args.email;
    }
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
    }

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Delete user (internal - called from webhook)
 *
 * Removes user record by Clerk ID.
 */
export const deleteUserByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      // User not found, nothing to delete
      return null;
    }

    await ctx.db.delete(user._id);

    return user._id;
  },
});

// ============================================================================
// PUBLIC MUTATIONS (authenticated)
// ============================================================================

/**
 * Ensure user exists (create if missing)
 *
 * Called from the app to ensure the user exists in the database.
 * This handles cases where the Clerk webhook is delayed or fails.
 */
export const ensureUserExists = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const clerkId = identity.subject;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Create user from Clerk identity data
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: clerkId,
      email: identity.email ?? "",
      name: identity.name ?? identity.nickname ?? "User",
      avatarUrl: identity.pictureUrl,
      cookingSkillLevel: undefined,
      dietaryRestrictions: [],
      hasCompletedOnboarding: false,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Update user profile
 *
 * Updates the authenticated user's profile fields (cooking skill, dietary restrictions).
 * Used during onboarding and settings.
 */
export const updateUserProfile = mutation({
  args: {
    cookingSkillLevel: v.optional(cookingSkillLevel),
    dietaryRestrictions: v.optional(v.array(v.string())),
    hasCompletedOnboarding: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const clerkId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.cookingSkillLevel !== undefined) {
      updates.cookingSkillLevel = args.cookingSkillLevel;
    }
    if (args.dietaryRestrictions !== undefined) {
      updates.dietaryRestrictions = args.dietaryRestrictions;
    }
    if (args.hasCompletedOnboarding !== undefined) {
      updates.hasCompletedOnboarding = args.hasCompletedOnboarding;
    }

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Complete onboarding
 *
 * Convenience mutation to set cooking skill level, dietary restrictions,
 * and mark onboarding as complete in a single call.
 */
export const completeOnboarding = mutation({
  args: {
    cookingSkillLevel: cookingSkillLevel,
    dietaryRestrictions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const clerkId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      cookingSkillLevel: args.cookingSkillLevel,
      dietaryRestrictions: args.dietaryRestrictions,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user by Clerk ID
 *
 * Returns the user record for a given Clerk ID.
 * Used internally and for admin purposes.
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

/**
 * Get current user
 *
 * Returns the authenticated user's profile data.
 * Returns null if not authenticated or user not found.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user;
  },
});

/**
 * Check if user has completed onboarding
 *
 * Quick check to determine if user should be routed to onboarding.
 * Returns null if not authenticated or user not found.
 */
export const hasCompletedOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      return null;
    }

    return user.hasCompletedOnboarding;
  },
});
