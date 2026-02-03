/**
 * Shopping Lists Queries and Mutations
 *
 * API functions for managing shopping lists and items.
 * Supports list generation from meal plans, item management,
 * and auto-archiving on completion.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  aggregateIngredients,
  sortByCategory,
  RecipeWithIngredients,
} from "./lib/ingredientAggregation";
import { assignCategory, ShoppingItemCategory } from "./lib/categoryAssignment";

/**
 * Shopping item category validator
 */
const shoppingItemCategory = v.union(
  v.literal("Produce"),
  v.literal("Meat & Seafood"),
  v.literal("Dairy & Eggs"),
  v.literal("Pantry"),
  v.literal("Bakery"),
  v.literal("Frozen"),
  v.literal("Beverages"),
  v.literal("Household")
);

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all shopping lists for the authenticated user
 *
 * Returns lists with item counts for progress display.
 */
export const getShoppingLists = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Fetch all lists for the user
    const lists = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get item counts for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const items = await ctx.db
          .query("shoppingItems")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();

        const totalItems = items.length;
        const checkedItems = items.filter((item) => item.checked).length;

        return {
          ...list,
          totalItems,
          checkedItems,
        };
      })
    );

    // Sort by createdAt descending
    return listsWithCounts.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a single shopping list by ID with all items
 *
 * Returns the list with items and counts.
 */
export const getShoppingListById = query({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list || list.userId !== userId) {
      return null;
    }

    // Fetch all items for this list
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    const totalItems = items.length;
    const checkedItems = items.filter((item) => item.checked).length;

    return {
      ...list,
      items,
      totalItems,
      checkedItems,
    };
  },
});

/**
 * Get items for a shopping list
 *
 * Returns items with recipe source data.
 */
export const getShoppingListItems = query({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list || list.userId !== userId) {
      return [];
    }

    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    return items;
  },
});

// ============================================================================
// LIST MUTATIONS
// ============================================================================

/**
 * Create a new empty shopping list
 */
export const createShoppingList = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    const listId = await ctx.db.insert("shoppingLists", {
      userId,
      name: args.name,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return listId;
  },
});

/**
 * Update a shopping list name
 */
export const updateShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== userId) {
      throw new Error("You do not have permission to update this list");
    }

    const updates: { name?: string; updatedAt: number } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    await ctx.db.patch(args.listId, updates);
    return args.listId;
  },
});

/**
 * Delete a shopping list and all its items
 */
export const deleteShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== userId) {
      throw new Error("You do not have permission to delete this list");
    }

    // Delete all items in the list
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete the list
    await ctx.db.delete(args.listId);
    return args.listId;
  },
});

/**
 * Archive a shopping list
 */
export const archiveShoppingList = mutation({
  args: {
    listId: v.id("shoppingLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== userId) {
      throw new Error("You do not have permission to archive this list");
    }

    await ctx.db.patch(args.listId, {
      status: "archived",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.listId;
  },
});

// ============================================================================
// ITEM MUTATIONS
// ============================================================================

/**
 * Add an item to a shopping list
 */
export const addItem = mutation({
  args: {
    listId: v.id("shoppingLists"),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    category: v.optional(shoppingItemCategory),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const list = await ctx.db.get(args.listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== userId) {
      throw new Error("You do not have permission to add items to this list");
    }

    if (list.status === "archived") {
      throw new Error("Cannot add items to an archived list");
    }

    const now = Date.now();
    const category = args.category || assignCategory(args.name);

    const itemId = await ctx.db.insert("shoppingItems", {
      listId: args.listId,
      name: args.name,
      quantity: args.quantity,
      unit: args.unit,
      category: category as ShoppingItemCategory,
      checked: false,
      isCustom: true,
      recipeIds: [],
      createdAt: now,
      updatedAt: now,
    });

    // Update list timestamp
    await ctx.db.patch(args.listId, { updatedAt: now });

    return itemId;
  },
});

/**
 * Add ingredients from a recipe to a shopping list
 *
 * Creates a new list if listId is not provided.
 * Returns the list ID.
 */
export const addIngredientsFromRecipe = mutation({
  args: {
    listId: v.optional(v.id("shoppingLists")),
    recipeId: v.id("recipes"),
    ingredientIndexes: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Get the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe || recipe.userId !== userId) {
      throw new Error("Recipe not found");
    }

    // Get or create shopping list
    let listId = args.listId;

    if (!listId) {
      // Get the user's active shopping list, or create one
      const activeList = await ctx.db
        .query("shoppingLists")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (activeList) {
        listId = activeList._id;
      } else {
        // Create a new list
        listId = await ctx.db.insert("shoppingLists", {
          userId,
          name: "Shopping List",
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }
    } else {
      // Verify list ownership
      const list = await ctx.db.get(listId);
      if (!list || list.userId !== userId) {
        throw new Error("Shopping list not found");
      }
      if (list.status === "archived") {
        throw new Error("Cannot add items to an archived list");
      }
    }

    // Add selected ingredients
    const selectedIngredients = args.ingredientIndexes.map(
      (index) => recipe.ingredients[index]
    ).filter(Boolean);

    for (const ingredient of selectedIngredients) {
      const category = assignCategory(ingredient.name);

      await ctx.db.insert("shoppingItems", {
        listId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: category as ShoppingItemCategory,
        checked: false,
        isCustom: false,
        recipeIds: [args.recipeId],
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update list timestamp
    await ctx.db.patch(listId, { updatedAt: now });

    return { listId, itemCount: selectedIngredients.length };
  },
});

/**
 * Update an item's quantity, unit, or category
 */
export const updateItem = mutation({
  args: {
    itemId: v.id("shoppingItems"),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    category: v.optional(shoppingItemCategory),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You do not have permission to update this item");
    }

    if (list.status === "archived") {
      throw new Error("Cannot update items in an archived list");
    }

    const now = Date.now();
    const updates: {
      quantity?: number;
      unit?: string;
      category?: ShoppingItemCategory;
      updatedAt: number;
    } = { updatedAt: now };

    if (args.quantity !== undefined) {
      updates.quantity = args.quantity;
    }
    if (args.unit !== undefined) {
      updates.unit = args.unit;
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }

    await ctx.db.patch(args.itemId, updates);
    await ctx.db.patch(item.listId, { updatedAt: now });

    return args.itemId;
  },
});

/**
 * Toggle an item's checked state
 * Auto-archives the list if all items are checked
 */
export const toggleItemChecked = mutation({
  args: {
    itemId: v.id("shoppingItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You do not have permission to update this item");
    }

    if (list.status === "archived") {
      throw new Error("Cannot update items in an archived list");
    }

    const now = Date.now();
    const newCheckedState = !item.checked;

    await ctx.db.patch(args.itemId, {
      checked: newCheckedState,
      updatedAt: now,
    });

    await ctx.db.patch(item.listId, { updatedAt: now });

    // Check if all items are now checked for auto-archive
    if (newCheckedState) {
      const items = await ctx.db
        .query("shoppingItems")
        .withIndex("by_list", (q) => q.eq("listId", item.listId))
        .collect();

      const totalItems = items.length;
      // Count checked items, including the one we just toggled
      const checkedItems = items.filter((i) =>
        i._id === args.itemId ? newCheckedState : i.checked
      ).length;

      if (totalItems > 0 && checkedItems === totalItems) {
        // Auto-archive the list
        await ctx.db.patch(item.listId, {
          status: "archived",
          completedAt: now,
          updatedAt: now,
        });
      }
    }

    return { itemId: args.itemId, checked: newCheckedState };
  },
});

/**
 * Delete an item from a shopping list
 */
export const deleteItem = mutation({
  args: {
    itemId: v.id("shoppingItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You do not have permission to delete this item");
    }

    if (list.status === "archived") {
      throw new Error("Cannot delete items from an archived list");
    }

    const listId = item.listId;
    await ctx.db.delete(args.itemId);
    await ctx.db.patch(listId, { updatedAt: Date.now() });

    return args.itemId;
  },
});

/**
 * Update an item's category (manual override)
 */
export const updateItemCategory = mutation({
  args: {
    itemId: v.id("shoppingItems"),
    category: shoppingItemCategory,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    const list = await ctx.db.get(item.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You do not have permission to update this item");
    }

    if (list.status === "archived") {
      throw new Error("Cannot update items in an archived list");
    }

    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      category: args.category,
      updatedAt: now,
    });
    await ctx.db.patch(item.listId, { updatedAt: now });

    return args.itemId;
  },
});

// ============================================================================
// GENERATION MUTATIONS
// ============================================================================

/**
 * Generate a shopping list from selected meal plan meals
 */
export const generateFromMealPlan = mutation({
  args: {
    mealIds: v.array(v.id("plannedMeals")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    if (args.mealIds.length === 0) {
      throw new Error("At least one meal must be selected");
    }

    // Fetch all selected meals
    const meals = await Promise.all(
      args.mealIds.map((id) => ctx.db.get(id))
    );

    // Filter valid meals and verify ownership
    const validMeals = meals.filter(
      (meal): meal is NonNullable<typeof meal> =>
        meal !== null && meal.userId === userId
    );

    if (validMeals.length === 0) {
      throw new Error("No valid meals found");
    }

    // Get unique recipe IDs
    const recipeIds = [...new Set(validMeals.map((m) => m.recipeId))];

    // Fetch recipes
    const recipes = await Promise.all(
      recipeIds.map((id) => ctx.db.get(id))
    );

    // Build recipe data for aggregation
    const recipeData: RecipeWithIngredients[] = recipes
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((recipe) => ({
        recipeId: recipe._id,
        recipeName: recipe.title,
        ingredients: recipe.ingredients,
      }));

    // Aggregate ingredients
    const aggregatedIngredients = sortByCategory(
      aggregateIngredients(recipeData)
    );

    // Generate default name based on date range
    const dates = validMeals.map((m) => m.day).sort();
    const startDate = dates[0];
    const formattedDate = new Date(startDate + "T12:00:00").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    const defaultName = args.name || `Week of ${formattedDate}`;

    // Create the shopping list
    const listId = await ctx.db.insert("shoppingLists", {
      userId,
      name: defaultName,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Create shopping items
    for (const ingredient of aggregatedIngredients) {
      await ctx.db.insert("shoppingItems", {
        listId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        checked: false,
        isCustom: false,
        recipeIds: ingredient.recipeIds,
        recipeName: ingredient.recipeName ?? undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return listId;
  },
});
