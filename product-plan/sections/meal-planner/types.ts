// =============================================================================
// Data Types
// =============================================================================

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

export interface RecipePickerItem {
  id: string
  name: string
  image: string
  prepTime: string
  category: MealSlot
}

// =============================================================================
// Component Props
// =============================================================================

export interface MealPlannerProps {
  /** Current week information for display */
  currentWeek: WeekInfo
  /** Available meal slots */
  mealSlots: MealSlot[]
  /** Meals planned for the current week */
  plannedMeals: PlannedMeal[]
  /** Recipes available in the picker sidebar */
  recipePickerItems: RecipePickerItem[]
  /** Whether selection mode is active for generating shopping list */
  isSelectionMode?: boolean
  /** Currently selected meal IDs (for shopping list generation) */
  selectedMealIds?: string[]

  // Navigation
  /** Called when user navigates to previous week */
  onPreviousWeek?: () => void
  /** Called when user navigates to next week */
  onNextWeek?: () => void
  /** Called when user navigates to current week */
  onToday?: () => void

  // Meal actions
  /** Called when user adds a recipe to a slot (from picker or search) */
  onAddMeal?: (recipeId: string, day: string, slot: MealSlot) => void
  /** Called when user moves a meal to a different slot */
  onMoveMeal?: (mealId: string, newDay: string, newSlot: MealSlot) => void
  /** Called when user copies a meal to another slot */
  onCopyMeal?: (mealId: string, newDay: string, newSlot: MealSlot) => void
  /** Called when user removes a meal from a slot */
  onRemoveMeal?: (mealId: string) => void
  /** Called when user taps an empty slot to add a recipe */
  onSlotTap?: (day: string, slot: MealSlot) => void
  /** Called when user taps a planned meal to view recipe */
  onViewRecipe?: (recipeId: string) => void

  // Bulk actions
  /** Called when user clears all meals for a day */
  onClearDay?: (day: string) => void
  /** Called when user clears the entire week */
  onClearWeek?: () => void

  // Selection mode (for shopping list)
  /** Called when user enters selection mode */
  onEnterSelectionMode?: () => void
  /** Called when user exits selection mode */
  onExitSelectionMode?: () => void
  /** Called when user toggles a meal's selection */
  onToggleMealSelection?: (mealId: string) => void
  /** Called when user selects all meals for a day */
  onSelectDay?: (day: string) => void
  /** Called when user generates shopping list from selected meals */
  onGenerateShoppingList?: (mealIds: string[]) => void
}

export interface MealSlotCardProps {
  /** The planned meal (or null if empty) */
  meal: PlannedMeal | null
  /** The day this slot belongs to */
  day: string
  /** The slot type */
  slot: MealSlot
  /** Whether this meal is selected (in selection mode) */
  isSelected?: boolean
  /** Whether selection mode is active */
  isSelectionMode?: boolean

  // Actions
  /** Called when user taps an empty slot */
  onTap?: () => void
  /** Called when user removes the meal */
  onRemove?: () => void
  /** Called when user toggles selection */
  onToggleSelect?: () => void
  /** Called when user taps to view the recipe */
  onViewRecipe?: () => void
}

export interface RecipePickerProps {
  /** Recipes available for selection */
  recipes: RecipePickerItem[]
  /** Current filter category */
  filterCategory?: MealSlot | 'all'
  /** Search query */
  searchQuery?: string

  // Actions
  /** Called when user selects a recipe to add */
  onSelectRecipe?: (recipeId: string) => void
  /** Called when user changes filter category */
  onFilterChange?: (category: MealSlot | 'all') => void
  /** Called when user searches */
  onSearch?: (query: string) => void
}

export interface DayColumnProps {
  /** The date for this column */
  day: string
  /** Day name (e.g., "Mon", "Tue") */
  dayName: string
  /** Date number (e.g., "2", "3") */
  dateNumber: string
  /** Whether this is today */
  isToday: boolean
  /** Meals planned for this day */
  meals: PlannedMeal[]
  /** Available meal slots */
  slots: MealSlot[]
  /** Whether selection mode is active */
  isSelectionMode?: boolean
  /** Selected meal IDs */
  selectedMealIds?: string[]

  // Actions
  /** Called when user clears this day */
  onClearDay?: () => void
  /** Called when user selects all meals in this day */
  onSelectAll?: () => void
}
