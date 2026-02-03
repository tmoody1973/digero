// =============================================================================
// Data Types
// =============================================================================

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
  /** For scanned recipes: the cookbook this was scanned from */
  scannedFromBook?: {
    name: string
    coverImageUrl: string
  }
}

export interface ScanSession {
  /** Cookbook name (entered by user or extracted from cover) */
  bookName: string
  /** Photo of the cookbook cover */
  coverImageUrl: string
  /** Recipes scanned in this session */
  scannedRecipes: Recipe[]
  /** Whether the session is still active */
  isActive: boolean
}

// =============================================================================
// Component Props
// =============================================================================

export interface RecipeLibraryProps {
  /** The list of recipes to display */
  recipes: Recipe[]

  // View controls
  /** Current view mode */
  viewMode?: 'grid' | 'list'
  /** Called when user toggles between grid and list view */
  onViewModeChange?: (mode: 'grid' | 'list') => void

  // Search and filter
  /** Current search query */
  searchQuery?: string
  /** Called when user types in search */
  onSearch?: (query: string) => void
  /** Current source filter */
  sourceFilter?: 'all' | 'youtube' | 'website' | 'scanned' | 'manual'
  /** Called when user changes source filter */
  onSourceFilterChange?: (source: 'all' | 'youtube' | 'website' | 'scanned' | 'manual') => void

  // Recipe actions
  /** Called when user wants to view a recipe's details */
  onView?: (id: string) => void
  /** Called when user wants to edit a recipe */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a recipe */
  onDelete?: (id: string) => void
  /** Called when user wants to share a recipe */
  onShare?: (id: string) => void

  // Add recipe actions
  /** Called when user wants to search YouTube for recipes */
  onSearchYouTube?: () => void
  /** Called when user wants to add a recipe from URL */
  onAddFromUrl?: () => void
  /** Called when user wants to start a cookbook scanning session */
  onStartScanSession?: () => void
  /** Called when user captures the cookbook cover photo */
  onCaptureCover?: (imageData: string) => void
  /** Called when user scans a recipe page */
  onScanRecipePage?: (imageData: string) => void
  /** Called when user finishes the scanning session */
  onEndScanSession?: () => void
  /** Called when user wants to manually create a recipe */
  onManualEntry?: () => void

  // Recipe detail actions
  /** Called when user changes serving size to scale ingredients */
  onScaleServings?: (id: string, newServings: number) => void
  /** Called when user wants to convert recipe to a diet (vegan/vegetarian) */
  onConvertDiet?: (id: string, diet: 'vegan' | 'vegetarian') => void
  /** Called when user adds ingredients to shopping list */
  onAddToShoppingList?: (id: string, ingredientIds?: string[]) => void
  /** Called when user adds recipe to meal plan */
  onAddToMealPlan?: (id: string, day: string, mealSlot: 'breakfast' | 'lunch' | 'dinner') => void
  /** Called when user adds recipe to a cookbook */
  onAddToCookbook?: (id: string, cookbookId: string) => void
}

// =============================================================================
// Recipe Detail Props (for the detail view component)
// =============================================================================

export interface RecipeDetailProps {
  /** The recipe to display */
  recipe: Recipe
  /** Current scaled serving size (may differ from recipe.servings) */
  currentServings?: number
  /** Scaled ingredients based on currentServings */
  scaledIngredients?: Ingredient[]

  // Actions
  /** Called when user changes serving size */
  onScaleServings?: (newServings: number) => void
  /** Called when user wants to convert to vegan */
  onConvertVegan?: () => void
  /** Called when user wants to convert to vegetarian */
  onConvertVegetarian?: () => void
  /** Called when user adds all ingredients to shopping list */
  onAddAllToShoppingList?: () => void
  /** Called when user adds selected ingredients to shopping list */
  onAddSelectedToShoppingList?: (ingredientIndexes: number[]) => void
  /** Called when user wants to add to meal plan */
  onAddToMealPlan?: () => void
  /** Called when user wants to add to cookbook */
  onAddToCookbook?: () => void
  /** Called when user wants to edit the recipe */
  onEdit?: () => void
  /** Called when user wants to share the recipe */
  onShare?: () => void
  /** Called when user wants to delete the recipe */
  onDelete?: () => void
  /** Called when user wants to go back to the list */
  onBack?: () => void
}
