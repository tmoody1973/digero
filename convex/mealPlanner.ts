/**
 * Meal Planner Queries and Mutations
 *
 * API functions for managing planned meals in the weekly calendar.
 * All operations enforce authentication and user ownership.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Meal slot validator
 */
const mealSlot = v.union(
  v.literal("breakfast"),
  v.literal("lunch"),
  v.literal("dinner"),
  v.literal("snacks")
);

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get meals for a date range (typically a week)
 *
 * Returns all planned meals for the authenticated user within the specified
 * date range, sorted by day then slot order.
 */
export const getMealsByWeek = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch all meals for the user
    const allMeals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter to date range and sort
    const mealsInRange = allMeals
      .filter((meal) => meal.day >= args.startDate && meal.day <= args.endDate)
      .sort((a, b) => {
        // Sort by day first
        if (a.day !== b.day) {
          return a.day.localeCompare(b.day);
        }
        // Then by slot order
        const slotOrder = ["breakfast", "lunch", "dinner", "snacks"];
        return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
      });

    return mealsInRange;
  },
});

/**
 * Get a single planned meal by ID
 *
 * Returns the meal if it exists and belongs to the authenticated user.
 */
export const getMealById = query({
  args: {
    mealId: v.id("plannedMeals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const meal = await ctx.db.get(args.mealId);

    if (!meal || meal.userId !== userId) {
      return null;
    }

    return meal;
  },
});

/**
 * Get recipe picker items
 *
 * Returns user's recipes formatted for the recipe picker,
 * with simplified data and category assignment.
 */
export const getRecipePickerItems = query({
  args: {
    limit: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("all"),
        v.literal("breakfast"),
        v.literal("lunch"),
        v.literal("dinner"),
        v.literal("snacks")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch user's recipes
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Transform to picker items
    let pickerItems = recipes.map((recipe) => {
      // Infer category from recipe title/tags (simple heuristic)
      let category: "breakfast" | "lunch" | "dinner" | "snacks" = "dinner";

      const title = recipe.title.toLowerCase();
      const tags = recipe.dietaryTags.map((t) => t.toLowerCase());

      if (
        title.includes("breakfast") ||
        title.includes("oat") ||
        title.includes("pancake") ||
        title.includes("egg") ||
        title.includes("toast") ||
        tags.includes("breakfast")
      ) {
        category = "breakfast";
      } else if (
        title.includes("salad") ||
        title.includes("sandwich") ||
        title.includes("wrap") ||
        title.includes("bowl") ||
        tags.includes("lunch")
      ) {
        category = "lunch";
      } else if (
        title.includes("snack") ||
        title.includes("cookie") ||
        title.includes("cake") ||
        title.includes("dessert") ||
        title.includes("bite") ||
        tags.includes("snack") ||
        tags.includes("dessert")
      ) {
        category = "snacks";
      }

      return {
        id: recipe._id,
        name: recipe.title,
        image: recipe.imageUrl,
        prepTime: `${recipe.prepTime + recipe.cookTime} min`,
        category,
      };
    });

    // Apply search filter
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase().trim();
      pickerItems = pickerItems.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (args.category && args.category !== "all") {
      pickerItems = pickerItems.filter(
        (item) => item.category === args.category
      );
    }

    // Apply limit
    if (args.limit) {
      pickerItems = pickerItems.slice(0, args.limit);
    }

    return pickerItems;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add a meal to a slot
 *
 * Creates a new planned meal entry for the specified day and slot.
 * Fetches recipe data to denormalize name, image, and prep time.
 */
export const addMealToSlot = mutation({
  args: {
    recipeId: v.id("recipes"),
    day: v.string(),
    slot: mealSlot,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch recipe to get denormalized data
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (recipe.userId !== userId) {
      throw new Error("You do not have permission to use this recipe");
    }

    const now = Date.now();

    // Check if slot already has a meal (replace it)
    const existingMeals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", userId).eq("day", args.day)
      )
      .collect();

    const existingMeal = existingMeals.find((m) => m.slot === args.slot);
    if (existingMeal) {
      // Remove existing meal in this slot
      await ctx.db.delete(existingMeal._id);
    }

    // Create the planned meal
    const mealId = await ctx.db.insert("plannedMeals", {
      userId,
      recipeId: args.recipeId,
      recipeName: recipe.title,
      recipeImage: recipe.imageUrl,
      prepTime: `${recipe.prepTime + recipe.cookTime} min`,
      day: args.day,
      slot: args.slot,
      createdAt: now,
      updatedAt: now,
    });

    return mealId;
  },
});

/**
 * Remove a planned meal
 *
 * Deletes a planned meal after verifying ownership.
 */
export const removeMeal = mutation({
  args: {
    mealId: v.id("plannedMeals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const meal = await ctx.db.get(args.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    if (meal.userId !== userId) {
      throw new Error("You do not have permission to delete this meal");
    }

    await ctx.db.delete(args.mealId);

    return true;
  },
});

/**
 * Move a meal to a different slot/day
 *
 * Updates the day and slot of an existing planned meal.
 * If the target slot is occupied, the existing meal is removed.
 */
export const moveMeal = mutation({
  args: {
    mealId: v.id("plannedMeals"),
    newDay: v.string(),
    newSlot: mealSlot,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const meal = await ctx.db.get(args.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    if (meal.userId !== userId) {
      throw new Error("You do not have permission to move this meal");
    }

    // Check if target slot already has a meal
    const existingMeals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", userId).eq("day", args.newDay)
      )
      .collect();

    const existingMeal = existingMeals.find(
      (m) => m.slot === args.newSlot && m._id !== args.mealId
    );
    if (existingMeal) {
      // Remove existing meal in target slot
      await ctx.db.delete(existingMeal._id);
    }

    // Update the meal
    await ctx.db.patch(args.mealId, {
      day: args.newDay,
      slot: args.newSlot,
      updatedAt: Date.now(),
    });

    return args.mealId;
  },
});

/**
 * Copy a meal to a different slot/day
 *
 * Creates a duplicate planned meal at the specified day and slot.
 * If the target slot is occupied, the existing meal is removed.
 */
export const copyMeal = mutation({
  args: {
    mealId: v.id("plannedMeals"),
    targetDay: v.string(),
    targetSlot: mealSlot,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const meal = await ctx.db.get(args.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    if (meal.userId !== userId) {
      throw new Error("You do not have permission to copy this meal");
    }

    // Check if target slot already has a meal
    const existingMeals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", userId).eq("day", args.targetDay)
      )
      .collect();

    const existingMeal = existingMeals.find((m) => m.slot === args.targetSlot);
    if (existingMeal) {
      // Remove existing meal in target slot
      await ctx.db.delete(existingMeal._id);
    }

    const now = Date.now();

    // Create a copy
    const newMealId = await ctx.db.insert("plannedMeals", {
      userId,
      recipeId: meal.recipeId,
      recipeName: meal.recipeName,
      recipeImage: meal.recipeImage,
      prepTime: meal.prepTime,
      day: args.targetDay,
      slot: args.targetSlot,
      createdAt: now,
      updatedAt: now,
    });

    return newMealId;
  },
});

/**
 * Clear all meals for a specific day
 *
 * Deletes all planned meals for the authenticated user on the specified day.
 */
export const clearDay = mutation({
  args: {
    day: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const meals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", userId).eq("day", args.day)
      )
      .collect();

    for (const meal of meals) {
      await ctx.db.delete(meal._id);
    }

    return meals.length;
  },
});

/**
 * Clear all meals for a week
 *
 * Deletes all planned meals for the authenticated user within the date range.
 */
export const clearWeek = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const allMeals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const mealsToDelete = allMeals.filter(
      (meal) => meal.day >= args.startDate && meal.day <= args.endDate
    );

    for (const meal of mealsToDelete) {
      await ctx.db.delete(meal._id);
    }

    return mealsToDelete.length;
  },
});

/**
 * Get meals by IDs
 *
 * Returns multiple planned meals by their IDs for shopping list generation.
 */
export const getMealsByIds = query({
  args: {
    mealIds: v.array(v.id("plannedMeals")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const meals = await Promise.all(
      args.mealIds.map((id) => ctx.db.get(id))
    );

    // Filter out null values and verify ownership
    return meals.filter(
      (meal): meal is NonNullable<typeof meal> =>
        meal !== null && meal.userId === userId
    );
  },
});
