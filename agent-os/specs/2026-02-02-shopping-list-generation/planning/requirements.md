# Spec Requirements: Shopping List Generation

## Initial Description

Generate aggregated shopping list from selected meal plan dates. Combine duplicate ingredients, organize by category (produce, dairy, meat, pantry), and allow manual additions.

**Source:** Product Roadmap - Week 2: Scanning, Planning, and Monetization (Feature #9)

**Effort Estimate:** Medium (M) - 1 week

**Priority:** High - Completes the meal planning workflow

## Requirements Discussion

### First Round Questions

**Q1:** I see the mockup shows "From Meal Plan - Generate from this week" as the primary action. I assume clicking this button opens a date/meal selection UI before generating, rather than immediately generating for the entire current week. Is that correct, or should it generate instantly for the current week's planned meals?
**Answer:** "From Meal Plan" button opens date/meal selection UI before generating.

**Q2:** When aggregating ingredients from multiple recipes (e.g., "2 cloves garlic" from Recipe A + "3 cloves garlic" from Recipe B), I assume the system should combine these into "5 cloves garlic" with a note showing source recipes. Is that correct? What about ingredients with different units (e.g., "1 cup spinach" vs "2 bags spinach") - should these remain separate or attempt unit conversion?
**Answer:** Use best practices for UX - recommendation provided below.

**Q3:** The mockup shows items organized by store aisle categories (Produce, Meat & Seafood, etc.). I assume these categories should be auto-assigned based on ingredient name matching against a predefined category mapping. Is that correct? Should users be able to recategorize items manually?
**Answer:** Yes - auto-assign categories AND allow users to manually recategorize.

**Q4:** The README mentions "auto-archive completed lists." I assume a list automatically archives when 100% of items are checked off. Is that correct, or should there be a manual confirmation step?
**Answer:** Yes - automatically archive when 100% of items are checked.

**Q5:** The mockup shows lists named "Week of Feb 2" and "Weekend BBQ." When generating from a meal plan, I assume the default name should follow the "Week of [date]" pattern. Is that correct? Should users be prompted to customize the name during generation or only after?
**Answer:** Yes - default to "Week of [date]" pattern.

**Q6:** Given this is a mobile app for use in grocery stores (potentially with poor connectivity), I assume checked/unchecked state should work offline and sync when connectivity returns. Is offline functionality in scope for the MVP, or should we defer this to post-hackathon?
**Answer:** Yes - include offline support for MVP (critical for in-store use).

**Q7:** What should we explicitly exclude? For example, are any of these out of scope: price estimates, store-specific aisle mapping, barcode scanning, voice input for adding items, or list sharing between users?
**Answer:** No exclusions - include all features mentioned.

### Existing Code to Reference

**Similar Features Identified:**
- UI Components: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/components/`
  - `ShoppingLists.tsx` - Lists overview with active/archived sections
  - `ShoppingListCard.tsx` - Individual list card with progress indicator
  - `ShoppingListDetail.tsx` - Detail view with category/recipe grouping, add item form
  - `ShoppingItemRow.tsx` - Item row with checkbox, edit, delete actions
- Type Definitions: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/types.ts`
- Sample Data: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/data.json`

**Integration Dependencies:**
- Meal Planner Calendar feature (for date/meal selection integration)
- Recipe data model (for fetching ingredient lists during generation)

### Follow-up Questions

No follow-up questions needed - answers were comprehensive.

## Visual Assets

### Files Provided:
Visual mockups were located in the product-plan folder (not the spec's visuals folder):
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-lists.png`: Shopping lists overview screen showing "From Meal Plan" and "Create Empty" quick action buttons, active lists section with progress percentages, and archived history section
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/shopping-lists/shopping-list-detail.png`: Detail view showing "By Aisle" / "By Recipe" toggle, items grouped by category with icons, checkboxes with green checked state, quantity/unit display, recipe source attribution, and "Custom" badges for manually added items

### Visual Insights:
- **Design patterns:** Orange accent color for primary actions, stone/neutral color palette, rounded corners (2xl), progress bars with percentage
- **User flow:** Two entry points for list creation (from meal plan vs empty), toggle between category and recipe views
- **UI components:** Sticky header with back navigation and share button, inline add item form, swipe/tap actions on items
- **Fidelity level:** High-fidelity mockups ready for implementation

## Requirements Summary

### Functional Requirements

#### List Generation Flow
1. User taps "From Meal Plan" button on Shopping Lists screen
2. Date/meal selection UI appears showing calendar with planned meals
3. User selects specific dates and/or individual meals to include
4. System aggregates ingredients from selected recipes
5. System applies duplicate combining and category assignment
6. New shopping list is created with default name "Week of [start date]"
7. User is navigated to the new list's detail view

#### Ingredient Aggregation (Best Practice Recommendation)

**Duplicate Combining Strategy:**
- **Same ingredient, same unit:** Combine quantities (e.g., "2 cloves garlic" + "3 cloves garlic" = "5 cloves garlic")
- **Same ingredient, compatible units:** Convert to common unit and combine (e.g., "1 lb chicken" + "8 oz chicken" = "1.5 lbs chicken")
- **Same ingredient, incompatible units:** Keep separate with clear labeling (e.g., "1 cup spinach (for smoothie)" and "2 bags spinach (for salad)" remain separate)

**Unit Conversion Rules:**
- Weight: oz <-> lbs (16 oz = 1 lb)
- Volume: tsp <-> tbsp <-> cups (3 tsp = 1 tbsp, 16 tbsp = 1 cup)
- Count units: Keep as-is (pieces, cloves, heads, etc.)
- Mixed types: Never convert between weight and volume

**Source Tracking:**
- Each item maintains array of source recipe IDs/names
- Display shows "from Recipe A, Recipe B" when item comes from multiple sources
- Enables "By Recipe" view to show which items belong to which recipes

#### Category Management
- **Auto-assignment:** Match ingredient names against predefined category mapping (keyword-based)
- **Default categories:** Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Frozen, Beverages, Household
- **Manual override:** Users can tap to change category; override persists for that item
- **Learning (post-MVP):** System could learn from user overrides to improve future auto-assignment

#### Item Management
- Check/uncheck items (persists immediately)
- Edit quantity and unit inline
- Delete items with confirmation
- Add custom items with name, quantity, unit, and category selection
- Custom items display "Custom" badge

#### List Management
- View all lists (active and archived sections)
- Create empty list manually
- Generate list from meal plan
- Rename list (tap title to edit)
- Delete list (swipe or menu action)
- Share list (generates shareable link or text export)

#### Auto-Archive Behavior
- When checkedItems equals totalItems (100% complete), list automatically moves to "archived" status
- completedAt timestamp is set
- List appears in "History" section with "Complete" badge
- No confirmation dialog - immediate archive
- Users can view archived lists but not edit them

#### Offline Support Strategy

**Local-First Architecture:**
- All shopping list data stored locally using Convex's offline capabilities
- Checked/unchecked state changes work immediately without network
- Manual item additions work offline
- Quantity/unit edits work offline

**Sync Behavior:**
- Changes queued locally when offline
- Automatic sync when connectivity restored
- Conflict resolution: Last-write-wins with timestamp
- Visual indicator shows sync status (synced/pending/offline)

**Critical Offline Operations:**
- Toggle item checked state
- Edit item quantity/unit
- Add custom items
- Delete items

**Online-Only Operations:**
- Generate list from meal plan (requires recipe data fetch)
- Share list (requires link generation)
- Initial list load (first sync)

### MVP vs Post-Hackathon Feature Prioritization

Given the 2-week hackathon timeline with 1 week allocated to this feature, the following prioritization is recommended:

**MVP (Week 1 - Must Have):**
- List generation from meal plan with date selection
- Ingredient aggregation with duplicate combining
- Auto-categorization with manual override
- Check/uncheck items with offline support
- Add/edit/delete items
- Auto-archive on completion
- By Aisle / By Recipe view toggle
- Basic list sharing (copy as text)

**Post-Hackathon (Future Enhancements):**
- Price estimates (requires store API integration, significant scope)
- Store-specific aisle mapping (requires store database, user location)
- Barcode scanning (requires camera integration, product database)
- Voice input for adding items (requires speech-to-text integration)
- Real-time collaborative lists (requires presence system)
- Instacart integration (already noted as post-MVP in roadmap)

**Rationale:** The core value proposition is generating organized shopping lists from meal plans with offline support. Advanced features like price estimates and barcode scanning are valuable but add significant complexity and external dependencies that risk the hackathon deadline.

### Scope Boundaries

**In Scope:**
- Generate shopping lists from meal plan selections
- Aggregate and combine duplicate ingredients intelligently
- Organize items by category (auto-assign with manual override)
- Toggle between category view and recipe view
- Check off items while shopping (with offline support)
- Add custom items not from recipes
- Edit quantities and units
- Auto-archive completed lists
- Basic sharing (text/link export)
- Rename and delete lists

**Out of Scope (Deferred to Post-Hackathon):**
- Price estimates and budget tracking
- Store-specific aisle numbers/mapping
- Barcode scanning for item lookup
- Voice input for adding items
- Real-time collaborative editing
- Instacart/delivery integration
- Nutrition information on shopping list
- Recipe scaling before generation
- Pantry inventory tracking ("I already have this")

### Technical Considerations

**Data Model (Convex):**
- `shoppingLists` table with user relationship, status enum, timestamps
- `shoppingItems` embedded or separate table with recipe foreign key
- Category stored as enum matching predefined list
- Source recipes stored as array for multi-source tracking

**Offline Implementation:**
- Leverage Convex's built-in optimistic updates
- Local state management for immediate UI response
- Queue mutations for sync when online
- Consider expo-sqlite for additional offline persistence if needed

**Integration Points:**
- Meal Planner: Query planned meals for date range
- Recipes: Fetch ingredient lists from recipe IDs
- Authentication: User-scoped queries and mutations

**Performance Considerations:**
- Lazy load archived lists (don't fetch item details until viewed)
- Paginate items for very large lists
- Debounce quantity edits before syncing

**Existing Patterns to Follow:**
- UI components use Tailwind-style classes (stone color palette, orange accents)
- Props interfaces defined in separate types.ts file
- Components are functional with hooks for local state
- Callback props for all user actions (onToggle, onEdit, onDelete, etc.)
