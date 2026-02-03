# Task Breakdown: Cookbook Organization

## Overview
Total Tasks: 7 Task Groups

This feature enables users to create named cookbooks and assign recipes to one or more cookbooks, with built-in quick access cookbooks (Favorites, Recently Added), flexible cover image options, and manual recipe ordering via drag-and-drop.

## Task List

### Backend Layer

#### Task Group 1: Data Models and Convex Schema
**Dependencies:** None

- [x] 1.0 Complete backend data layer
  - [x] 1.1 Write 4-6 focused tests for Cookbook and CookbookRecipe models
    - Test cookbook creation with required fields (name, coverUrl)
    - Test CookbookRecipe association creation with position field
    - Test built-in cookbook flag behavior
    - Test cookbook deletion (only non-built-in)
  - [x] 1.2 Create/update Convex schema for cookbooks table
    - Fields: id, name, description, coverUrl, recipeCount, isBuiltIn, createdAt, updatedAt
    - Add index on isBuiltIn for filtering built-in vs user cookbooks
    - Add index on userId for user-specific queries
  - [x] 1.3 Create/update Convex schema for cookbook_recipes junction table
    - Fields: cookbookId, recipeId, position, dateAdded
    - Composite index on (cookbookId, recipeId) for uniqueness
    - Index on cookbookId for fetching recipes in a cookbook
    - Index on recipeId for fetching cookbooks containing a recipe
  - [x] 1.4 Create seed data for built-in cookbooks
    - Create "Favorites" cookbook with isBuiltIn: true
    - Create "Recently Added" cookbook with isBuiltIn: true
    - Ensure built-in cookbooks exist on user initialization
  - [x] 1.5 Ensure data layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify schema migrations apply correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Convex schema compiles without errors
- Built-in cookbooks are created for new users
- Many-to-many relationship between cookbooks and recipes works correctly

---

#### Task Group 2: Convex Functions (Queries and Mutations)
**Dependencies:** Task Group 1

- [x] 2.0 Complete Convex functions layer
  - [x] 2.1 Write 5-8 focused tests for Convex functions
    - Test listCookbooks query returns both built-in and user cookbooks
    - Test getCookbookWithRecipes query returns recipes sorted by position
    - Test createCookbook mutation validates name and creates with defaults
    - Test addRecipeToCookbooks mutation handles multi-select
    - Test updateRecipePosition mutation updates position field
  - [x] 2.2 Create cookbook query functions
    - `listCookbooks`: Returns all user cookbooks plus built-in cookbooks
    - `getCookbook`: Returns single cookbook by ID
    - `getCookbookWithRecipes`: Returns cookbook with recipes array, sorted by specified field
    - `getCookbooksForRecipe`: Returns list of cookbooks containing a specific recipe
  - [x] 2.3 Create cookbook mutation functions
    - `createCookbook`: Creates new cookbook with name, description, coverUrl
    - `updateCookbook`: Updates name, description, coverUrl (not isBuiltIn)
    - `deleteCookbook`: Deletes cookbook and all CookbookRecipe associations (reject if isBuiltIn)
  - [x] 2.4 Create cookbook recipe mutation functions
    - `addRecipeToCookbook`: Creates CookbookRecipe with position at end
    - `addRecipeToCookbooks`: Handles multi-select (adds to multiple cookbooks at once)
    - `removeRecipeFromCookbook`: Deletes CookbookRecipe association
    - `removeRecipesFromCookbook`: Bulk removal for multi-select mode
    - `updateRecipePosition`: Updates position for drag-and-drop reordering
    - `reorderRecipes`: Batch update positions for drag-and-drop
  - [x] 2.5 Create built-in cookbook functions
    - `syncFavoritesCookbook`: Called when recipe favorite status changes
    - `getRecentlyAddedRecipes`: Returns 8 most recent recipes by createdAt
  - [x] 2.6 Ensure Convex function tests pass
    - Run ONLY the 5-8 tests written in 2.1
    - Verify all CRUD operations work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 5-8 tests written in 2.1 pass
- All queries return expected data shapes
- All mutations validate input and handle errors gracefully
- Built-in cookbook sync functions work correctly

---

### Frontend - Cookbook List View

#### Task Group 3: Cookbook List View Components
**Dependencies:** Task Group 2

- [x] 3.0 Complete Cookbook List View
  - [x] 3.1 Write 4-6 focused tests for list view components
    - Test Cookbooks component renders Quick Access and My Cookbooks sections
    - Test grid/list view toggle persists preference
    - Test empty state displays when no user cookbooks exist
    - Test CookbookCard renders correctly with all data
  - [x] 3.2 Implement Cookbooks.tsx main component
    - Header with "Cookbooks" title and cookbook count subtitle
    - Orange "New Cookbook" button in header
    - Grid/List toggle buttons with orange active state
    - Quick Access section with star icon for Favorites and Recently Added
    - My Cookbooks section with user-created cookbooks
    - Match layout from `product-plan/sections/cookbooks/cookbooks-list.png`
  - [x] 3.3 Implement CookbookCard.tsx component
    - Grid variant: Cover image with recipe count badge, name, description, updated date
    - List variant: Horizontal layout with thumbnail
    - Hover states reveal edit, share, delete action buttons
    - Built-in badge for Favorites and Recently Added
    - Hide delete button for built-in cookbooks
  - [x] 3.4 Implement empty state component
    - Icon, message, and CTA button to create first cookbook
    - Display when My Cookbooks section has no cookbooks
  - [x] 3.5 Implement "New Cookbook" dashed placeholder card
    - Dashed border style in grid view
    - Plus icon and "New Cookbook" label
    - Opens CreateCookbookModal on tap
  - [x] 3.6 Integrate with Convex queries
    - Connect listCookbooks query
    - Separate built-in and user cookbooks with filter function
    - Persist view mode preference in user settings
  - [x] 3.7 Ensure list view tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify components render correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- List view matches visual mockup
- Grid/list toggle works and persists
- Quick Access and My Cookbooks sections display correctly
- Empty state shows when appropriate

---

### Frontend - Cookbook Detail View

#### Task Group 4: Cookbook Detail View Components
**Dependencies:** Task Group 3

- [x] 4.0 Complete Cookbook Detail View
  - [x] 4.1 Write 4-6 focused tests for detail view components
    - Test CookbookDetail renders cover image header with gradient overlay
    - Test sort dropdown changes recipe ordering
    - Test multi-select mode toggles recipe selection
    - Test CookbookRecipeCard displays source type badge correctly
  - [x] 4.2 Implement CookbookDetail.tsx main component
    - Full-width cover image header with gradient overlay
    - Floating back button and share/edit buttons on cover
    - White info card overlapping cover with name, description, recipe count
    - Built-in badge if applicable
    - Match layout from `product-plan/sections/cookbooks/cookbook-detail.png`
  - [x] 4.3 Implement sticky controls bar
    - Sort dropdown: Manual Order, Date Added, Alphabetical
    - Grid/List toggle in control bar
    - Select link on right for entering multi-select mode
    - Sticky positioning when scrolling
  - [x] 4.4 Implement CookbookRecipeCard.tsx component
    - Grid and list view variants
    - Source type badges (YouTube, website, scanned, manual)
    - Drag handle element (horizontal lines icon) for reordering
    - Selection checkbox and overlay for multi-select mode
    - Remove button with hover reveal (hidden for built-in cookbooks)
  - [x] 4.5 Implement multi-select mode
    - selectedRecipes array state management
    - Select All / Deselect All toggle functionality
    - Bulk removal action for selected recipes
    - Exit multi-select mode on completion or cancel
  - [x] 4.6 Implement drag-and-drop recipe reordering
    - Use react-native-reanimated and react-native-gesture-handler
    - Drag handles visible on recipe cards
    - Only active when sort is set to "Manual Order"
    - Update positions via reorderRecipes mutation
  - [x] 4.7 Implement empty state for cookbook
    - CTA to add recipes when cookbook is empty
    - Different messaging for built-in vs custom cookbooks
  - [x] 4.8 Integrate with Convex queries and mutations
    - Connect getCookbookWithRecipes query
    - Connect removeRecipeFromCookbook and removeRecipesFromCookbook mutations
    - Connect reorderRecipes mutation
    - Persist sort preference per cookbook
  - [x] 4.9 Ensure detail view tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify components render correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Detail view matches visual mockup
- Sorting works for all three options
- Multi-select and bulk removal work correctly
- Drag-and-drop reordering persists positions
- Built-in cookbooks do not show remove/edit options

---

### Frontend - Modals

#### Task Group 5: Create/Edit Cookbook Modal
**Dependencies:** Task Group 3

- [x] 5.0 Complete Create/Edit Cookbook Modal
  - [x] 5.1 Write 3-5 focused tests for cookbook modal
    - Test form validation (name required, character limits)
    - Test cover image picker displays three options
    - Test modal submits correctly with all fields
  - [x] 5.2 Implement CreateCookbookModal.tsx component
    - Reuse modal pattern from RecipePreviewModal.tsx
    - Bottom sheet on mobile, centered modal on tablet
    - Sticky header with title and close button
    - Sticky footer with cancel and confirm buttons
  - [x] 5.3 Implement cookbook form fields
    - Name input (required, max 50 characters)
    - Description textarea (optional, max 200 characters)
    - Character count indicators
    - Validation error display
  - [x] 5.4 Implement CoverImagePicker component
    - Three tabs/options: Auto-populate, Upload, AI Generate
    - Auto-populate: Grid of recipe images from cookbook (placeholder for new)
    - Upload: Device photo picker via Expo ImagePicker
    - AI Generate: Button to trigger Gemini API generation
  - [x] 5.5 Implement AI cover image generation
    - Generate thematic food image based on cookbook name/description
    - Loading state during generation
    - Fallback to placeholder on error
    - Reuse existing Gemini API integration pattern
  - [x] 5.6 Implement EditCookbookModal.tsx component
    - Pre-populate form with existing cookbook data
    - Same form fields and cover image picker as create modal
    - Save button updates cookbook via updateCookbook mutation
  - [x] 5.7 Ensure modal tests pass
    - Run ONLY the 3-5 tests written in 5.1
    - Verify form validation works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 5.1 pass
- Modal displays correctly on mobile and tablet
- Form validation enforces required name and character limits
- All three cover image options work
- AI generation shows loading state and handles errors

---

#### Task Group 6: Add to Cookbook Modal
**Dependencies:** Task Group 2

- [x] 6.0 Complete Add to Cookbook Modal
  - [x] 6.1 Write 3-5 focused tests for add to cookbook modal
    - Test modal displays all user cookbooks with checkboxes
    - Test existing cookbook memberships are pre-checked
    - Test confirm applies changes to multiple cookbooks
  - [x] 6.2 Implement AddToCookbookModal.tsx component
    - Reuse modal pattern from RecipePreviewModal.tsx
    - Triggered from recipe detail view or recipe card context menu
    - Scrollable list of all user cookbooks
    - Exclude built-in cookbooks from list
  - [x] 6.3 Implement cookbook checkbox list
    - Each cookbook shows name, cover thumbnail, and checkbox
    - Visual indicator (checked) for cookbooks already containing this recipe
    - Multi-select for adding recipe to multiple cookbooks at once
  - [x] 6.4 Implement "Create New Cookbook" option
    - Dashed row at bottom of list
    - Opens CreateCookbookModal when tapped
    - After creation, returns to AddToCookbookModal with new cookbook selected
  - [x] 6.5 Implement confirm/cancel actions
    - Confirm button applies changes via addRecipeToCookbooks mutation
    - Cancel discards changes without saving
    - Close modal on success
  - [x] 6.6 Integrate trigger points
    - Add "Add to Cookbook" button to recipe detail view
    - Add "Add to Cookbook" option to recipe card context menu
  - [x] 6.7 Ensure add to cookbook modal tests pass
    - Run ONLY the 3-5 tests written in 6.1
    - Verify multi-select works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 6.1 pass
- Modal displays all user cookbooks correctly
- Existing memberships are pre-checked
- Multi-select works for adding to multiple cookbooks
- Create new cookbook flow works inline
- Trigger points work from recipe detail and card menu

---

### Testing & Integration

#### Task Group 7: Test Review and Integration
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review tests and verify integration
  - [x] 7.1 Review existing tests from Task Groups 1-6
    - Review 4-6 tests from backend data layer (Task 1.1)
    - Review 5-8 tests from Convex functions (Task 2.1)
    - Review 4-6 tests from list view (Task 3.1)
    - Review 4-6 tests from detail view (Task 4.1)
    - Review 3-5 tests from create/edit modal (Task 5.1)
    - Review 3-5 tests from add to cookbook modal (Task 6.1)
    - Total existing tests: approximately 24-36 tests
  - [x] 7.2 Analyze critical integration gaps
    - Identify end-to-end workflows lacking coverage
    - Focus on user journeys specific to cookbook organization
    - Prioritize: create cookbook -> add recipes -> reorder -> view
  - [x] 7.3 Write up to 8 additional integration tests if needed
    - Test full flow: create cookbook, add recipe from recipe detail, view in cookbook
    - Test built-in cookbook sync: favorite recipe appears in Favorites cookbook
    - Test Recently Added auto-populates with most recent recipes
    - Test drag-and-drop reorder persists and reflects in manual sort view
    - Test delete cookbook removes associations but not recipes
    - Maximum 8 additional tests to fill critical gaps only
  - [x] 7.4 Verify Delete Cookbook Confirmation
    - Confirmation dialog appears before deletion
    - Message clarifies "This won't delete your recipes, only the cookbook collection"
    - Delete option hidden for built-in cookbooks
  - [x] 7.5 Run all feature-specific tests
    - Run ONLY tests related to Cookbook Organization feature
    - Expected total: approximately 32-44 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 32-44 tests total)
- Critical user workflows are covered
- No more than 8 additional integration tests added
- Delete confirmation works correctly
- Built-in cookbook restrictions enforced throughout

---

## Execution Order

Recommended implementation sequence:

1. **Backend Data Layer** (Task Group 1) - Foundation schemas and models
2. **Convex Functions** (Task Group 2) - API layer for all operations
3. **Cookbook List View** (Task Group 3) - Main navigation entry point
4. **Cookbook Detail View** (Task Group 4) - View and manage cookbook contents
5. **Create/Edit Cookbook Modal** (Task Group 5) - Can be parallel with Task Group 4
6. **Add to Cookbook Modal** (Task Group 6) - Can be parallel with Task Groups 4-5
7. **Test Review and Integration** (Task Group 7) - Final verification

**Parallel Execution Opportunities:**
- Task Groups 5 and 6 can be developed in parallel after Task Group 3
- Task Group 4 can begin once Task Group 2 is complete

---

## Visual References

- Cookbook List View: `product-plan/sections/cookbooks/cookbooks-list.png`
- Cookbook Detail View: `product-plan/sections/cookbooks/cookbook-detail.png`
- Existing component patterns: `product-plan/sections/cookbooks/components/`

## Technical References

- Type definitions: `product-plan/sections/cookbooks/types.ts`
- Core data model: `product-plan/data-model/types.ts`
- Sample data: `product-plan/sections/cookbooks/data.json`
- Test specifications: `product-plan/sections/cookbooks/tests.md`
