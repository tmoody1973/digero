/**
 * Shopping List Types
 *
 * Type definitions for the shopping list feature including
 * lists, items, categories, and component props.
 */

import { Id } from "@/convex/_generated/dataModel";

// =============================================================================
// Data Types
// =============================================================================

/**
 * Shopping list status
 */
export type ShoppingListStatus = "active" | "archived";

/**
 * Shopping item category for grocery organization
 */
export type ItemCategory =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Pantry"
  | "Bakery"
  | "Frozen"
  | "Beverages"
  | "Household";

/**
 * Shopping list item
 */
export interface ShoppingItem {
  _id: Id<"shoppingItems">;
  listId: Id<"shoppingLists">;
  name: string;
  quantity: number;
  unit: string;
  category: ItemCategory;
  checked: boolean;
  isCustom: boolean;
  recipeIds: Id<"recipes">[];
  recipeName?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Shopping list
 */
export interface ShoppingList {
  _id: Id<"shoppingLists">;
  userId: string;
  name: string;
  status: ShoppingListStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  totalItems: number;
  checkedItems: number;
}

/**
 * Shopping list with items
 */
export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingItem[];
}

/**
 * Sync status for offline support
 */
export type SyncStatus = "synced" | "pending" | "offline";

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the ShoppingLists main screen
 */
export interface ShoppingListsProps {
  lists: ShoppingList[];
  onViewList?: (id: Id<"shoppingLists">) => void;
  onCreateList?: () => void;
  onDeleteList?: (id: Id<"shoppingLists">) => void;
  onGenerateFromMealPlan?: () => void;
}

/**
 * Props for the ShoppingListCard component
 */
export interface ShoppingListCardProps {
  list: ShoppingList;
  onView?: () => void;
  onDelete?: () => void;
}

/**
 * Props for the ShoppingListDetail screen
 */
export interface ShoppingListDetailProps {
  list: ShoppingListWithItems;
  viewMode: "category" | "recipe";
  syncStatus: SyncStatus;
  onToggleItem?: (itemId: Id<"shoppingItems">) => void;
  onEditItem?: (itemId: Id<"shoppingItems">, quantity: number, unit: string) => void;
  onDeleteItem?: (itemId: Id<"shoppingItems">) => void;
  onAddItem?: (name: string, quantity: number, unit: string, category: ItemCategory) => void;
  onViewModeChange?: (mode: "category" | "recipe") => void;
  onRenameList?: (name: string) => void;
  onShareList?: () => void;
  onUpdateItemCategory?: (itemId: Id<"shoppingItems">, category: ItemCategory) => void;
  onBack?: () => void;
}

/**
 * Props for the ShoppingItemRow component
 */
export interface ShoppingItemRowProps {
  item: ShoppingItem;
  isEditing?: boolean;
  isReadOnly?: boolean;
  onToggle?: () => void;
  onEdit?: (quantity: number, unit: string) => void;
  onDelete?: () => void;
  onUpdateCategory?: (category: ItemCategory) => void;
}

/**
 * Props for the AddItemForm component
 */
export interface AddItemFormProps {
  categories: ItemCategory[];
  onAdd?: (name: string, quantity: number, unit: string, category: ItemCategory) => void;
  onCancel?: () => void;
}

/**
 * Props for the CategorySection component
 */
export interface CategorySectionProps {
  category: ItemCategory;
  items: ShoppingItem[];
  isReadOnly?: boolean;
  onToggleItem?: (itemId: Id<"shoppingItems">) => void;
  onEditItem?: (itemId: Id<"shoppingItems">, quantity: number, unit: string) => void;
  onDeleteItem?: (itemId: Id<"shoppingItems">) => void;
  onUpdateItemCategory?: (itemId: Id<"shoppingItems">, category: ItemCategory) => void;
}

/**
 * Props for the SyncStatusIndicator component
 */
export interface SyncStatusIndicatorProps {
  status: SyncStatus;
}

/**
 * Props for the MealSelectionModal component
 */
export interface MealSelectionModalProps {
  isVisible: boolean;
  meals: Array<{
    _id: Id<"plannedMeals">;
    recipeName: string;
    day: string;
    slot: string;
  }>;
  selectedMealIds: Id<"plannedMeals">[];
  onToggleMeal?: (mealId: Id<"plannedMeals">) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onGenerate?: () => void;
  onClose?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * All item categories in display order
 */
export const ITEM_CATEGORIES: ItemCategory[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Pantry",
  "Bakery",
  "Frozen",
  "Beverages",
  "Household",
];

/**
 * Category icons (for use with Lucide or similar)
 */
export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  Produce: "leaf",
  "Meat & Seafood": "beef",
  "Dairy & Eggs": "milk",
  Pantry: "package",
  Bakery: "croissant",
  Frozen: "snowflake",
  Beverages: "coffee",
  Household: "home",
};

/**
 * Sync status labels
 */
export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  synced: "Synced",
  pending: "Syncing...",
  offline: "Offline",
};
