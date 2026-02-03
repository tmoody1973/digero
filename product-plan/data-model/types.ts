// =============================================================================
// Core Data Types for Digero
// =============================================================================

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------

export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced'

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'low-carb-keto'

export const DIETARY_RESTRICTION_OPTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'low-carb-keto', label: 'Low-Carb/Keto' },
]

export const COOKING_SKILL_LEVEL_OPTIONS: { value: CookingSkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export interface User {
  id: string
  clerkId: string
  email: string
  name: string
  avatarUrl?: string
  cookingSkillLevel?: CookingSkillLevel
  dietaryRestrictions: string[]
  hasCompletedOnboarding: boolean
  createdAt: number
  updatedAt: number
}

// -----------------------------------------------------------------------------
// Recipe
// -----------------------------------------------------------------------------

export interface Ingredient {
  name: string
  quantity: number
  unit: string
  category: 'meat' | 'produce' | 'dairy' | 'pantry' | 'spices' | 'condiments' | 'bread' | 'other'
}

export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Recipe {
  id: string
  title: string
  source: 'youtube' | 'website' | 'scanned' | 'manual'
  sourceUrl: string | null
  youtubeVideoId: string | null
  imageUrl: string
  servings: number
  prepTime: number
  cookTime: number
  ingredients: Ingredient[]
  instructions: string[]
  nutrition: Nutrition
  notes: string
  createdAt: string
  scannedFromBook?: {
    name: string
    coverImageUrl: string
  }
}

// -----------------------------------------------------------------------------
// Channel
// -----------------------------------------------------------------------------

export interface Video {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  publishedAt: string
  viewCount: number
}

export interface Channel {
  id: string
  name: string
  avatarUrl: string
  subscriberCount: number
  isFollowing: boolean
  isFeatured: boolean
  category: string
  description: string
  recentVideos: Video[]
}

// -----------------------------------------------------------------------------
// Cookbook
// -----------------------------------------------------------------------------

export interface Cookbook {
  id: string
  name: string
  description: string
  coverUrl: string
  recipeCount: number
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

export interface CookbookRecipe {
  recipeId: string
  title: string
  imageUrl: string
  source: 'youtube' | 'website' | 'scanned' | 'manual'
  position: number
  dateAdded: string
}

// -----------------------------------------------------------------------------
// Meal Plan
// -----------------------------------------------------------------------------

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export interface WeekInfo {
  startDate: string
  endDate: string
  weekLabel: string
}

export interface PlannedMeal {
  id: string
  recipeId: string
  recipeName: string
  recipeImage: string
  prepTime: string
  day: string
  slot: MealSlot
}

// -----------------------------------------------------------------------------
// Shopping List
// -----------------------------------------------------------------------------

export type ShoppingListStatus = 'active' | 'archived'

export type ItemCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Bakery'
  | 'Frozen'
  | 'Beverages'
  | 'Household'

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: ItemCategory
  isChecked: boolean
  recipeId: string | null
  recipeName: string | null
  isCustom: boolean
}

export interface ShoppingList {
  id: string
  name: string
  createdAt: string
  status: ShoppingListStatus
  completedAt?: string
  totalItems: number
  checkedItems: number
  items: ShoppingItem[]
}
