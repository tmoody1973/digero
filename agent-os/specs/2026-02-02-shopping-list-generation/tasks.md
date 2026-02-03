# Task Breakdown: Shopping List Generation

## Overview
Total Tasks: 6 Task Groups with 46 Sub-tasks

This feature enables users to generate aggregated shopping lists from meal plan selections with intelligent ingredient combining, automatic category organization, and offline support for in-store use.

## Task List

### Database Layer

#### Task Group 1: Data Models and Schema
**Dependencies:** None

- [x] 1.0 Complete database layer for shopping lists
  - [x] 1.1 Write 2-8 focused tests for ShoppingList and ShoppingItem models
    - Test ShoppingList creation with required fields (userId, name, status)
    - Test ShoppingItem creation with ingredient data and recipe source tracking
    - Test category enum validation for ItemCategory values
    - Test status enum validation (active, archived)
    - Test relationship between ShoppingList and ShoppingItems
  - [x] 1.2 Create ShoppingList Convex schema
    - Fields: `_id`, `userId`, `name`, `status` (enum: active/archived), `createdAt`, `completedAt`
    - Define status as union literal type: `v.union(v.literal("active"), v.literal("archived"))`
    - Add index on `userId` for user-scoped queries
    - Add index on `status` for filtering active/archived lists
  - [x] 1.3 Create ShoppingItem Convex schema
    - Fields: `_id`, `listId`, `name`, `quantity`, `unit`, `category`, `checked`, `isCustom`, `recipeIds`, `recipeName`, `createdAt`, `updatedAt`
    - Category as union literal type for 8 values: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Frozen, Beverages, Household
    - `recipeIds` as array of recipe IDs for multi-source tracking
    - `recipeName` as optional string for display (null for multi-source items)
    - Add index on `listId` for fetching items by list
    - Add index on `checked` for filtering checked/unchecked items
  - [x] 1.4 Create category keyword mapping data
    - Define `categoryKeywords` object mapping keywords to ItemCategory values
    - Produce: vegetables, fruits, herbs, salad, lettuce, tomato, onion, garlic, etc.
    - Meat & Seafood: chicken, beef, pork, fish, salmon, shrimp, turkey, bacon, etc.
    - Dairy & Eggs: milk, cheese, yogurt, butter, eggs, cream, sour cream, etc.
    - Pantry: rice, pasta, flour, sugar, oil, vinegar, spices, canned, etc.
    - Bakery: bread, rolls, bagels, tortillas, pita, croissants, etc.
    - Frozen: frozen, ice cream, pizza, waffles, etc.
    - Beverages: juice, soda, water, coffee, tea, wine, beer, etc.
    - Household: paper, cleaning, soap, detergent, trash bags, etc.
  - [x] 1.5 Ensure database layer tests pass
    - Run ONLY the tests written in 1.1
    - Verify schema definitions are valid
    - Verify indexes are created correctly

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- ShoppingList and ShoppingItem schemas are defined correctly
- Category enum includes all 8 specified categories
- Indexes support efficient user-scoped and list-scoped queries
- Category keyword mapping covers common grocery items

---

### API Layer

#### Task Group 2: Convex Mutations and Queries
**Dependencies:** Task Group 1

- [x] 2.0 Complete Convex API layer for shopping lists
  - [x] 2.1 Write 2-8 focused tests for Convex functions
    - Test `createShoppingList` mutation creates list with correct defaults
    - Test `getShoppingLists` query returns user-scoped lists with items
    - Test `toggleItemChecked` mutation updates checked state
    - Test `addItem` mutation creates custom item with isCustom flag
    - Test `deleteShoppingList` mutation removes list and all items
  - [x] 2.2 Create shopping list queries
    - `getShoppingLists`: Return all lists for current user, split by status (active/archived)
    - `getShoppingListById`: Return single list with all items
    - `getShoppingListItems`: Return items for a specific list with recipe source data
    - Include item counts (total, checked) in list queries for progress display
  - [x] 2.3 Create shopping list mutations
    - `createShoppingList`: Create empty list with name, userId, status="active", createdAt
    - `updateShoppingList`: Update name or status
    - `deleteShoppingList`: Remove list and cascade delete all items
    - `archiveShoppingList`: Set status="archived" and completedAt timestamp
  - [x] 2.4 Create shopping item mutations
    - `addItem`: Create item with name, quantity, unit, category, isCustom flag
    - `updateItem`: Update quantity, unit, or category for an item
    - `toggleItemChecked`: Toggle checked state with optimistic update support
    - `deleteItem`: Remove single item from list
    - `updateItemCategory`: Manual category override for an item
  - [x] 2.5 Implement auto-archive logic
    - After each `toggleItemChecked` call, check if all items are checked
    - If checkedCount === totalCount and totalCount > 0, call `archiveShoppingList`
    - Set completedAt timestamp when archiving
  - [x] 2.6 Ensure API layer tests pass
    - Run ONLY the tests written in 2.1
    - Verify mutations create/update/delete correctly
    - Verify queries return expected data shapes

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- All CRUD operations work for lists and items
- Auto-archive triggers when 100% items are checked
- Queries are user-scoped for security
- Optimistic update patterns are followed for offline support

---

### Generation Logic

#### Task Group 3: Meal Plan Integration and Ingredient Aggregation
**Dependencies:** Task Group 2

- [x] 3.0 Complete shopping list generation from meal plans
  - [x] 3.1 Write 2-8 focused tests for generation logic
    - Test aggregation combines same ingredient/same unit correctly
    - Test unit conversion for compatible units (oz to lbs, tsp to tbsp)
    - Test incompatible units remain separate entries
    - Test category auto-assignment from ingredient name
    - Test source recipe tracking for multi-source items
  - [x] 3.2 Create unit conversion utility
    - Define conversion groups: weight (oz, lbs), volume (tsp, tbsp, cups)
    - Implement `convertUnit(quantity, fromUnit, toUnit)` function
    - Conversion rules: 16 oz = 1 lb, 3 tsp = 1 tbsp, 16 tbsp = 1 cup
    - Return null for incompatible conversions (weight to volume)
  - [x] 3.3 Create ingredient aggregation utility
    - Implement `aggregateIngredients(ingredientArrays)` function
    - Group by normalized ingredient name (lowercase, trimmed)
    - For same unit: sum quantities
    - For compatible units: convert to larger unit and sum
    - For incompatible units: create separate entries
    - Track source recipeIds array for each aggregated item
  - [x] 3.4 Create category assignment utility
    - Implement `assignCategory(ingredientName)` function
    - Match ingredient name against categoryKeywords from 1.4
    - Use fuzzy matching for partial keyword matches
    - Default to "Pantry" if no match found
  - [x] 3.5 Create generateFromMealPlan mutation
    - Accept array of mealIds (from meal planner selection)
    - Fetch recipes for each selected meal
    - Extract ingredients from all recipes
    - Call aggregation utility to combine duplicates
    - Call category assignment for each aggregated item
    - Create ShoppingList with default name "Week of [start date]"
    - Bulk create ShoppingItems from aggregated results
    - Return new list ID for navigation
  - [x] 3.6 Ensure generation logic tests pass
    - Run ONLY the tests written in 3.1
    - Verify aggregation produces expected combined quantities
    - Verify category assignment works correctly

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Same ingredients with same units are combined correctly
- Unit conversions follow specified rules
- Incompatible units remain as separate items
- Each item tracks its source recipes
- Categories are auto-assigned based on ingredient names

---

### Frontend Components

#### Task Group 4: Shopping Lists Overview Screen
**Dependencies:** Task Group 2

- [x] 4.0 Complete Shopping Lists overview screen
  - [x] 4.1 Write 2-8 focused tests for overview screen components
    - Test ShoppingLists component renders active and archived sections
    - Test quick action buttons trigger correct callbacks
    - Test list cards display progress correctly (X of Y items, percentage)
    - Test empty state renders when no lists exist
  - [x] 4.2 Implement ShoppingLists main component
    - Sticky header with "Shopping Lists" title and "New List" button (orange, top right)
    - Two quick action cards: "From Meal Plan" (orange gradient) and "Create Empty" (dashed border)
    - Follow patterns from existing `ShoppingLists.tsx` reference
    - Connect to `getShoppingLists` query for data
  - [x] 4.3 Implement active lists section
    - Section header "Active Lists"
    - Map active lists to ShoppingListCard components
    - Display list name, created date, progress ("8 of 24 items"), percentage
    - Navigate to detail view on card tap
  - [x] 4.4 Implement archived lists section
    - Section header "History"
    - Map archived lists to ShoppingListCard components with "Complete" green badge
    - Display completedAt date instead of created date
    - Navigate to read-only detail view on card tap
  - [x] 4.5 Implement empty state
    - Icon, title "No Shopping Lists", description text
    - Follow empty state pattern from reference component
  - [x] 4.6 Implement create empty list flow
    - "Create Empty" button triggers modal or inline input for list name
    - Call `createShoppingList` mutation with entered name
    - Navigate to new list detail view after creation
  - [x] 4.7 Ensure overview screen tests pass
    - Run ONLY the tests written in 4.1
    - Verify components render correctly
    - Verify navigation works

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Active and archived lists display in separate sections
- Progress percentages calculate correctly
- Quick action buttons work
- Empty state displays when no lists exist
- Matches visual design from mockups

---

#### Task Group 5: Shopping List Detail Screen
**Dependencies:** Task Groups 3 and 4

- [x] 5.0 Complete Shopping List detail screen
  - [x] 5.1 Write 2-8 focused tests for detail screen components
    - Test ShoppingListDetail renders items grouped by category
    - Test view toggle switches between "By Aisle" and "By Recipe" views
    - Test checkbox toggle updates item state
    - Test add item form creates new custom item
  - [x] 5.2 Implement detail screen header
    - Back arrow navigation
    - Editable title (tap to edit, inline input field)
    - Share button (top right)
    - Progress bar showing checked/total items and percentage
    - Orange fill for progress, green at 100%
  - [x] 5.3 Implement view toggle
    - Segmented control: "By Aisle" / "By Recipe"
    - Store toggle state in local component state
    - Persist toggle preference per list session
  - [x] 5.4 Implement "By Aisle" view
    - Group items by category using `itemsByCategory` reduce pattern
    - Category section headers with icon, name, and checked/total count ("3/7")
    - Use category icons (produce: leaf, meat: drumstick, dairy: milk, etc.)
    - Follow patterns from `ShoppingListDetail.tsx` reference
  - [x] 5.5 Implement "By Recipe" view
    - Group items by source recipe using `itemsByRecipe` reduce pattern
    - Section headers show recipe name and checked/total count
    - "Custom Items" section for manually added items (isCustom=true)
    - Items with multiple source recipes appear under first recipe with note
  - [x] 5.6 Implement ShoppingItemRow component
    - Circular checkbox with green fill when checked
    - Item name with strikethrough text when checked
    - Quantity and unit display
    - Recipe source attribution text below item name
    - "Custom" badge for isCustom items
    - Follow patterns from `ShoppingItemRow.tsx` reference
  - [x] 5.7 Implement inline edit mode for items
    - Group hover pattern showing edit/delete action buttons
    - Inline edit for quantity and unit with save/cancel buttons
    - Debounce edits before calling `updateItem` mutation
  - [x] 5.8 Implement add item form
    - "+ Add Item" button in header area
    - Inline form with fields: name, quantity, unit, category dropdown
    - Validate name is not empty before submission
    - Call `addItem` mutation with isCustom=true
    - Reset form after successful submission
  - [x] 5.9 Implement delete item functionality
    - Swipe to delete or delete button on hover
    - Call `deleteItem` mutation
    - Optimistic UI update for immediate feedback
  - [x] 5.10 Implement list sharing
    - Share button generates text export of list
    - Format: list name, then each item with checkbox, name, quantity, unit
    - Copy to clipboard with success toast
  - [x] 5.11 Implement read-only mode for archived lists
    - Disable all edit functionality when list status="archived"
    - Hide add item form and edit buttons
    - Display "Complete" badge in header
    - Keep items visible but non-interactive
  - [x] 5.12 Ensure detail screen tests pass
    - Run ONLY the tests written in 5.1
    - Verify views toggle correctly
    - Verify item interactions work

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Items display grouped by category or recipe based on toggle
- Checkbox toggles work with optimistic updates
- Add/edit/delete item flows work correctly
- Archived lists are read-only
- Matches visual design from mockups

---

#### Task Group 6: Date/Meal Selection and Offline Support
**Dependencies:** Task Group 5

- [x] 6.0 Complete meal plan selection and offline functionality
  - [x] 6.1 Write 2-8 focused tests for selection and offline features
    - Test meal selection UI allows selecting specific dates and meals
    - Test generate button calls mutation with selected meal IDs
    - Test optimistic updates work for toggle checked
    - Test sync status indicator reflects connection state
  - [x] 6.2 Implement date/meal selection UI
    - Modal or screen triggered by "From Meal Plan" button
    - Calendar view showing planned meals
    - Checkboxes for selecting specific dates or individual meals
    - Use selection patterns from `MealPlannerProps` reference (isSelectionMode, selectedMealIds)
    - "Generate List" button at bottom with count of selected items
  - [x] 6.3 Connect selection to generation
    - Pass selectedMealIds array to `generateFromMealPlan` mutation
    - Show loading state during generation
    - Navigate to new list detail view on success
    - Handle error state with user feedback
  - [x] 6.4 Implement optimistic updates for offline operations
    - Toggle checked: update UI immediately, sync in background
    - Add item: show item immediately with pending state
    - Edit item: show changes immediately, debounce sync
    - Delete item: remove from UI immediately, sync in background
    - Leverage Convex's built-in optimistic update patterns
  - [x] 6.5 Implement sync status indicator
    - Visual indicator showing sync state: synced (green), pending (orange), offline (gray)
    - Display in list detail header area
    - Update based on Convex connection state and pending mutations
  - [x] 6.6 Implement conflict resolution
    - Use last-write-wins strategy with timestamps
    - `updatedAt` field tracks latest modification time
    - Server resolves conflicts by keeping most recent change
  - [x] 6.7 Ensure selection and offline tests pass
    - Run ONLY the tests written in 6.1
    - Verify selection flow works end-to-end
    - Verify offline operations update UI correctly

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Users can select specific dates/meals for list generation
- Offline operations (toggle, add, edit, delete) work without network
- Sync status indicator shows current state
- Changes sync correctly when connection is restored

---

### Testing

#### Task Group 7: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the tests written by database layer (Task 1.1)
    - Review the tests written for Convex functions (Task 2.1)
    - Review the tests written for generation logic (Task 3.1)
    - Review the tests written for overview screen (Task 4.1)
    - Review the tests written for detail screen (Task 5.1)
    - Review the tests written for selection/offline (Task 6.1)
    - Total existing tests: approximately 12-48 tests
  - [x] 7.2 Analyze test coverage gaps for Shopping List feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Prioritize end-to-end workflows over unit test gaps
    - Key workflows to verify coverage:
      - Generate list from meal plan end-to-end
      - Complete shopping trip (check all items, auto-archive)
      - Offline usage and sync recovery
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points between generation, display, and offline
    - Possible gap tests:
      - End-to-end: Generate from meal plan, verify items appear correctly
      - End-to-end: Check all items, verify auto-archive triggers
      - Integration: Verify category override persists after toggle
      - Integration: Verify multi-source recipe tracking displays correctly
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to Shopping List Generation feature
    - Expected total: approximately 22-58 tests maximum
    - Verify all critical workflows pass
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical user workflows for this feature are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on Shopping List Generation requirements

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer (Task Group 1)** - Foundation for all other work
2. **API Layer (Task Group 2)** - Enables data operations
3. **Generation Logic (Task Group 3)** - Core feature functionality
4. **Shopping Lists Overview (Task Group 4)** - Entry point UI
5. **Shopping List Detail (Task Group 5)** - Main interaction screen
6. **Selection and Offline (Task Group 6)** - Complete user flow
7. **Test Review (Task Group 7)** - Verify completeness

## Dependencies Diagram

```
Task Group 1 (Database)
        |
        v
Task Group 2 (API)
        |
   +---------+
   |         |
   v         v
Task Group 3  Task Group 4
(Generation)  (Overview UI)
        |         |
        +---------+
              |
              v
        Task Group 5
        (Detail UI)
              |
              v
        Task Group 6
        (Selection + Offline)
              |
              v
        Task Group 7
        (Test Review)
```

## Reference Files

- **Type Definitions:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/types.ts`
- **Component References:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/components/`
- **Visual Mockups:**
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-lists.png`
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-list-detail.png`
- **Meal Planner Integration:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/types.ts`
