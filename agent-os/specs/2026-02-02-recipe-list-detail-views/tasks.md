# Task Breakdown: Recipe List and Detail Views

## Overview
Total Tasks: 44 subtasks across 6 task groups

**Feature Summary:** Enable users to browse, search, filter, and view their saved recipes in a mobile-friendly interface with Cook Mode for hands-free step-by-step cooking guidance.

**Tech Stack:** React Native + Expo (SDK 52+), Convex backend, Clerk authentication, NativeWind/Tailwind CSS, React Native Reanimated

## Task List

### Convex Backend Layer

#### Task Group 1: Recipe Queries and Mutations
**Dependencies:** Recipe Data Model (Feature #2), User Authentication (Feature #1)

- [x] 1.0 Complete Convex backend layer for recipe operations
  - [x] 1.1 Write 4-6 focused tests for Convex functions
    - Test paginated recipe query returns correct page size and cursor
    - Test recipe query filters by source type correctly
    - Test recipe query searches by title/ingredient name
    - Test recipe query sorts by each sort option
    - Test favorite toggle mutation updates recipe correctly
    - Test delete mutation removes recipe and handles authorization
  - [x] 1.2 Create paginated recipes query (`recipes.list`)
    - Accept pagination cursor and limit (default 20)
    - Filter by userId (from Clerk auth context)
    - Support sourceType filter parameter (youtube, website, scanned, manual)
    - Support search parameter with text matching on title and ingredient names
    - Support sort parameter: mostRecent, alphabetical, cookTime, calories, recentlyCooked
    - Return recipes array with pagination metadata (cursor, hasMore)
  - [x] 1.3 Create single recipe query (`recipes.get`)
    - Accept recipeId parameter
    - Validate user owns recipe (authorization check)
    - Return full recipe with ingredients, instructions, nutrition
    - Include computed fields: totalTime, scaledIngredients
  - [x] 1.4 Create favorite toggle mutation (`recipes.toggleFavorite`)
    - Accept recipeId parameter
    - Toggle isFavorite boolean field
    - Return updated favorite status
  - [x] 1.5 Create delete recipe mutation (`recipes.delete`)
    - Accept recipeId parameter
    - Validate user owns recipe before deletion
    - Perform soft delete or hard delete per data model design
    - Return success confirmation
  - [x] 1.6 Ensure Convex backend tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify all query and mutation functions work correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Paginated query returns correct data with all filter/sort options
- Favorite toggle updates database correctly
- Delete mutation removes recipe with proper authorization
- All queries are user-scoped via Clerk authentication

---

### Recipe List View Components

#### Task Group 2: Recipe List Screen and Card Components
**Dependencies:** Task Group 1

- [x] 2.0 Complete recipe list view with search, filter, and sort
  - [x] 2.1 Write 4-6 focused tests for list view components
    - Test RecipeCard renders grid and list variants correctly
    - Test search input triggers debounced query with 300ms delay
    - Test filter pills update active filter and trigger re-query
    - Test sort selection updates sort option and persists preference
    - Test infinite scroll loads more recipes when scrolling
    - Test favorite toggle on card triggers mutation with optimistic update
  - [x] 2.2 Create RecipeCard component with dual-mode rendering
    - Grid mode: 4:3 aspect ratio image, gradient overlay, source badge (color-coded), time badge, title, servings, calories
    - List mode: 80px square thumbnail, source icon badge, title, cookbook attribution (if scanned), time and servings row
    - Favorite heart icon in top-right with optimistic toggle
    - Use Reanimated for press/hover scaling effects
    - Accept onPress, onFavoriteToggle, viewMode props
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeCard.tsx`
  - [x] 2.3 Create SourceBadge component
    - Accept sourceType prop (youtube, website, scanned, manual)
    - Color mapping: YouTube (red-500), Website (blue-500), Scanned (amber-500), Manual (green-500)
    - Include icon (from lucide-react-native) and label
    - Support compact variant (icon only) for list view
  - [x] 2.4 Create SearchBar component
    - Stone-50 background, rounded-xl corners
    - Search icon on left, clear X button on right (visible when text present)
    - Debounced input (300ms) using lodash debounce or custom hook
    - Placeholder text: "Search recipes..."
    - onSearchChange callback with debounced value
  - [x] 2.5 Create FilterPills horizontal scrollable component
    - Options: All, YouTube, Website, Scanned, Manual
    - Active pill uses orange accent (#f97316) background
    - Horizontal ScrollView with hidden scrollbar
    - onFilterChange callback
  - [x] 2.6 Create SortSelector component
    - Button/chip showing current sort option
    - Bottom sheet with sort options on press
    - Options: Most Recent (default), Alphabetical (A-Z), Cook Time, Calories, Most Recently Cooked
    - Persist selection to AsyncStorage
    - onSortChange callback
  - [x] 2.7 Create ViewModeToggle component
    - Grid and list icons with toggle state
    - Orange accent for active mode
    - Persist preference to AsyncStorage
    - onViewModeChange callback
  - [x] 2.8 Create RecipeListScreen with FlatList integration
    - Use Convex usePaginatedQuery for infinite scroll
    - Render RecipeCard items in grid (2 columns) or list layout
    - Header: SearchBar, FilterPills row, ViewModeToggle + SortSelector row
    - Recipe count display: "X recipes" or "X recipes matching 'search'"
    - Pull-to-refresh with RefreshControl
    - Floating action button (FAB) for add recipe menu
    - Navigate to RecipeDetailScreen on card press
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeList.tsx`
  - [x] 2.9 Create EmptyState component for no results
    - Icon and message for empty collection
    - Different message when filters/search active: "No recipes match your search"
    - Optional action button to clear filters or add recipe
  - [x] 2.10 Create SkeletonRecipeCard component
    - Match RecipeCard dimensions for grid and list modes
    - Shimmer animation effect using Reanimated
    - Display while loading initial data
  - [x] 2.11 Ensure recipe list view tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify list renders, filters work, and infinite scroll functions
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Recipe cards render correctly in both grid and list modes
- Search filters results with 300ms debounce
- Source filters show correct recipes
- Sort options persist and apply correctly
- Infinite scroll loads more recipes
- Favorites toggle with optimistic UI update
- Visual design matches mockup: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-list.png`

---

### Recipe Detail View Components

#### Task Group 3: Recipe Detail Screen
**Dependencies:** Task Group 1

- [x] 3.0 Complete recipe detail view with all sections
  - [x] 3.1 Write 4-6 focused tests for detail view components
    - Test RecipeDetailScreen renders recipe data correctly
    - Test serving adjuster scales ingredient quantities correctly
    - Test ingredient selection mode toggles checkboxes
    - Test "Add to Shopping List" triggers callback with correct data
    - Test YouTube video embed renders for YouTube source recipes
    - Test delete button shows confirmation dialog
  - [x] 3.2 Create RecipeDetailScreen layout
    - Hero image (16:10 aspect ratio) with gradient overlay
    - Overlaid buttons: back (left), share + edit (right) with white/90 background, backdrop blur
    - Source badge on image
    - Title and cookbook attribution for scanned recipes
    - Use ScrollView for content sections
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeDetail.tsx`
  - [x] 3.3 Create QuickStatsBar component
    - Horizontal layout with dividers
    - Icons for total time (orange), prep time, cook time
    - Format time values (e.g., "45 min", "1h 30m")
  - [x] 3.4 Create YouTubeEmbed component
    - Conditionally render when recipe.sourceType === 'youtube'
    - Use react-native-youtube-iframe library
    - Extract video ID from sourceUrl
    - Maintain 16:9 aspect ratio
    - Handle loading and error states
  - [x] 3.5 Create NutritionGrid component
    - 4-column grid layout
    - Display: Calories (orange), Protein (red), Carbs (amber), Fat (green)
    - Values with unit labels (g, kcal)
    - Styled badges matching mockup
  - [x] 3.6 Create ServingAdjuster component
    - +/- buttons with current serving count display
    - Minimum 1 serving, maximum 20 servings (configurable)
    - onServingsChange callback
  - [x] 3.7 Create IngredientsSection component
    - White card container with border
    - ServingAdjuster in header
    - Auto-scale quantities: scaledQty = originalQty * (newServings / originalServings)
    - Monospace quantities in orange
    - "Add All to Shopping List" button
    - "Select Items" button to enable checkbox mode
    - When selecting: checkbox per ingredient, count of selected items
    - Smart shopping list UX: direct add if single list, bottom sheet picker if multiple
  - [x] 3.8 Create InstructionsSection component
    - Numbered steps with orange circles (rounded-full bg-orange-100)
    - White card container
    - Step text with proper line height for readability
  - [x] 3.9 Create DietaryConversionButtons component
    - "Convert to Vegan" and "Convert to Vegetarian" buttons
    - Styled with border, hover state transitioning to orange
    - UI only - triggers onConvertToVegan/onConvertToVegetarian callbacks
  - [x] 3.10 Create ActionButtons section
    - "Add to Meal Plan" button - triggers onAddToMealPlan callback
    - "Add to Cookbook" button - triggers onAddToCookbook callback
    - "Delete Recipe" button - shows confirmation dialog, then triggers onDelete
    - Favorite heart toggle in header
  - [x] 3.11 Create ShoppingListPicker bottom sheet
    - List of user's shopping lists with radio selection
    - "Create New List" option at bottom
    - Remember last-used list preference
    - onSelectList callback
  - [x] 3.12 Create SuccessToast component for shopping list feedback
    - "Added X ingredients to [List Name]"
    - "Undo" action (available for 5 seconds)
    - "View List" action to navigate
  - [x] 3.13 Ensure recipe detail view tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify detail screen renders, serving scaler works, shopping list actions function
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Recipe detail renders all sections correctly
- Serving adjuster scales ingredients mathematically correctly
- Ingredient selection and shopping list actions work
- YouTube videos embed for YouTube source recipes
- Delete shows confirmation before executing
- Visual design matches mockup: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-detail.png`

---

### Cook Mode Feature

#### Task Group 4: Cook Mode Step-by-Step View
**Dependencies:** Task Group 3

- [x] 4.0 Complete Cook Mode with step navigation and timers
  - [x] 4.1 Write 4-6 focused tests for Cook Mode
    - Test CookModeScreen renders current step with large text
    - Test horizontal swipe navigates between steps
    - Test time pattern detection finds "X minutes" in step text
    - Test timer countdown decrements correctly
    - Test timer completion triggers audio/vibration alert
    - Test screen stays awake while in Cook Mode
  - [x] 4.2 Create CookModeScreen full-screen layout
    - Exit button in top-left corner to return to detail view
    - Step counter in header: "Step X of Y"
    - Progress indicator bar below header
    - Large step text area (24px+ font size)
    - Timer button area at bottom (when timer detected)
    - Keep screen awake using expo-keep-awake
  - [x] 4.3 Create StepPager component
    - Use react-native-pager-view or horizontal FlatList
    - Swipe left/right to navigate steps
    - Large, readable text display
    - Current step highlighted
  - [x] 4.4 Create StepProgressBar component
    - Horizontal bar showing progress through all steps
    - Orange fill for completed portion
    - Step dots/markers optional
  - [x] 4.5 Create time pattern detection utility
    - Regex patterns for: "X minutes", "X mins", "X min", "X hours", "X hour", "X hr", combined formats
    - Extract numeric value and unit
    - Return total seconds for timer
    - Handle multiple time references in single step
  - [x] 4.6 Create TimerButton component
    - Display detected time (e.g., "Set 10 minute timer")
    - Tap to start countdown
    - Show countdown display when active
  - [x] 4.7 Create CountdownTimer component
    - Display remaining time in MM:SS or HH:MM:SS format
    - Start, pause, reset controls
    - Audio alert on completion using expo-av
    - Vibration alert on completion using Vibration API
    - Visual indication when complete (flashing, color change)
  - [x] 4.8 Create CookModeToggle button for detail view
    - "Start Cooking" or "Cook Mode" button in detail view header
    - Navigate to CookModeScreen with recipe data
  - [x] 4.9 Ensure Cook Mode tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify step navigation, timers, and alerts function correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- Cook Mode displays steps with large, readable text
- Swipe navigation works between steps
- Time patterns are detected in step text
- Timers count down and alert on completion
- Screen stays awake during Cook Mode
- Exit returns to standard detail view

---

### Offline Support and Gestures

#### Task Group 5: Offline Caching and Swipe-to-Delete
**Dependencies:** Task Groups 2, 3

- [x] 5.0 Complete offline support and gesture interactions
  - [x] 5.1 Write 4-6 focused tests for offline and gestures
    - Test recipe detail is cached to AsyncStorage/MMKV on view
    - Test cached recipes are displayed when offline
    - Test LRU eviction removes oldest recipe when cache exceeds limit
    - Test swipe-left reveals delete action on recipe card
    - Test offline indicator banner shows when network unavailable
    - Test queued mutations sync when network restored
  - [x] 5.2 Create RecipeCache service
    - Store viewed recipe details in AsyncStorage or MMKV
    - LRU cache with configurable limit (default 50 recipes)
    - Methods: cacheRecipe, getCachedRecipe, clearCache, getCacheSize
    - Store timestamp for LRU ordering
    - Evict oldest entries when limit exceeded
  - [x] 5.3 Create OfflineSyncQueue service
    - Queue mutations (favorites, deletes) when offline
    - Store in AsyncStorage with operation type and payload
    - Process queue when network restored
    - Handle conflicts (e.g., deleted recipe on server)
  - [x] 5.4 Create NetworkStatusProvider context
    - Monitor network connectivity using NetInfo
    - Provide isOnline, isOffline status to components
    - Trigger sync queue processing on reconnection
  - [x] 5.5 Create OfflineBanner component
    - Display at top of screen when offline
    - "You're offline. Showing cached data."
    - Dismissable or auto-hide when online
  - [x] 5.6 Create CachedBadge component
    - Small indicator on recipe cards for cached recipes
    - Show when viewing offline or as indicator of offline availability
  - [x] 5.7 Implement swipe-to-delete on RecipeCard
    - Use react-native-gesture-handler Swipeable component
    - Swipe left reveals red delete button with trash icon
    - Tap delete button shows confirmation dialog
    - On confirm, trigger delete mutation
  - [x] 5.8 Create DeleteConfirmationDialog component
    - Title: "Delete Recipe?"
    - Message: "This action cannot be undone."
    - Buttons: Cancel (secondary), Delete (destructive red)
    - Use Alert.alert or custom modal
  - [x] 5.9 Integrate offline support into RecipeDetailScreen
    - Cache recipe on successful load
    - Load from cache if network request fails
    - Show cached badge/indicator when viewing cached data
    - Pull-to-refresh attempts fresh fetch
  - [x] 5.10 Ensure offline and gesture tests pass
    - Run ONLY the 4-6 tests written in 5.1
    - Verify caching, offline display, and swipe delete work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 5.1 pass
- Viewed recipes are cached for offline access
- LRU eviction keeps cache within size limit
- Offline indicator shows when network unavailable
- Queued mutations sync when back online
- Swipe-to-delete works with confirmation dialog

---

### Testing and Integration

#### Task Group 6: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps only
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review the 4-6 tests written by backend tasks (Task 1.1)
    - Review the 4-6 tests written by list view tasks (Task 2.1)
    - Review the 4-6 tests written by detail view tasks (Task 3.1)
    - Review the 4-6 tests written by Cook Mode tasks (Task 4.1)
    - Review the 4-6 tests written by offline tasks (Task 5.1)
    - Total existing tests: approximately 20-30 tests
  - [x] 6.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows lacking coverage
    - Focus ONLY on gaps related to Recipe List and Detail Views
    - Prioritize end-to-end user flows over unit test gaps
    - Do NOT assess entire application test coverage
  - [x] 6.3 Write up to 10 additional strategic tests maximum
    - End-to-end flow: Open list, search, filter, tap card, view detail
    - End-to-end flow: Add ingredients to shopping list from detail view
    - End-to-end flow: Enter Cook Mode, navigate steps, use timer
    - Integration: Favorite toggle persists across list and detail views
    - Integration: Delete from swipe syncs with Convex and removes from list
    - Edge case (if critical): Empty recipe collection state
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to Recipe List and Detail Views
    - Expected total: approximately 30-40 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 30-40 tests total)
- Critical user workflows for this feature are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on Recipe List and Detail Views requirements

---

## Execution Order

Recommended implementation sequence:

1. **Convex Backend Layer (Task Group 1)** - Foundation for data access
2. **Recipe List View (Task Group 2)** - Primary user interface
3. **Recipe Detail View (Task Group 3)** - Secondary view, depends on navigation from list
4. **Cook Mode (Task Group 4)** - Feature enhancement, depends on detail view
5. **Offline Support and Gestures (Task Group 5)** - Cross-cutting concerns
6. **Test Review and Gap Analysis (Task Group 6)** - Final validation

**Parallel Execution Opportunities:**
- Task Groups 2 and 3 can be developed in parallel after Task Group 1 completes
- Task Group 4 and Task Group 5 can be developed in parallel after their respective dependencies complete

---

## Visual Assets Reference

- Recipe List mockup: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-list.png`
- Recipe Detail mockup: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-detail.png`
- Reference components: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/`

---

## Integration Callbacks Summary

The following callbacks should be stubbed/implemented to integrate with other features:

| Callback | Trigger | Data Passed |
|----------|---------|-------------|
| `onAddToShoppingList` | Ingredient selection complete | `{ listId, ingredients[] }` |
| `onAddToMealPlan` | "Add to Meal Plan" button | `{ recipeId }` |
| `onAddToCookbook` | "Add to Cookbook" button | `{ recipeId }` |
| `onConvertToVegan` | Dietary conversion button | `{ recipeId }` |
| `onConvertToVegetarian` | Dietary conversion button | `{ recipeId }` |
| `onEdit` | Edit button in detail view | `{ recipeId }` |
| `onAddRecipe` | FAB in list view | Navigation to add recipe flow |
