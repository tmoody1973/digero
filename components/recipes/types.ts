/**
 * Types for Manual Recipe Creation
 *
 * Defines interfaces for form state, ingredients, and instructions.
 */

/**
 * Ingredient category options
 */
export type IngredientCategory =
  | "meat"
  | "produce"
  | "dairy"
  | "pantry"
  | "spices"
  | "condiments"
  | "bread"
  | "other";

/**
 * Difficulty level options
 */
export type DifficultyLevel = "easy" | "medium" | "hard";

/**
 * Unit options for ingredients
 */
export const UNIT_OPTIONS = [
  "cup",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "piece",
  "clove",
  "bunch",
  "can",
  "package",
] as const;

export type UnitOption = (typeof UNIT_OPTIONS)[number];

/**
 * Category options for ingredients
 */
export const CATEGORY_OPTIONS: IngredientCategory[] = [
  "meat",
  "produce",
  "dairy",
  "pantry",
  "spices",
  "condiments",
  "bread",
  "other",
];

/**
 * Dietary tag options
 */
export const DIETARY_TAG_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "low-carb",
  "keto",
  "paleo",
] as const;

export type DietaryTag = (typeof DIETARY_TAG_OPTIONS)[number];

/**
 * Cuisine type suggestions
 */
export const CUISINE_SUGGESTIONS = [
  "Italian",
  "Mexican",
  "Asian",
  "American",
  "Indian",
  "Mediterranean",
  "French",
  "Japanese",
  "Thai",
  "Chinese",
] as const;

/**
 * Form ingredient state
 */
export interface FormIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
}

/**
 * Form instruction state
 */
export interface FormInstruction {
  id: string;
  text: string;
}

/**
 * Nutrition form state
 */
export interface FormNutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

/**
 * Complete form state for manual recipe creation
 */
export interface RecipeFormState {
  title: string;
  imageUri: string | null;
  ingredients: FormIngredient[];
  instructions: FormInstruction[];
  servings: string;
  prepTime: string;
  cookTime: string;
  cuisineType: string;
  difficulty: DifficultyLevel | null;
  dietaryTags: string[];
  nutrition: FormNutrition;
  notes: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  title?: string;
  ingredients?: string;
  instructions?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

/**
 * Create an empty ingredient row
 */
export function createEmptyIngredient(): FormIngredient {
  return {
    id: generateId(),
    name: "",
    quantity: "",
    unit: "",
    category: "other",
  };
}

/**
 * Create an empty instruction
 */
export function createEmptyInstruction(): FormInstruction {
  return {
    id: generateId(),
    text: "",
  };
}

/**
 * Create initial form state
 */
export function createInitialFormState(): RecipeFormState {
  return {
    title: "",
    imageUri: null,
    ingredients: [createEmptyIngredient()],
    instructions: [createEmptyInstruction()],
    servings: "",
    prepTime: "",
    cookTime: "",
    cuisineType: "",
    difficulty: null,
    dietaryTags: [],
    nutrition: {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    },
    notes: "",
  };
}

/**
 * Generate a unique ID for form items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
