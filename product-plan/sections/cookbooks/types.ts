// =============================================================================
// Data Types
// =============================================================================

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

// =============================================================================
// Component Props
// =============================================================================

export interface CookbooksProps {
  /** List of all cookbooks */
  cookbooks: Cookbook[]
  /** Current view mode */
  viewMode?: 'grid' | 'list'

  // View controls
  /** Called when user toggles between grid and list view */
  onViewModeChange?: (mode: 'grid' | 'list') => void

  // Cookbook actions
  /** Called when user wants to view a cookbook's contents */
  onViewCookbook?: (cookbookId: string) => void
  /** Called when user wants to create a new cookbook */
  onCreateCookbook?: () => void
  /** Called when user wants to edit a cookbook (name, cover) */
  onEditCookbook?: (cookbookId: string) => void
  /** Called when user wants to delete a cookbook */
  onDeleteCookbook?: (cookbookId: string) => void
  /** Called when user reorders cookbooks */
  onReorderCookbooks?: (cookbookIds: string[]) => void
  /** Called when user wants to share a cookbook */
  onShareCookbook?: (cookbookId: string) => void
}

export interface CookbookDetailProps {
  /** The cookbook being viewed */
  cookbook: Cookbook
  /** Recipes in this cookbook */
  recipes: CookbookRecipe[]
  /** Current sort option */
  sortBy?: 'position' | 'dateAdded' | 'title'
  /** Current view mode */
  viewMode?: 'grid' | 'list'

  // View controls
  /** Called when user changes sort option */
  onSortChange?: (sortBy: 'position' | 'dateAdded' | 'title') => void
  /** Called when user toggles between grid and list view */
  onViewModeChange?: (mode: 'grid' | 'list') => void

  // Recipe actions
  /** Called when user wants to view a recipe's details */
  onViewRecipe?: (recipeId: string) => void
  /** Called when user removes a recipe from this cookbook */
  onRemoveRecipe?: (recipeId: string) => void
  /** Called when user removes multiple recipes from this cookbook */
  onRemoveRecipes?: (recipeIds: string[]) => void
  /** Called when user reorders recipes in this cookbook */
  onReorderRecipes?: (recipeIds: string[]) => void

  // Cookbook actions
  /** Called when user wants to edit the cookbook (name, cover) */
  onEditCookbook?: () => void
  /** Called when user wants to share the cookbook */
  onShareCookbook?: () => void
  /** Called when user wants to go back to cookbook list */
  onBack?: () => void
}

export interface CookbookCardProps {
  /** The cookbook to display */
  cookbook: Cookbook

  // Actions
  /** Called when user taps the cookbook card */
  onView?: () => void
  /** Called when user wants to edit the cookbook */
  onEdit?: () => void
  /** Called when user wants to delete the cookbook */
  onDelete?: () => void
  /** Called when user wants to share the cookbook */
  onShare?: () => void
}

export interface CookbookRecipeCardProps {
  /** The recipe reference to display */
  recipe: CookbookRecipe
  /** Whether this card is selected in multi-select mode */
  isSelected?: boolean

  // Actions
  /** Called when user taps the recipe card */
  onView?: () => void
  /** Called when user toggles selection in multi-select mode */
  onToggleSelect?: () => void
  /** Called when user removes recipe from cookbook */
  onRemove?: () => void
}

export interface CreateCookbookModalProps {
  /** Whether the modal is open */
  isOpen: boolean

  // Actions
  /** Called when user submits the new cookbook */
  onSubmit?: (name: string, coverUrl: string) => void
  /** Called when user cancels/closes the modal */
  onCancel?: () => void
}

export interface EditCookbookModalProps {
  /** The cookbook being edited */
  cookbook: Cookbook
  /** Whether the modal is open */
  isOpen: boolean

  // Actions
  /** Called when user saves changes */
  onSave?: (name: string, coverUrl: string) => void
  /** Called when user cancels/closes the modal */
  onCancel?: () => void
}
