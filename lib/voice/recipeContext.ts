/**
 * Recipe Context Builder
 *
 * Utilities for building recipe context for the Gemini AI system prompt.
 * Formats recipe data as structured information for the cooking assistant.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Parsed ingredient from recipe
 */
export interface ParsedIngredient {
  /** Original raw ingredient text */
  raw: string;
  /** Parsed ingredient details */
  parsed: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
  } | null;
}

/**
 * Recipe data structure for context building
 */
export interface RecipeData {
  /** Recipe ID */
  id: string;
  /** Recipe title */
  title: string;
  /** Base servings */
  servings: number;
  /** List of ingredients (raw strings or parsed) */
  ingredients: string[] | ParsedIngredient[];
  /** List of instruction steps */
  instructions: string[];
  /** Prep time in minutes */
  prepTime?: number;
  /** Cook time in minutes */
  cookTime?: number;
}

/**
 * Context options for building the recipe context
 */
export interface RecipeContextOptions {
  /** Current step number (0-indexed) */
  currentStep?: number;
  /** Scale multiplier for ingredients (e.g., 2 for doubled) */
  scaleMultiplier?: number;
  /** Target servings (alternative to multiplier) */
  targetServings?: number;
}

/**
 * Scaled ingredient result
 */
export interface ScaledIngredient {
  /** Original ingredient text */
  original: string;
  /** Scaled quantity */
  scaledQuantity: number | null;
  /** Unit of measurement */
  unit: string | null;
  /** Ingredient name */
  name: string;
  /** Formatted string with scaled quantity */
  formatted: string;
}

/**
 * Built recipe context result
 */
export interface RecipeContext {
  /** System prompt text for Gemini */
  systemPrompt: string;
  /** Structured recipe data as JSON */
  structuredData: {
    title: string;
    baseServings: number;
    currentServings: number;
    scaleMultiplier: number;
    ingredients: ScaledIngredient[];
    instructions: Array<{
      stepNumber: number;
      text: string;
      isCurrent: boolean;
    }>;
    currentStep: {
      number: number;
      text: string;
    } | null;
    timing: {
      prepTime: number | null;
      cookTime: number | null;
      totalTime: number | null;
    };
  };
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Base system prompt for the cooking assistant
 */
const BASE_SYSTEM_PROMPT = `You are a helpful cooking assistant. You are helping the user cook a recipe step by step.

Your responsibilities:
- Answer questions about the recipe, ingredients, and cooking techniques
- Help with timing and coordination
- Provide substitutions when asked
- Give helpful tips and warnings (e.g., "be careful, the pan is hot")
- Confirm timer commands and navigation requests

Keep responses concise and clear - the user is actively cooking and needs quick answers.
Speak naturally as if you're in the kitchen with them.

Current Recipe Information:
`;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Parse a quantity from an ingredient string
 * Handles fractions, decimals, and spelled-out numbers
 */
function parseQuantity(text: string): { quantity: number | null; rest: string } {
  // Match common fraction patterns (e.g., "1/2", "1 1/2")
  const fractionPattern = /^(\d+\s+)?(\d+)\/(\d+)\s*/;
  const fractionMatch = text.match(fractionPattern);

  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1].trim()) : 0;
    const numerator = parseInt(fractionMatch[2]);
    const denominator = parseInt(fractionMatch[3]);
    const quantity = whole + numerator / denominator;
    return {
      quantity,
      rest: text.slice(fractionMatch[0].length),
    };
  }

  // Match decimal or whole numbers
  const numberPattern = /^(\d+(?:\.\d+)?)\s*/;
  const numberMatch = text.match(numberPattern);

  if (numberMatch) {
    return {
      quantity: parseFloat(numberMatch[1]),
      rest: text.slice(numberMatch[0].length),
    };
  }

  return { quantity: null, rest: text };
}

/**
 * Parse a unit from an ingredient string
 */
function parseUnit(text: string): { unit: string | null; rest: string } {
  const units = [
    // Volume
    "cup",
    "cups",
    "tablespoon",
    "tablespoons",
    "tbsp",
    "teaspoon",
    "teaspoons",
    "tsp",
    "ounce",
    "ounces",
    "oz",
    "fluid ounce",
    "fluid ounces",
    "fl oz",
    "pint",
    "pints",
    "pt",
    "quart",
    "quarts",
    "qt",
    "gallon",
    "gallons",
    "gal",
    "milliliter",
    "milliliters",
    "ml",
    "liter",
    "liters",
    "l",
    // Weight
    "pound",
    "pounds",
    "lb",
    "lbs",
    "gram",
    "grams",
    "g",
    "kilogram",
    "kilograms",
    "kg",
    // Count/Other
    "piece",
    "pieces",
    "slice",
    "slices",
    "clove",
    "cloves",
    "head",
    "heads",
    "bunch",
    "bunches",
    "can",
    "cans",
    "package",
    "packages",
    "bag",
    "bags",
    "stick",
    "sticks",
    "pinch",
    "pinches",
    "dash",
    "dashes",
    // Size modifiers
    "small",
    "medium",
    "large",
  ];

  const lowerText = text.toLowerCase();

  for (const unit of units) {
    if (lowerText.startsWith(unit + " ") || lowerText.startsWith(unit + ",")) {
      return {
        unit: unit,
        rest: text.slice(unit.length).trim(),
      };
    }
  }

  return { unit: null, rest: text };
}

/**
 * Parse a raw ingredient string into components
 */
function parseIngredientString(raw: string): ScaledIngredient {
  const trimmed = raw.trim();

  const { quantity, rest: afterQuantity } = parseQuantity(trimmed);
  const { unit, rest: afterUnit } = parseUnit(afterQuantity);
  const name = afterUnit.replace(/^,\s*/, "").trim() || trimmed;

  return {
    original: raw,
    scaledQuantity: quantity,
    unit,
    name,
    formatted: raw,
  };
}

/**
 * Scale an ingredient by a multiplier
 */
function scaleIngredient(
  ingredient: ScaledIngredient,
  multiplier: number
): ScaledIngredient {
  if (multiplier === 1 || ingredient.scaledQuantity === null) {
    return ingredient;
  }

  const scaledQuantity = ingredient.scaledQuantity * multiplier;

  // Format the scaled quantity nicely
  let formattedQuantity: string;
  if (Number.isInteger(scaledQuantity)) {
    formattedQuantity = scaledQuantity.toString();
  } else {
    // Round to 2 decimal places
    formattedQuantity = scaledQuantity.toFixed(2).replace(/\.?0+$/, "");
  }

  const unit = ingredient.unit ? ` ${ingredient.unit}` : "";
  const formatted = `${formattedQuantity}${unit} ${ingredient.name}`;

  return {
    ...ingredient,
    scaledQuantity,
    formatted: formatted.trim(),
  };
}

/**
 * Format time in minutes as a human-readable string
 */
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
}

// =============================================================================
// Main Functions
// =============================================================================

/**
 * Build recipe context for the Gemini AI system prompt
 *
 * Formats the recipe data as structured JSON and creates a natural
 * language system prompt for the cooking assistant.
 *
 * @param recipe - Recipe data to format
 * @param options - Context options (current step, scale, etc.)
 * @returns Recipe context with system prompt and structured data
 *
 * @example
 * ```typescript
 * const context = buildRecipeContext(recipe, {
 *   currentStep: 2,
 *   scaleMultiplier: 2,
 * });
 *
 * // Use context.systemPrompt for Gemini
 * await geminiClient.updateSystemInstruction(context.systemPrompt);
 * ```
 */
export function buildRecipeContext(
  recipe: RecipeData,
  options: RecipeContextOptions = {}
): RecipeContext {
  const {
    currentStep = 0,
    scaleMultiplier: providedMultiplier,
    targetServings,
  } = options;

  // Calculate scale multiplier
  let scaleMultiplier = providedMultiplier ?? 1;
  if (targetServings && recipe.servings > 0) {
    scaleMultiplier = targetServings / recipe.servings;
  }

  const currentServings = Math.round(recipe.servings * scaleMultiplier);

  // Parse and scale ingredients
  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map(
    (ing) => {
      let parsed: ScaledIngredient;

      if (typeof ing === "string") {
        parsed = parseIngredientString(ing);
      } else if (ing.parsed) {
        parsed = {
          original: ing.raw,
          scaledQuantity: ing.parsed.quantity,
          unit: ing.parsed.unit,
          name: ing.parsed.name,
          formatted: ing.raw,
        };
      } else {
        parsed = parseIngredientString(ing.raw);
      }

      return scaleIngredient(parsed, scaleMultiplier);
    }
  );

  // Format instructions with step numbers
  const formattedInstructions = recipe.instructions.map((text, index) => ({
    stepNumber: index + 1,
    text,
    isCurrent: index === currentStep,
  }));

  // Get current step info
  const currentStepInfo =
    currentStep >= 0 && currentStep < recipe.instructions.length
      ? {
          number: currentStep + 1,
          text: recipe.instructions[currentStep],
        }
      : null;

  // Calculate timing
  const prepTime = recipe.prepTime ?? null;
  const cookTime = recipe.cookTime ?? null;
  const totalTime = prepTime !== null || cookTime !== null
    ? (prepTime ?? 0) + (cookTime ?? 0)
    : null;

  // Build structured data
  const structuredData: RecipeContext["structuredData"] = {
    title: recipe.title,
    baseServings: recipe.servings,
    currentServings,
    scaleMultiplier,
    ingredients: scaledIngredients,
    instructions: formattedInstructions,
    currentStep: currentStepInfo,
    timing: {
      prepTime,
      cookTime,
      totalTime,
    },
  };

  // Build system prompt
  let systemPrompt = BASE_SYSTEM_PROMPT;

  // Add recipe header
  systemPrompt += `\n## ${recipe.title}\n`;

  // Add servings info
  if (scaleMultiplier !== 1) {
    systemPrompt += `Servings: ${currentServings} (scaled from original ${recipe.servings} servings, ${scaleMultiplier}x multiplier)\n`;
  } else {
    systemPrompt += `Servings: ${recipe.servings}\n`;
  }

  // Add timing info
  if (totalTime !== null) {
    systemPrompt += `Total Time: ${formatTime(totalTime)}`;
    if (prepTime !== null && cookTime !== null) {
      systemPrompt += ` (${formatTime(prepTime)} prep, ${formatTime(cookTime)} cook)`;
    }
    systemPrompt += "\n";
  }

  // Add ingredients
  systemPrompt += "\n### Ingredients\n";
  for (const ing of scaledIngredients) {
    systemPrompt += `- ${ing.formatted}\n`;
  }

  // Add instructions
  systemPrompt += "\n### Instructions\n";
  for (const step of formattedInstructions) {
    const marker = step.isCurrent ? ">>> " : "";
    systemPrompt += `${marker}${step.stepNumber}. ${step.text}\n`;
  }

  // Add current step emphasis
  if (currentStepInfo) {
    systemPrompt += `\n### Current Step (${currentStepInfo.number} of ${recipe.instructions.length})\n`;
    systemPrompt += `"${currentStepInfo.text}"\n`;
    systemPrompt += `\nThe user is currently on this step. Focus answers on this context unless they ask about something else.\n`;
  }

  return {
    systemPrompt,
    structuredData,
  };
}

/**
 * Get scaled quantity for a specific ingredient
 *
 * @param recipe - Recipe data
 * @param ingredientQuery - Search term for ingredient
 * @param scaleMultiplier - Scale multiplier
 * @returns Scaled ingredient or null if not found
 */
export function getScaledIngredient(
  recipe: RecipeData,
  ingredientQuery: string,
  scaleMultiplier: number = 1
): ScaledIngredient | null {
  const query = ingredientQuery.toLowerCase();

  for (const ing of recipe.ingredients) {
    const raw = typeof ing === "string" ? ing : ing.raw;

    if (raw.toLowerCase().includes(query)) {
      const parsed = parseIngredientString(raw);
      return scaleIngredient(parsed, scaleMultiplier);
    }
  }

  return null;
}

/**
 * Calculate scale multiplier from target servings
 *
 * @param baseServings - Original recipe servings
 * @param targetServings - Desired servings
 * @returns Scale multiplier
 */
export function calculateScaleMultiplier(
  baseServings: number,
  targetServings: number
): number {
  if (baseServings <= 0) {
    return 1;
  }
  return targetServings / baseServings;
}
