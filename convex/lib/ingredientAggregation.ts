/**
 * Ingredient Aggregation Utility
 *
 * Combines duplicate ingredients from multiple recipes into aggregated items.
 * Handles unit conversion and tracks source recipes.
 */

import { Id } from "../_generated/dataModel";
import {
  areUnitsCompatible,
  combineQuantities,
  isCountUnit,
  normalizeUnit,
} from "./unitConversion";
import {
  assignCategory,
  mapRecipeCategoryToShoppingCategory,
  ShoppingItemCategory,
} from "./categoryAssignment";

/**
 * Input ingredient from a recipe
 */
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

/**
 * Recipe with ingredients
 */
export interface RecipeWithIngredients {
  recipeId: Id<"recipes">;
  recipeName: string;
  ingredients: RecipeIngredient[];
}

/**
 * Aggregated ingredient for shopping list
 */
export interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingItemCategory;
  recipeIds: Id<"recipes">[];
  recipeName: string | null;
}

/**
 * Normalize an ingredient name for comparison
 * Lowercases, trims, and removes common variations
 *
 * @param name - The ingredient name to normalize
 * @returns Normalized name string
 */
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes
    .replace(/^(fresh|dried|frozen|canned|chopped|diced|minced|sliced|whole)\s+/g, "")
    // Remove common suffixes
    .replace(/\s*,.*$/, "") // Remove anything after comma
    .replace(/\s*\(.*\)$/, "") // Remove parenthetical notes
    .trim();
}

/**
 * Generate a unique key for an ingredient
 * Items with the same key and compatible units will be combined
 *
 * @param name - Ingredient name
 * @param unit - Ingredient unit
 * @returns A key string for grouping
 */
function generateIngredientKey(name: string, unit: string): string {
  const normalizedName = normalizeIngredientName(name);
  const normalizedUnit = normalizeUnit(unit);

  // For count units, include the unit in the key to keep them separate
  if (isCountUnit(unit)) {
    return `${normalizedName}|${normalizedUnit}`;
  }

  // For convertible units, just use the name
  return normalizedName;
}

/**
 * Aggregate ingredients from multiple recipes
 *
 * @param recipes - Array of recipes with their ingredients
 * @returns Array of aggregated ingredients
 */
export function aggregateIngredients(
  recipes: RecipeWithIngredients[]
): AggregatedIngredient[] {
  // Map to track aggregated ingredients by normalized key
  const aggregatedMap = new Map<
    string,
    {
      name: string;
      quantity: number;
      unit: string;
      category: ShoppingItemCategory;
      recipeIds: Set<Id<"recipes">>;
      recipeNames: Set<string>;
    }
  >();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = generateIngredientKey(ingredient.name, ingredient.unit);
      const existing = aggregatedMap.get(key);

      if (existing) {
        // Try to combine with existing
        if (areUnitsCompatible(existing.unit, ingredient.unit)) {
          // Convert and combine
          const combined = combineQuantities(
            existing.quantity,
            existing.unit,
            ingredient.quantity,
            ingredient.unit
          );

          if (combined) {
            existing.quantity = combined.quantity;
            existing.unit = combined.unit;
          } else {
            // Fallback: just add quantities if units are the same
            if (normalizeUnit(existing.unit) === normalizeUnit(ingredient.unit)) {
              existing.quantity += ingredient.quantity;
            }
          }
        } else if (
          normalizeUnit(existing.unit) === normalizeUnit(ingredient.unit)
        ) {
          // Same unit (count units), just add
          existing.quantity += ingredient.quantity;
        } else {
          // Incompatible units - create a separate entry with unit suffix
          const newKey = `${key}|${normalizeUnit(ingredient.unit)}`;
          if (!aggregatedMap.has(newKey)) {
            const category =
              mapRecipeCategoryToShoppingCategory(ingredient.category) ||
              assignCategory(ingredient.name);

            aggregatedMap.set(newKey, {
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              category,
              recipeIds: new Set([recipe.recipeId]),
              recipeNames: new Set([recipe.recipeName]),
            });
          } else {
            const altExisting = aggregatedMap.get(newKey)!;
            altExisting.quantity += ingredient.quantity;
            altExisting.recipeIds.add(recipe.recipeId);
            altExisting.recipeNames.add(recipe.recipeName);
          }
          continue;
        }

        existing.recipeIds.add(recipe.recipeId);
        existing.recipeNames.add(recipe.recipeName);
      } else {
        // Create new entry
        const category =
          mapRecipeCategoryToShoppingCategory(ingredient.category) ||
          assignCategory(ingredient.name);

        aggregatedMap.set(key, {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category,
          recipeIds: new Set([recipe.recipeId]),
          recipeNames: new Set([recipe.recipeName]),
        });
      }
    }
  }

  // Convert map to array of AggregatedIngredient
  return Array.from(aggregatedMap.values()).map((item) => {
    const recipeIds = Array.from(item.recipeIds);
    const recipeNames = Array.from(item.recipeNames);

    // Use single recipe name if only one source, otherwise null
    const recipeName =
      recipeNames.length === 1
        ? recipeNames[0]
        : recipeNames.length > 1
          ? `${recipeNames[0]} +${recipeNames.length - 1} more`
          : null;

    return {
      name: item.name,
      quantity: Math.round(item.quantity * 100) / 100, // Round to 2 decimal places
      unit: item.unit,
      category: item.category,
      recipeIds,
      recipeName,
    };
  });
}

/**
 * Sort aggregated ingredients by category and name
 *
 * @param ingredients - Array of aggregated ingredients
 * @returns Sorted array
 */
export function sortByCategory(
  ingredients: AggregatedIngredient[]
): AggregatedIngredient[] {
  const categoryOrder: ShoppingItemCategory[] = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Pantry",
    "Bakery",
    "Frozen",
    "Beverages",
    "Household",
  ];

  return [...ingredients].sort((a, b) => {
    const categoryDiff =
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.name.localeCompare(b.name);
  });
}
