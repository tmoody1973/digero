// =============================================================================
// Data Types
// =============================================================================

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

// =============================================================================
// Component Props
// =============================================================================

export interface ShoppingListsProps {
  /** All shopping lists (active and archived) */
  lists: ShoppingList[]
  /** Available item categories */
  categories: ItemCategory[]
  /** Called when user taps on a list to view details */
  onViewList?: (id: string) => void
  /** Called when user creates a new list */
  onCreateList?: () => void
  /** Called when user deletes a list */
  onDeleteList?: (id: string) => void
  /** Called when user wants to generate list from meal plan */
  onGenerateFromMealPlan?: () => void
}

export interface ShoppingListDetailProps {
  /** The shopping list to display */
  list: ShoppingList
  /** Available item categories for grouping */
  categories: ItemCategory[]
  /** Current view mode */
  viewMode: 'category' | 'recipe'
  /** Called when user toggles an item's checked state */
  onToggleItem?: (itemId: string) => void
  /** Called when user edits an item's quantity */
  onEditItem?: (itemId: string, quantity: number, unit: string) => void
  /** Called when user deletes an item */
  onDeleteItem?: (itemId: string) => void
  /** Called when user adds a custom item */
  onAddItem?: (name: string, quantity: number, unit: string, category: ItemCategory) => void
  /** Called when user changes the view mode */
  onViewModeChange?: (mode: 'category' | 'recipe') => void
  /** Called when user renames the list */
  onRenameList?: (name: string) => void
  /** Called when user shares the list */
  onShareList?: () => void
  /** Called when user navigates back */
  onBack?: () => void
}

export interface ShoppingItemProps {
  /** The item to display */
  item: ShoppingItem
  /** Whether the item is in edit mode */
  isEditing?: boolean
  /** Called when user toggles the checkbox */
  onToggle?: () => void
  /** Called when user saves edits */
  onEdit?: (quantity: number, unit: string) => void
  /** Called when user deletes the item */
  onDelete?: () => void
}

export interface AddItemFormProps {
  /** Available categories for the dropdown */
  categories: ItemCategory[]
  /** Called when user submits a new item */
  onAdd?: (name: string, quantity: number, unit: string, category: ItemCategory) => void
  /** Called when user cancels */
  onCancel?: () => void
}
