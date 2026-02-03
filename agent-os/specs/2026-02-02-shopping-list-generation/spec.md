# Specification: Shopping List Generation

## Goal

Enable users to generate aggregated shopping lists from meal plan selections with intelligent ingredient combining, automatic category organization, and offline support for in-store use.

## User Stories

- As a meal planner, I want to generate a shopping list from my planned meals so that I have all ingredients in one organized place
- As a grocery shopper, I want to check off items while shopping (even offline) so that I can track my progress in the store

## Specific Requirements

**List Generation from Meal Plan**
- User taps "From Meal Plan" button to open date/meal selection UI
- Selection UI displays calendar with planned meals for choosing specific dates or individual meals
- System aggregates ingredients from all selected recipes into a single list
- Default list name follows "Week of [start date]" pattern
- User navigates to new list detail view after generation

**Ingredient Aggregation Logic**
- Same ingredient with same unit: combine quantities (e.g., "2 cloves garlic" + "3 cloves garlic" = "5 cloves garlic")
- Same ingredient with compatible units: convert and combine (oz to lbs, tsp to tbsp to cups)
- Incompatible units remain separate with clear context (e.g., "1 cup spinach" vs "2 bags spinach")
- Each item maintains array of source recipe IDs for multi-source tracking
- Unit conversion rules: 16 oz = 1 lb, 3 tsp = 1 tbsp, 16 tbsp = 1 cup

**Category Auto-Assignment**
- Match ingredient names against predefined keyword-based category mapping
- Default categories: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Frozen, Beverages, Household
- Users can manually recategorize items by tapping; override persists for that item
- Store category as enum on the ShoppingItem data model

**Manual Item Additions**
- Inline add item form with fields: name, quantity, unit, category dropdown
- Custom items display "Custom" badge to distinguish from recipe-sourced items
- Custom items have null recipeId and isCustom flag set to true
- Form validates that name is not empty before allowing submission

**Check Off Items**
- Checkbox toggle works immediately with optimistic UI update
- Checked items show strikethrough text and muted styling
- Items remain in list (not hidden) when checked for easy unchecking
- Checked state persists locally and syncs when online

**Auto-Archive on Completion**
- When checkedItems equals totalItems (100% complete), list automatically moves to archived status
- Set completedAt timestamp when archiving
- Display archived lists in "History" section with "Complete" badge
- No confirmation dialog - immediate archive behavior
- Archived lists are read-only (view but not edit)

**Offline Support**
- Leverage Convex optimistic updates for immediate UI response
- Critical offline operations: toggle checked, edit quantity/unit, add items, delete items
- Online-only operations: generate from meal plan, share list, initial sync
- Visual indicator shows sync status (synced/pending/offline)
- Conflict resolution uses last-write-wins with timestamp

**View Toggle and Organization**
- "By Aisle" view groups items by category with category icons
- "By Recipe" view groups items by source recipe name (Custom Items for manual additions)
- Toggle persists per list session
- Each group shows checked/total count (e.g., "3/7")

**List Management**
- Create empty list manually via "Create Empty" button
- Rename list by tapping title (inline edit with input field)
- Delete list via swipe or menu action
- Share list generates text export (copy to clipboard)

## Visual Design

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-lists.png`**
- Header with "Shopping Lists" title and "New List" orange button (top right)
- Two quick action cards: "From Meal Plan" (orange gradient) and "Create Empty" (dashed border)
- Active lists section showing list cards with name, created date, progress (e.g., "8 of 24 items"), percentage
- History section for archived lists with "Complete" green badge
- Bottom navigation bar with Shop tab highlighted

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-list-detail.png`**
- Sticky header with back arrow, editable title, "Share" button
- Progress bar showing checked/total items and percentage (orange fill, green at 100%)
- View toggle: "By Aisle" / "By Recipe" segmented control
- "+ Add Item" button in header area
- Category sections with icon, category name, and checked/total count
- Item rows: circular checkbox, item name, quantity/unit, recipe source text, "Custom" badge where applicable
- Green checkmark fill for checked items with strikethrough text

## Existing Code to Leverage

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/types.ts`**
- ShoppingList and ShoppingItem interfaces define complete data structure
- ItemCategory type enum with all 8 category values
- Props interfaces for all components with callback patterns established
- Use these exact type definitions for Convex schema and component props

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/components/ShoppingLists.tsx`**
- Main list overview screen with active/archived filtering logic
- Quick action buttons layout with gradient styling
- Empty state design pattern with icon, title, and description
- Follow the sticky header pattern with backdrop blur

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/components/ShoppingListDetail.tsx`**
- Category grouping logic with itemsByCategory reduce pattern
- Recipe grouping logic with itemsByRecipe reduce pattern
- Inline rename functionality with edit state management
- Add item form with validation and state reset after submission

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/components/ShoppingItemRow.tsx`**
- Checkbox toggle with green checked state styling
- Inline edit mode for quantity/unit with save/cancel buttons
- Group hover pattern for showing edit/delete action buttons
- Recipe source attribution text below item name

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/types.ts`**
- PlannedMeal interface provides recipeId, recipeName for integration
- MealPlannerProps includes onGenerateShoppingList callback accepting mealIds array
- Use isSelectionMode and selectedMealIds patterns for date/meal selection UI

## Out of Scope

- Price estimates and budget tracking
- Store-specific aisle numbers or location mapping
- Barcode scanning for item lookup or addition
- Voice input for adding items
- Real-time collaborative editing between users
- Instacart or delivery service integration
- Nutrition information display on shopping list
- Recipe scaling before list generation
- Pantry inventory tracking ("I already have this" feature)
- Learning from user category overrides to improve future auto-assignment
