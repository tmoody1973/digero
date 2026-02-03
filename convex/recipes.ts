/**
 * Recipe Mutations and Queries
 *
 * CRUD operations and query functions for the recipes table.
 * All mutations enforce authentication and user ownership.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

/**
 * Ingredient category validator
 */
const ingredientCategory = v.union(
  v.literal("meat"),
  v.literal("produce"),
  v.literal("dairy"),
  v.literal("pantry"),
  v.literal("spices"),
  v.literal("condiments"),
  v.literal("bread"),
  v.literal("other")
);

/**
 * Recipe source validator
 */
const recipeSource = v.union(
  v.literal("youtube"),
  v.literal("website"),
  v.literal("scanned"),
  v.literal("manual")
);

/**
 * Difficulty level validator
 */
const difficultyLevel = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard")
);

/**
 * Sort options validator
 */
const sortOption = v.union(
  v.literal("mostRecent"),
  v.literal("alphabetical"),
  v.literal("cookTime"),
  v.literal("calories"),
  v.literal("recentlyCooked")
);

/**
 * Ingredient object validator
 */
const ingredientObject = v.object({
  name: v.string(),
  quantity: v.number(),
  unit: v.string(),
  category: ingredientCategory,
});

/**
 * Nutrition object validator
 */
const nutritionObject = v.object({
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new recipe
 *
 * Creates a recipe with all provided fields and sets default values
 * for isFavorited (false), dietaryTags ([]), and notes ("").
 * Enforces source-specific validation rules.
 */
export const createRecipe = mutation({
  args: {
    title: v.string(),
    source: recipeSource,
    sourceUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    imageUrl: v.string(),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    ingredients: v.array(ingredientObject),
    instructions: v.array(v.string()),
    notes: v.optional(v.string()),
    nutrition: v.optional(nutritionObject),
    cuisineType: v.optional(v.string()),
    isFavorited: v.optional(v.boolean()),
    difficulty: v.optional(difficultyLevel),
    dietaryTags: v.optional(v.array(v.string())),
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),
    pageNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Source-specific validation
    if (args.source === "youtube") {
      if (!args.sourceUrl) {
        throw new Error("Source URL required for YouTube recipes");
      }
      if (!args.youtubeVideoId) {
        throw new Error("YouTube video ID required for YouTube recipes");
      }
    }

    if (args.source === "website") {
      if (!args.sourceUrl) {
        throw new Error("Source URL required for website recipes");
      }
    }

    if (args.physicalCookbookId && args.source !== "scanned") {
      throw new Error("Physical cookbook ID is only allowed for scanned recipes");
    }

    // If physicalCookbookId is provided, verify it exists and belongs to user
    if (args.physicalCookbookId) {
      const cookbook = await ctx.db.get(args.physicalCookbookId);
      if (!cookbook) {
        throw new Error("Physical cookbook not found");
      }
      if (cookbook.userId !== userId) {
        throw new Error("You do not have permission to use this cookbook");
      }
    }

    const now = Date.now();

    // Create recipe with defaults
    const recipeId = await ctx.db.insert("recipes", {
      userId,
      title: args.title,
      source: args.source,
      sourceUrl: args.sourceUrl,
      youtubeVideoId: args.youtubeVideoId,
      imageUrl: args.imageUrl,
      servings: args.servings,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      ingredients: args.ingredients,
      instructions: args.instructions,
      notes: args.notes ?? "",
      nutrition: args.nutrition,
      cuisineType: args.cuisineType,
      isFavorited: args.isFavorited ?? false,
      difficulty: args.difficulty,
      dietaryTags: args.dietaryTags ?? [],
      physicalCookbookId: args.physicalCookbookId,
      pageNumber: args.pageNumber,
      createdAt: now,
      updatedAt: now,
    });

    return recipeId;
  },
});

/**
 * Save a scanned recipe
 *
 * Convenience mutation specifically for saving recipes from scanning sessions.
 * Sets source to 'scanned' and links to physical cookbook and scan session.
 */
export const saveScannedRecipe = mutation({
  args: {
    title: v.string(),
    ingredients: v.array(ingredientObject),
    instructions: v.array(v.string()),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    notes: v.optional(v.string()),
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),
    pageNumber: v.optional(v.string()),
    sessionId: v.optional(v.id("scanSessions")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // If physicalCookbookId is provided, verify it exists and belongs to user
    if (args.physicalCookbookId) {
      const cookbook = await ctx.db.get(args.physicalCookbookId);
      if (!cookbook) {
        throw new Error("Physical cookbook not found");
      }
      if (cookbook.userId !== userId) {
        throw new Error("You do not have permission to use this cookbook");
      }
    }

    const now = Date.now();

    // Create recipe as scanned
    const recipeId = await ctx.db.insert("recipes", {
      userId,
      title: args.title,
      source: "scanned",
      imageUrl: args.imageUrl || "https://placehold.co/400x300/1c1917/f97316?text=Scanned+Recipe",
      servings: args.servings,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      ingredients: args.ingredients,
      instructions: args.instructions,
      notes: args.notes ?? "",
      isFavorited: false,
      dietaryTags: [],
      physicalCookbookId: args.physicalCookbookId,
      pageNumber: args.pageNumber,
      createdAt: now,
      updatedAt: now,
    });

    // If session ID provided, add recipe to session
    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      if (session && session.userId === userId && session.status === "active") {
        await ctx.db.patch(args.sessionId, {
          scannedRecipeIds: [...session.scannedRecipeIds, recipeId],
        });
      }
    }

    return recipeId;
  },
});

/**
 * Save a recipe from YouTube
 *
 * Convenience mutation specifically for saving recipes extracted from YouTube videos.
 * Sets source to 'youtube' and stores video metadata.
 */
export const saveFromYouTube = mutation({
  args: {
    title: v.string(),
    ingredients: v.array(ingredientObject),
    instructions: v.array(v.string()),
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),
    youtubeVideoId: v.string(),
    sourceUrl: v.string(),
    imageUrl: v.string(),
    notes: v.optional(v.string()),
    cuisineType: v.optional(v.string()),
    difficulty: v.optional(difficultyLevel),
    dietaryTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Create recipe from YouTube
    const recipeId = await ctx.db.insert("recipes", {
      userId,
      title: args.title,
      source: "youtube",
      sourceUrl: args.sourceUrl,
      youtubeVideoId: args.youtubeVideoId,
      imageUrl: args.imageUrl,
      servings: args.servings,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      ingredients: args.ingredients,
      instructions: args.instructions,
      notes: args.notes ?? "",
      cuisineType: args.cuisineType,
      isFavorited: false,
      difficulty: args.difficulty,
      dietaryTags: args.dietaryTags ?? [],
      createdAt: now,
      updatedAt: now,
    });

    return recipeId;
  },
});

/**
 * Update an existing recipe
 *
 * Updates a recipe with the provided fields. Validates user ownership
 * and automatically updates the updatedAt timestamp.
 */
export const updateRecipe = mutation({
  args: {
    id: v.id("recipes"),
    title: v.optional(v.string()),
    source: v.optional(recipeSource),
    sourceUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    ingredients: v.optional(v.array(ingredientObject)),
    instructions: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    nutrition: v.optional(nutritionObject),
    cuisineType: v.optional(v.string()),
    isFavorited: v.optional(v.boolean()),
    difficulty: v.optional(difficultyLevel),
    dietaryTags: v.optional(v.array(v.string())),
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),
    pageNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the existing recipe
    const recipe = await ctx.db.get(args.id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Validate ownership
    if (recipe.userId !== userId) {
      throw new Error("You do not have permission to update this recipe");
    }

    // Determine the effective source (updated or existing)
    const effectiveSource = args.source ?? recipe.source;

    // Source-specific validation on updates
    if (effectiveSource === "youtube") {
      const effectiveSourceUrl = args.sourceUrl ?? recipe.sourceUrl;
      const effectiveVideoId = args.youtubeVideoId ?? recipe.youtubeVideoId;

      if (!effectiveSourceUrl) {
        throw new Error("Source URL required for YouTube recipes");
      }
      if (!effectiveVideoId) {
        throw new Error("YouTube video ID required for YouTube recipes");
      }
    }

    if (effectiveSource === "website") {
      const effectiveSourceUrl = args.sourceUrl ?? recipe.sourceUrl;
      if (!effectiveSourceUrl) {
        throw new Error("Source URL required for website recipes");
      }
    }

    const effectiveCookbookId = args.physicalCookbookId ?? recipe.physicalCookbookId;
    if (effectiveCookbookId && effectiveSource !== "scanned") {
      throw new Error("Physical cookbook ID is only allowed for scanned recipes");
    }

    // Build update object with only provided fields
    const { id, ...updateFields } = args;
    const updates: Record<string, unknown> = {
      ...updateFields,
      updatedAt: Date.now(),
    };

    // Remove undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Delete a recipe
 *
 * Deletes a recipe by ID after validating user ownership.
 */
export const deleteRecipe = mutation({
  args: {
    id: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the recipe
    const recipe = await ctx.db.get(args.id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Validate ownership
    if (recipe.userId !== userId) {
      throw new Error("You do not have permission to delete this recipe");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Toggle recipe favorite status
 *
 * Convenience mutation to toggle the isFavorited boolean.
 * Also updates the updatedAt timestamp.
 */
export const toggleFavorite = mutation({
  args: {
    id: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch the recipe
    const recipe = await ctx.db.get(args.id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Validate ownership
    if (recipe.userId !== userId) {
      throw new Error("You do not have permission to modify this recipe");
    }

    // Toggle favorite status
    await ctx.db.patch(args.id, {
      isFavorited: !recipe.isFavorited,
      updatedAt: Date.now(),
    });

    return !recipe.isFavorited;
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all recipes for the authenticated user
 *
 * Returns recipes filtered by userId, ordered by createdAt descending.
 * Supports optional limit for pagination.
 */
export const getRecipes = query({
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

    let recipesQuery = ctx.db
      .query("recipes")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.limit) {
      return await recipesQuery.take(args.limit);
    }

    return await recipesQuery.collect();
  },
});

/**
 * Get a single recipe by ID
 *
 * Returns the recipe if it exists and belongs to the authenticated user.
 * Returns null if the recipe doesn't exist or user doesn't have access.
 */
export const getRecipeById = query({
  args: {
    id: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const recipe = await ctx.db.get(args.id);

    // Return null if recipe doesn't exist or user doesn't own it
    if (!recipe || recipe.userId !== userId) {
      return null;
    }

    return recipe;
  },
});

/**
 * Get favorite recipes for the authenticated user
 *
 * Returns only recipes where isFavorited is true.
 * Uses the by_user_favorited index for efficient filtering.
 */
export const getFavoriteRecipes = query({
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

    let favoritesQuery = ctx.db
      .query("recipes")
      .withIndex("by_user_favorited", (q) =>
        q.eq("userId", userId).eq("isFavorited", true)
      )
      .order("desc");

    if (args.limit) {
      return await favoritesQuery.take(args.limit);
    }

    return await favoritesQuery.collect();
  },
});

/**
 * Get paginated recipes with search, filter, and sort
 *
 * Returns paginated recipes for the authenticated user with support for:
 * - Text search on title and ingredient names
 * - Source type filtering (youtube, website, scanned, manual)
 * - Multiple sort options (mostRecent, alphabetical, cookTime, calories, recentlyCooked)
 * - Cursor-based pagination for infinite scroll
 */
export const listRecipes = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sourceFilter: v.optional(recipeSource),
    searchQuery: v.optional(v.string()),
    sortBy: v.optional(sortOption),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const searchQuery = args.searchQuery?.toLowerCase().trim();
    const sortBy = args.sortBy ?? "mostRecent";

    // Fetch all user's recipes for filtering and sorting
    // Note: For large datasets, consider adding more indexes
    let recipesQuery = ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    const allRecipes = await recipesQuery.collect();

    // Apply source filter
    let filteredRecipes = args.sourceFilter
      ? allRecipes.filter((r) => r.source === args.sourceFilter)
      : allRecipes;

    // Apply text search on title and ingredient names
    if (searchQuery) {
      filteredRecipes = filteredRecipes.filter((recipe) => {
        const titleMatch = recipe.title.toLowerCase().includes(searchQuery);
        const ingredientMatch = recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(searchQuery)
        );
        return titleMatch || ingredientMatch;
      });
    }

    // Apply sorting
    filteredRecipes.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "cookTime":
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        case "calories":
          const aCalories = a.nutrition?.calories ?? Infinity;
          const bCalories = b.nutrition?.calories ?? Infinity;
          return aCalories - bCalories;
        case "recentlyCooked":
          // For now, use updatedAt as proxy for recently cooked
          return b.updatedAt - a.updatedAt;
        case "mostRecent":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Manual pagination
    const numToSkip = args.paginationOpts.cursor
      ? parseInt(args.paginationOpts.cursor)
      : 0;
    const numItems = args.paginationOpts.numItems;

    const paginatedRecipes = filteredRecipes.slice(numToSkip, numToSkip + numItems);
    const hasMore = numToSkip + numItems < filteredRecipes.length;

    return {
      page: paginatedRecipes,
      isDone: !hasMore,
      continueCursor: hasMore ? String(numToSkip + numItems) : null,
    };
  },
});

/**
 * Get single recipe with computed fields
 *
 * Returns full recipe with additional computed fields like totalTime.
 * Includes authorization check to ensure user owns the recipe.
 */
export const get = query({
  args: {
    id: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const recipe = await ctx.db.get(args.id);

    // Return null if recipe doesn't exist or user doesn't own it
    if (!recipe || recipe.userId !== userId) {
      return null;
    }

    // Get physical cookbook info if present
    let physicalCookbook = null;
    if (recipe.physicalCookbookId) {
      physicalCookbook = await ctx.db.get(recipe.physicalCookbookId);
    }

    // Return recipe with computed fields
    return {
      ...recipe,
      totalTime: recipe.prepTime + recipe.cookTime,
      physicalCookbook: physicalCookbook
        ? {
            id: physicalCookbook._id,
            name: physicalCookbook.name,
            author: physicalCookbook.author,
          }
        : null,
    };
  },
});
