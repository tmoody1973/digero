/**
 * Multi-Page Recipe Merge Utility
 *
 * Merges extracted recipe data from multiple scanned pages into a single
 * complete recipe. Uses first-non-empty strategy for scalar values and
 * concatenation for arrays.
 */

/**
 * Ingredient category type
 */
type IngredientCategory =
  | "meat"
  | "produce"
  | "dairy"
  | "pantry"
  | "spices"
  | "condiments"
  | "bread"
  | "other";

/**
 * Extracted ingredient from a recipe page
 */
interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Extracted recipe data from a single page
 */
export interface PageRecipeData {
  title: string | null;
  ingredients: ExtractedIngredient[];
  instructions: string[];
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  pageNumber: string | null;
}

/**
 * Merged recipe data from multiple pages
 */
export interface MergedRecipeData {
  title: string;
  ingredients: ExtractedIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  pageNumber: string;
}

/**
 * Format page numbers as a range
 *
 * Takes an array of page numbers and returns a formatted string.
 * Single page: "42"
 * Multiple consecutive: "pp. 42-44"
 * Multiple non-consecutive: "pp. 42, 45, 47"
 *
 * @param pageNumbers - Array of page number strings
 * @returns Formatted page number string
 */
export function formatPageRange(pageNumbers: (string | null)[]): string {
  // Filter out nulls and empty strings
  const validPages = pageNumbers
    .filter((p): p is string => p !== null && p !== "")
    .map((p) => p.trim());

  if (validPages.length === 0) {
    return "";
  }

  if (validPages.length === 1) {
    return validPages[0];
  }

  // Try to parse as numbers and check if consecutive
  const numericPages = validPages
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  if (numericPages.length >= 2) {
    // Check if consecutive
    let isConsecutive = true;
    for (let i = 1; i < numericPages.length; i++) {
      if (numericPages[i] !== numericPages[i - 1] + 1) {
        isConsecutive = false;
        break;
      }
    }

    if (isConsecutive) {
      return `pp. ${numericPages[0]}-${numericPages[numericPages.length - 1]}`;
    }

    // Non-consecutive, list them
    return `pp. ${numericPages.join(", ")}`;
  }

  // Non-numeric page references
  return `pp. ${validPages.join(", ")}`;
}

/**
 * Merge recipe data from multiple pages
 *
 * Merge strategy:
 * - Title: First non-empty value
 * - Ingredients: Concatenate all lists in scan order
 * - Instructions: Append in scan order
 * - Servings/prepTime/cookTime: First non-null/non-zero value
 * - Page numbers: Combine as range (e.g., "pp. 42-43")
 *
 * @param pages - Array of extracted recipe data from each page
 * @returns Merged recipe data
 */
export function mergeMultiPageRecipe(pages: PageRecipeData[]): MergedRecipeData {
  if (pages.length === 0) {
    throw new Error("Cannot merge empty page array");
  }

  if (pages.length === 1) {
    const page = pages[0];
    return {
      title: page.title || "Untitled Recipe",
      ingredients: page.ingredients,
      instructions: page.instructions,
      servings: page.servings || 4,
      prepTime: page.prepTime || 0,
      cookTime: page.cookTime || 0,
      pageNumber: page.pageNumber || "",
    };
  }

  // Find first non-empty title
  let title = "Untitled Recipe";
  for (const page of pages) {
    if (page.title && page.title.trim().length > 0) {
      title = page.title;
      break;
    }
  }

  // Concatenate all ingredients in order
  const ingredients: ExtractedIngredient[] = [];
  for (const page of pages) {
    ingredients.push(...page.ingredients);
  }

  // Concatenate all instructions in order
  const instructions: string[] = [];
  for (const page of pages) {
    instructions.push(...page.instructions);
  }

  // First non-null/non-zero for scalar values
  let servings = 4;
  let prepTime = 0;
  let cookTime = 0;

  for (const page of pages) {
    if (page.servings && page.servings > 0 && servings === 4) {
      servings = page.servings;
    }
    if (page.prepTime && page.prepTime > 0 && prepTime === 0) {
      prepTime = page.prepTime;
    }
    if (page.cookTime && page.cookTime > 0 && cookTime === 0) {
      cookTime = page.cookTime;
    }
  }

  // Format page range
  const pageNumbers = pages.map((p) => p.pageNumber);
  const pageNumber = formatPageRange(pageNumbers);

  return {
    title,
    ingredients,
    instructions,
    servings,
    prepTime,
    cookTime,
    pageNumber,
  };
}

/**
 * Check if a recipe extraction looks incomplete
 *
 * Used to suggest multi-page scanning when extraction results
 * seem to be missing content (e.g., instructions without ingredients).
 *
 * @param data - Extracted recipe data
 * @returns true if the recipe appears incomplete
 */
export function isRecipeIncomplete(data: PageRecipeData): boolean {
  // Has ingredients but no instructions
  if (data.ingredients.length > 0 && data.instructions.length === 0) {
    return true;
  }

  // Has instructions but no ingredients
  if (data.instructions.length > 0 && data.ingredients.length === 0) {
    return true;
  }

  // Very few ingredients (less than 3) might indicate incomplete
  if (data.ingredients.length > 0 && data.ingredients.length < 3) {
    return true;
  }

  // Very few instructions (1) might indicate incomplete
  if (data.instructions.length === 1) {
    return true;
  }

  return false;
}
