/**
 * Cookbook Mutations and Queries
 *
 * CRUD operations and query functions for digital cookbooks.
 * Handles both built-in system cookbooks (Favorites, Recently Added)
 * and user-created custom cookbooks.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Cookbook sort option validator
 */
const cookbookSortOption = v.union(
  v.literal("position"),
  v.literal("dateAdded"),
  v.literal("title")
);

/**
 * Default cover images for built-in cookbooks
 */
const DEFAULT_COVERS = {
  favorites: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600",
  recentlyAdded: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600",
  default: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600",
};

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Ensure built-in cookbooks exist for a user
 *
 * Creates Favorites and Recently Added cookbooks if they don't exist.
 * Called when user completes onboarding or first accesses cookbooks.
 */
export const ensureBuiltInCookbooks = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const now = Date.now();

    // Check if built-in cookbooks already exist
    const existingCookbooks = await ctx.db
      .query("cookbooks")
      .withIndex("by_user_builtin", (q) => q.eq("userId", userId).eq("isBuiltIn", true))
      .collect();

    const hasFavorites = existingCookbooks.some((c) => c.name === "Favorites");
    const hasRecentlyAdded = existingCookbooks.some((c) => c.name === "Recently Added");

    // Create Favorites cookbook if it doesn't exist
    if (!hasFavorites) {
      await ctx.db.insert("cookbooks", {
        userId,
        name: "Favorites",
        description: "Your most-loved recipes",
        coverUrl: DEFAULT_COVERS.favorites,
        recipeCount: 0,
        isBuiltIn: true,
        sortBy: "position",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create Recently Added cookbook if it doesn't exist
    if (!hasRecentlyAdded) {
      await ctx.db.insert("cookbooks", {
        userId,
        name: "Recently Added",
        description: "Recipes you've saved recently",
        coverUrl: DEFAULT_COVERS.recentlyAdded,
        recipeCount: 0,
        isBuiltIn: true,
        sortBy: "dateAdded",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Sync favorites cookbook when recipe favorite status changes
 *
 * Adds or removes recipe from Favorites cookbook based on isFavorited status.
 */
export const syncFavoritesCookbook = internalMutation({
  args: {
    userId: v.string(),
    recipeId: v.id("recipes"),
    isFavorited: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, recipeId, isFavorited } = args;

    // Find the Favorites cookbook
    const favoritesCookbook = await ctx.db
      .query("cookbooks")
      .withIndex("by_user_builtin", (q) => q.eq("userId", userId).eq("isBuiltIn", true))
      .filter((q) => q.eq(q.field("name"), "Favorites"))
      .unique();

    if (!favoritesCookbook) {
      return;
    }

    // Check if recipe is already in Favorites
    const existingEntry = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook_recipe", (q) =>
        q.eq("cookbookId", favoritesCookbook._id).eq("recipeId", recipeId)
      )
      .unique();

    const now = Date.now();

    if (isFavorited && !existingEntry) {
      // Add to Favorites
      const currentCount = await ctx.db
        .query("cookbookRecipes")
        .withIndex("by_cookbook", (q) => q.eq("cookbookId", favoritesCookbook._id))
        .collect();

      await ctx.db.insert("cookbookRecipes", {
        cookbookId: favoritesCookbook._id,
        recipeId,
        position: currentCount.length,
        dateAdded: now,
      });

      // Update recipe count
      await ctx.db.patch(favoritesCookbook._id, {
        recipeCount: currentCount.length + 1,
        updatedAt: now,
      });
    } else if (!isFavorited && existingEntry) {
      // Remove from Favorites
      await ctx.db.delete(existingEntry._id);

      // Update recipe count
      await ctx.db.patch(favoritesCookbook._id, {
        recipeCount: Math.max(0, favoritesCookbook.recipeCount - 1),
        updatedAt: now,
      });
    }
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all cookbooks for the authenticated user
 *
 * Returns both built-in and user-created cookbooks.
 * Built-in cookbooks are returned first.
 */
export const listCookbooks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const cookbooks = await ctx.db
      .query("cookbooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort: built-in first, then by updatedAt descending
    return cookbooks.sort((a, b) => {
      if (a.isBuiltIn !== b.isBuiltIn) {
        return a.isBuiltIn ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });
  },
});

/**
 * Get a single cookbook by ID
 *
 * Returns the cookbook with computed fields if it belongs to the user.
 */
export const getCookbook = query({
  args: {
    id: v.id("cookbooks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const cookbook = await ctx.db.get(args.id);

    if (!cookbook || cookbook.userId !== userId) {
      return null;
    }

    return cookbook;
  },
});

/**
 * Get a cookbook with its recipes
 *
 * Returns the cookbook along with all recipes, sorted by the specified field.
 * Includes recipe details from the recipes table.
 */
export const getCookbookWithRecipes = query({
  args: {
    id: v.id("cookbooks"),
    sortBy: v.optional(cookbookSortOption),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const cookbook = await ctx.db.get(args.id);

    if (!cookbook || cookbook.userId !== userId) {
      return null;
    }

    // Get all cookbook recipe entries
    const cookbookRecipes = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook", (q) => q.eq("cookbookId", args.id))
      .collect();

    // Fetch full recipe details for each entry
    const recipesWithDetails = await Promise.all(
      cookbookRecipes.map(async (entry) => {
        const recipe = await ctx.db.get(entry.recipeId);
        if (!recipe) return null;

        return {
          recipeId: entry.recipeId,
          title: recipe.title,
          imageUrl: recipe.imageUrl,
          source: recipe.source,
          position: entry.position,
          dateAdded: entry.dateAdded,
        };
      })
    );

    // Filter out null entries (deleted recipes)
    const validRecipes = recipesWithDetails.filter(
      (r): r is NonNullable<typeof r> => r !== null
    );

    // Sort based on preference
    const sortBy = args.sortBy ?? cookbook.sortBy ?? "position";
    validRecipes.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "dateAdded":
          return b.dateAdded - a.dateAdded;
        case "position":
        default:
          return a.position - b.position;
      }
    });

    return {
      ...cookbook,
      recipes: validRecipes,
    };
  },
});

/**
 * Get all cookbooks containing a specific recipe
 *
 * Used to show which cookbooks a recipe belongs to in the AddToCookbookModal.
 */
export const getCookbooksForRecipe = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Get all cookbook recipe entries for this recipe
    const entries = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    // Get the cookbook details for each entry, filtering by user
    const cookbookIds = await Promise.all(
      entries.map(async (entry) => {
        const cookbook = await ctx.db.get(entry.cookbookId);
        if (cookbook && cookbook.userId === userId) {
          return cookbook._id;
        }
        return null;
      })
    );

    return cookbookIds.filter((id): id is Id<"cookbooks"> => id !== null);
  },
});

/**
 * Get recently added recipes
 *
 * Returns the 8 most recently created recipes for the user.
 * Used by the "Recently Added" built-in cookbook.
 */
export const getRecentlyAddedRecipes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit ?? 8;

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return recipes.map((recipe, index) => ({
      recipeId: recipe._id,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      source: recipe.source,
      position: index,
      dateAdded: recipe.createdAt,
    }));
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new cookbook
 *
 * Creates a user cookbook with the provided name, description, and cover image.
 * Cannot create built-in cookbooks through this mutation.
 */
export const createCookbook = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Validate name
    if (!args.name.trim()) {
      throw new Error("Cookbook name is required");
    }
    if (args.name.length > 50) {
      throw new Error("Cookbook name must be 50 characters or less");
    }

    // Validate description
    if (args.description && args.description.length > 200) {
      throw new Error("Cookbook description must be 200 characters or less");
    }

    const now = Date.now();

    const cookbookId = await ctx.db.insert("cookbooks", {
      userId,
      name: args.name.trim(),
      description: args.description?.trim() ?? "",
      coverUrl: args.coverUrl ?? DEFAULT_COVERS.default,
      recipeCount: 0,
      isBuiltIn: false,
      sortBy: "position",
      createdAt: now,
      updatedAt: now,
    });

    return cookbookId;
  },
});

/**
 * Update an existing cookbook
 *
 * Updates the name, description, cover image, or sort preference.
 * Cannot modify the isBuiltIn field.
 */
export const updateCookbook = mutation({
  args: {
    id: v.id("cookbooks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    sortBy: v.optional(cookbookSortOption),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const cookbook = await ctx.db.get(args.id);

    if (!cookbook) {
      throw new Error("Cookbook not found");
    }

    if (cookbook.userId !== userId) {
      throw new Error("You do not have permission to update this cookbook");
    }

    // Validate name if provided
    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Cookbook name is required");
      }
      if (args.name.length > 50) {
        throw new Error("Cookbook name must be 50 characters or less");
      }
    }

    // Validate description if provided
    if (args.description !== undefined && args.description.length > 200) {
      throw new Error("Cookbook description must be 200 characters or less");
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }
    if (args.coverUrl !== undefined) {
      updates.coverUrl = args.coverUrl;
    }
    if (args.sortBy !== undefined) {
      updates.sortBy = args.sortBy;
    }

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Delete a cookbook
 *
 * Deletes the cookbook and all associated cookbook recipe entries.
 * Cannot delete built-in cookbooks.
 */
export const deleteCookbook = mutation({
  args: {
    id: v.id("cookbooks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const cookbook = await ctx.db.get(args.id);

    if (!cookbook) {
      throw new Error("Cookbook not found");
    }

    if (cookbook.userId !== userId) {
      throw new Error("You do not have permission to delete this cookbook");
    }

    if (cookbook.isBuiltIn) {
      throw new Error("Cannot delete built-in cookbooks");
    }

    // Delete all cookbook recipe entries
    const entries = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook", (q) => q.eq("cookbookId", args.id))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Delete the cookbook
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// ============================================================================
// COOKBOOK RECIPE MUTATIONS
// ============================================================================

/**
 * Add a recipe to a cookbook
 *
 * Creates a new cookbook recipe entry with position at the end.
 */
export const addRecipeToCookbook = mutation({
  args: {
    cookbookId: v.id("cookbooks"),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify cookbook ownership
    const cookbook = await ctx.db.get(args.cookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      throw new Error("Cookbook not found");
    }

    // Verify recipe ownership
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe || recipe.userId !== userId) {
      throw new Error("Recipe not found");
    }

    // Check if built-in cookbook (disallow manual additions)
    if (cookbook.isBuiltIn) {
      throw new Error("Cannot manually add recipes to built-in cookbooks");
    }

    // Check if already in cookbook
    const existingEntry = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook_recipe", (q) =>
        q.eq("cookbookId", args.cookbookId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (existingEntry) {
      return existingEntry._id;
    }

    // Get current position count
    const currentEntries = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook", (q) => q.eq("cookbookId", args.cookbookId))
      .collect();

    const now = Date.now();

    const entryId = await ctx.db.insert("cookbookRecipes", {
      cookbookId: args.cookbookId,
      recipeId: args.recipeId,
      position: currentEntries.length,
      dateAdded: now,
    });

    // Update recipe count
    await ctx.db.patch(args.cookbookId, {
      recipeCount: currentEntries.length + 1,
      updatedAt: now,
    });

    return entryId;
  },
});

/**
 * Add a recipe to multiple cookbooks
 *
 * Handles multi-select in the AddToCookbookModal.
 * Adds to selected cookbooks and removes from unselected ones.
 */
export const addRecipeToCookbooks = mutation({
  args: {
    recipeId: v.id("recipes"),
    cookbookIds: v.array(v.id("cookbooks")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify recipe ownership
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe || recipe.userId !== userId) {
      throw new Error("Recipe not found");
    }

    // Get all user's non-built-in cookbooks
    const userCookbooks = await ctx.db
      .query("cookbooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isBuiltIn"), false))
      .collect();

    // Get current cookbook memberships for this recipe
    const currentEntries = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    const currentCookbookIds = new Set(
      currentEntries
        .filter((e) => userCookbooks.some((c) => c._id === e.cookbookId))
        .map((e) => e.cookbookId)
    );

    const targetCookbookIds = new Set(args.cookbookIds);
    const now = Date.now();

    // Add to new cookbooks
    for (const cookbookId of args.cookbookIds) {
      if (!currentCookbookIds.has(cookbookId)) {
        const cookbook = userCookbooks.find((c) => c._id === cookbookId);
        if (!cookbook) continue;

        const currentCount = await ctx.db
          .query("cookbookRecipes")
          .withIndex("by_cookbook", (q) => q.eq("cookbookId", cookbookId))
          .collect();

        await ctx.db.insert("cookbookRecipes", {
          cookbookId,
          recipeId: args.recipeId,
          position: currentCount.length,
          dateAdded: now,
        });

        await ctx.db.patch(cookbookId, {
          recipeCount: currentCount.length + 1,
          updatedAt: now,
        });
      }
    }

    // Remove from cookbooks not in the target list
    for (const entry of currentEntries) {
      const cookbook = userCookbooks.find((c) => c._id === entry.cookbookId);
      if (cookbook && !targetCookbookIds.has(entry.cookbookId)) {
        await ctx.db.delete(entry._id);

        await ctx.db.patch(entry.cookbookId, {
          recipeCount: Math.max(0, cookbook.recipeCount - 1),
          updatedAt: now,
        });
      }
    }

    return args.cookbookIds;
  },
});

/**
 * Remove a recipe from a cookbook
 *
 * Deletes the cookbook recipe entry but keeps the recipe.
 */
export const removeRecipeFromCookbook = mutation({
  args: {
    cookbookId: v.id("cookbooks"),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify cookbook ownership
    const cookbook = await ctx.db.get(args.cookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      throw new Error("Cookbook not found");
    }

    // Check if built-in cookbook
    if (cookbook.isBuiltIn) {
      throw new Error("Cannot manually remove recipes from built-in cookbooks");
    }

    // Find the entry
    const entry = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook_recipe", (q) =>
        q.eq("cookbookId", args.cookbookId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (!entry) {
      return null;
    }

    await ctx.db.delete(entry._id);

    // Update recipe count
    await ctx.db.patch(args.cookbookId, {
      recipeCount: Math.max(0, cookbook.recipeCount - 1),
      updatedAt: Date.now(),
    });

    return entry._id;
  },
});

/**
 * Remove multiple recipes from a cookbook
 *
 * Bulk removal for multi-select mode.
 */
export const removeRecipesFromCookbook = mutation({
  args: {
    cookbookId: v.id("cookbooks"),
    recipeIds: v.array(v.id("recipes")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify cookbook ownership
    const cookbook = await ctx.db.get(args.cookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      throw new Error("Cookbook not found");
    }

    // Check if built-in cookbook
    if (cookbook.isBuiltIn) {
      throw new Error("Cannot manually remove recipes from built-in cookbooks");
    }

    let removedCount = 0;

    for (const recipeId of args.recipeIds) {
      const entry = await ctx.db
        .query("cookbookRecipes")
        .withIndex("by_cookbook_recipe", (q) =>
          q.eq("cookbookId", args.cookbookId).eq("recipeId", recipeId)
        )
        .unique();

      if (entry) {
        await ctx.db.delete(entry._id);
        removedCount++;
      }
    }

    // Update recipe count
    await ctx.db.patch(args.cookbookId, {
      recipeCount: Math.max(0, cookbook.recipeCount - removedCount),
      updatedAt: Date.now(),
    });

    return removedCount;
  },
});

/**
 * Update a recipe's position in a cookbook
 *
 * Used for drag-and-drop reordering.
 */
export const updateRecipePosition = mutation({
  args: {
    cookbookId: v.id("cookbooks"),
    recipeId: v.id("recipes"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify cookbook ownership
    const cookbook = await ctx.db.get(args.cookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      throw new Error("Cookbook not found");
    }

    // Find the entry
    const entry = await ctx.db
      .query("cookbookRecipes")
      .withIndex("by_cookbook_recipe", (q) =>
        q.eq("cookbookId", args.cookbookId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (!entry) {
      throw new Error("Recipe not in cookbook");
    }

    await ctx.db.patch(entry._id, {
      position: args.newPosition,
    });

    return entry._id;
  },
});

/**
 * Reorder all recipes in a cookbook
 *
 * Batch update positions for drag-and-drop reordering.
 * Takes an array of recipe IDs in the new order.
 */
export const reorderRecipes = mutation({
  args: {
    cookbookId: v.id("cookbooks"),
    recipeIds: v.array(v.id("recipes")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Verify cookbook ownership
    const cookbook = await ctx.db.get(args.cookbookId);
    if (!cookbook || cookbook.userId !== userId) {
      throw new Error("Cookbook not found");
    }

    // Update each entry's position based on array index
    for (let i = 0; i < args.recipeIds.length; i++) {
      const entry = await ctx.db
        .query("cookbookRecipes")
        .withIndex("by_cookbook_recipe", (q) =>
          q.eq("cookbookId", args.cookbookId).eq("recipeId", args.recipeIds[i])
        )
        .unique();

      if (entry) {
        await ctx.db.patch(entry._id, { position: i });
      }
    }

    // Update cookbook timestamp
    await ctx.db.patch(args.cookbookId, {
      updatedAt: Date.now(),
    });

    return args.cookbookId;
  },
});
