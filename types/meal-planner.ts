/**
 * Meal Planner Types
 *
 * Type definitions for the meal planner feature including
 * meal slots, week navigation, planned meals, and component props.
 */

import { Id } from "@/convex/_generated/dataModel";

// =============================================================================
// Data Types
// =============================================================================

/**
 * Meal slot type for categorizing meals by time of day
 */
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

/**
 * Week information for navigation and display
 */
export interface WeekInfo {
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** End date in YYYY-MM-DD format */
  endDate: string;
  /** Human-readable label (e.g., "Feb 2 - 8, 2026") */
  weekLabel: string;
}

/**
 * Planned meal data matching Convex schema
 */
export interface PlannedMeal {
  _id: Id<"plannedMeals">;
  userId: string;
  recipeId: Id<"recipes">;
  recipeName: string;
  recipeImage: string;
  prepTime: string;
  day: string;
  slot: MealSlot;
  createdAt: number;
  updatedAt: number;
}

/**
 * Recipe item for picker display
 */
export interface RecipePickerItem {
  id: Id<"recipes">;
  name: string;
  image: string;
  prepTime: string;
  category: MealSlot | "all";
}

/**
 * Day information for display
 */
export interface DayInfo {
  /** Full date in YYYY-MM-DD format */
  date: string;
  /** Short day name (e.g., "Sun", "Mon") */
  dayName: string;
  /** Date number (e.g., "2", "15") */
  dateNumber: string;
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this day has any planned meals */
  hasMeals: boolean;
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the main MealPlanner component
 */
export interface MealPlannerProps {
  /** Current week information for display */
  currentWeek: WeekInfo;
  /** Available meal slots */
  mealSlots: MealSlot[];
  /** Meals planned for the current week */
  plannedMeals: PlannedMeal[];
  /** Recipes available in the picker */
  recipePickerItems: RecipePickerItem[];
  /** Whether selection mode is active for generating shopping list */
  isSelectionMode?: boolean;
  /** Currently selected meal IDs (for shopping list generation) */
  selectedMealIds?: Id<"plannedMeals">[];
  /** Currently selected day in YYYY-MM-DD format */
  selectedDay: string;

  // Navigation
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onSelectDay?: (day: string) => void;

  // Meal actions
  onAddMeal?: (
    recipeId: Id<"recipes">,
    day: string,
    slot: MealSlot
  ) => Promise<void>;
  onMoveMeal?: (
    mealId: Id<"plannedMeals">,
    newDay: string,
    newSlot: MealSlot
  ) => Promise<void>;
  onCopyMeal?: (
    mealId: Id<"plannedMeals">,
    newDay: string,
    newSlot: MealSlot
  ) => Promise<void>;
  onRemoveMeal?: (mealId: Id<"plannedMeals">) => Promise<void>;
  onViewRecipe?: (recipeId: Id<"recipes">) => void;

  // Bulk actions
  onClearDay?: (day: string) => Promise<void>;
  onClearWeek?: () => Promise<void>;

  // Selection mode (for shopping list)
  onEnterSelectionMode?: () => void;
  onExitSelectionMode?: () => void;
  onToggleMealSelection?: (mealId: Id<"plannedMeals">) => void;
  onSelectAllDay?: (day: string) => void;
  onSelectAllWeek?: () => void;
  onGenerateShoppingList?: (mealIds: Id<"plannedMeals">[]) => void;
}

/**
 * Props for the WeekHeader component
 */
export interface WeekHeaderProps {
  /** Current week info for display */
  weekInfo: WeekInfo;
  /** Total number of planned meals this week */
  mealCount: number;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Number of selected meals */
  selectedCount: number;

  // Navigation actions
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;

  // Header actions
  onShopPress: () => void;
  onCancelSelection: () => void;
  onGenerateList: () => void;
  onClearWeek: () => void;
}

/**
 * Props for the DayStrip component
 */
export interface DayStripProps {
  /** Array of day information for the week */
  days: DayInfo[];
  /** Currently selected day in YYYY-MM-DD format */
  selectedDay: string;
  /** Called when a day is tapped */
  onSelectDay: (day: string) => void;
}

/**
 * Props for the MealSlotCard component
 */
export interface MealSlotCardProps {
  /** The planned meal (or null if empty) */
  meal: PlannedMeal | null;
  /** The day this slot belongs to (YYYY-MM-DD) */
  day: string;
  /** The slot type */
  slot: MealSlot;
  /** Whether this meal is selected (in selection mode) */
  isSelected?: boolean;
  /** Whether selection mode is active */
  isSelectionMode?: boolean;
  /** Whether this slot is a drag target */
  isDragTarget?: boolean;

  // Actions
  onTap?: () => void;
  onRemove?: () => void;
  onToggleSelect?: () => void;
  onViewRecipe?: () => void;
  onLongPress?: () => void;
}

/**
 * Props for the DayView component
 */
export interface DayViewProps {
  /** The date to display (YYYY-MM-DD) */
  day: string;
  /** Meals for this day */
  meals: PlannedMeal[];
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Selected meal IDs */
  selectedMealIds: Id<"plannedMeals">[];
  /** Whether snacks section is expanded */
  snacksExpanded: boolean;

  // Actions
  onSlotTap: (slot: MealSlot) => void;
  onMealRemove: (mealId: Id<"plannedMeals">) => void;
  onMealSelect: (mealId: Id<"plannedMeals">) => void;
  onViewRecipe: (recipeId: Id<"recipes">) => void;
  onMealLongPress: (mealId: Id<"plannedMeals">) => void;
  onToggleSnacks: () => void;
  onClearDay: () => void;
  onSelectAllDay: () => void;
}

/**
 * Props for the RecipePickerSheet component
 */
export interface RecipePickerSheetProps {
  /** Whether the sheet is visible */
  isVisible: boolean;
  /** Recipes available for selection */
  recipes: RecipePickerItem[];
  /** Target day for assignment */
  targetDay: string;
  /** Target slot for assignment */
  targetSlot: MealSlot;

  // Actions
  onSelectRecipe: (recipeId: Id<"recipes">) => void;
  onClose: () => void;
}

/**
 * Props for the RecipeListItem component
 */
export interface RecipeListItemProps {
  /** Recipe data to display */
  recipe: RecipePickerItem;
  /** Called when the item is pressed */
  onPress: () => void;
}

/**
 * Props for the CollapsibleSnacksSection component
 */
export interface CollapsibleSnacksSectionProps {
  /** Whether the section is expanded */
  isExpanded: boolean;
  /** Meal in the snacks slot (if any) */
  meal: PlannedMeal | null;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Whether the meal is selected */
  isSelected: boolean;
  /** Whether this slot is a drag target */
  isDragTarget?: boolean;

  // Actions
  onToggle: () => void;
  onSlotTap: () => void;
  onMealRemove: () => void;
  onMealSelect: () => void;
  onViewRecipe: () => void;
  onLongPress: () => void;
}

/**
 * Props for the OnboardingOverlay component
 */
export interface OnboardingOverlayProps {
  /** Whether to show the overlay */
  isVisible: boolean;
  /** Called when user dismisses the overlay */
  onDismiss: () => void;
}

/**
 * Props for the EmptyWeekState component
 */
export interface EmptyWeekStateProps {
  /** Called when user taps to add first meal */
  onAddMeal: () => void;
}

// =============================================================================
// Context Menu Types
// =============================================================================

/**
 * Context menu action type
 */
export type ContextMenuAction = "copy" | "move" | "remove";

/**
 * Props for context menu
 */
export interface ContextMenuProps {
  /** Whether the menu is visible */
  isVisible: boolean;
  /** The meal being acted upon */
  meal: PlannedMeal;
  /** Position for the menu */
  position: { x: number; y: number };

  // Actions
  onCopy: () => void;
  onMove: () => void;
  onRemove: () => void;
  onClose: () => void;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type for useWeekNavigation hook
 */
export interface UseWeekNavigationReturn {
  /** Current week information */
  currentWeek: WeekInfo;
  /** Currently selected day */
  selectedDay: string;
  /** Days in the current week */
  weekDays: DayInfo[];
  /** Navigate to previous week */
  goToPreviousWeek: () => void;
  /** Navigate to next week */
  goToNextWeek: () => void;
  /** Navigate to current week with today selected */
  goToToday: () => void;
  /** Select a specific day */
  selectDay: (day: string) => void;
}

// =============================================================================
// Slot Labels and Icons
// =============================================================================

/**
 * Human-readable labels for meal slots
 */
export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

/**
 * Order of meal slots for display
 */
export const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];

/**
 * Category filter options including 'all'
 */
export type CategoryFilter = MealSlot | "all";

/**
 * Labels for category filters
 */
export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
