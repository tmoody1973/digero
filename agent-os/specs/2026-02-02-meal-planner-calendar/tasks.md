# Task Breakdown: Meal Planner Calendar

## Overview
Total Tasks: 37

This feature implements a weekly meal planner calendar where users can assign recipes to specific days and meal slots (breakfast, lunch, dinner, snacks) using both tap-to-assign and drag-and-drop interactions, optimized for mobile-first use with React Native and Expo.

## Task List

### Backend Layer

#### Task Group 1: Data Models and Convex Schema
**Dependencies:** None

- [x] 1.0 Complete Convex schema and data layer
  - [x] 1.1 Write 3-5 focused tests for PlannedMeal model functionality
    - Test creating a planned meal with required fields (recipeId, day, slot, userId)
    - Test querying planned meals by week date range
    - Test deleting a planned meal
    - Test moving a meal to a different slot/day
  - [x] 1.2 Create PlannedMeal schema in Convex
    - Fields: id, userId, recipeId, recipeName, recipeImage, prepTime, day (date string YYYY-MM-DD), slot (breakfast|lunch|dinner|snacks), createdAt, updatedAt
    - Add index on userId + day for efficient weekly queries
    - Add index on userId + slot for filtering by meal type
  - [x] 1.3 Create TypeScript types for meal planner
    - Adapt existing types from `product-plan/sections/meal-planner/types.ts`
    - MealSlot enum: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
    - WeekInfo type: startDate, endDate, weekLabel
    - PlannedMeal type matching Convex schema
    - RecipePickerItem type for recipe selection
  - [x] 1.4 Ensure data layer tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify schema compiles without errors

**Acceptance Criteria:**
- PlannedMeal schema defined with proper indexes
- TypeScript types exported and importable
- Tests for core CRUD operations pass

#### Task Group 2: Convex Query and Mutation Functions
**Dependencies:** Task Group 1

- [x] 2.0 Complete Convex API functions
  - [x] 2.1 Write 4-6 focused tests for Convex functions
    - Test getMealsByWeek returns correct meals for date range
    - Test addMealToSlot creates meal with correct data
    - Test removeMeal deletes the specified meal
    - Test moveMeal updates day and slot correctly
    - Test copyMeal creates duplicate with new day/slot
  - [x] 2.2 Implement getMealsByWeek query
    - Accept startDate and endDate parameters
    - Filter by authenticated userId using Clerk
    - Return array of PlannedMeal objects sorted by day then slot
  - [x] 2.3 Implement addMealToSlot mutation
    - Accept recipeId, recipeName, recipeImage, prepTime, day, slot
    - Automatically set userId from Clerk auth context
    - Return created PlannedMeal id
  - [x] 2.4 Implement removeMeal mutation
    - Accept mealId parameter
    - Verify ownership before deletion
    - Return success boolean
  - [x] 2.5 Implement moveMeal mutation
    - Accept mealId, newDay, newSlot parameters
    - Update existing meal record in place
    - Return updated PlannedMeal
  - [x] 2.6 Implement copyMeal mutation
    - Accept mealId, targetDay, targetSlot parameters
    - Create new PlannedMeal with same recipe data
    - Return new PlannedMeal id
  - [x] 2.7 Implement clearDay mutation
    - Accept day parameter
    - Delete all meals for user on specified day
    - Return count of deleted meals
  - [x] 2.8 Implement clearWeek mutation
    - Accept startDate and endDate parameters
    - Delete all meals for user in date range
    - Return count of deleted meals
  - [x] 2.9 Ensure Convex function tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify all mutations work with authenticated user

**Acceptance Criteria:**
- All query and mutation functions implemented
- User authentication enforced on all functions
- Tests for core operations pass
- Optimistic updates supported for mutations

### Calendar UI Layer

#### Task Group 3: Week Navigation and Day Strip Components
**Dependencies:** Task Group 2

- [x] 3.0 Complete week navigation UI
  - [x] 3.1 Write 3-4 focused tests for navigation components
    - Test WeekHeader displays correct week label format
    - Test week navigation arrows update date range
    - Test Today button jumps to current week
    - Test DayStrip highlights today with orange fill
  - [x] 3.2 Create WeekHeader component
    - Display week label (e.g., "Feb 2 - 8, 2026")
    - Previous/Next week arrow buttons
    - Orange "Today" pill button to jump to current week
    - Reuse patterns from `MealPlanner.tsx` reference
  - [x] 3.3 Create DayStrip component
    - Horizontal row of 7 circular date indicators
    - Today highlighted with orange fill (#f97316)
    - Selected day shows selection ring
    - Dot indicators on days with planned meals
    - Tap any day to jump to that day
    - Minimum 48x48pt tap targets per accessibility requirements
  - [x] 3.4 Create useWeekNavigation hook
    - Manage current week startDate and endDate
    - Provide goToPreviousWeek, goToNextWeek, goToToday functions
    - Calculate weekLabel from date range
    - Persist selected week across component remounts
  - [x] 3.5 Ensure week navigation tests pass
    - Run ONLY the 3-4 tests written in 3.1

**Acceptance Criteria:**
- Week navigation arrows work correctly
- Today button highlights current day
- Day strip shows meal indicators
- All tap targets meet 48x48pt minimum

#### Task Group 4: Meal Slot Cards and Day View
**Dependencies:** Task Group 3

- [x] 4.0 Complete meal slot card UI
  - [x] 4.1 Write 4-5 focused tests for meal slot components
    - Test empty slot renders dashed border with plus icon
    - Test filled slot displays recipe thumbnail, name, and prep time
    - Test remove button appears and works on filled slots
    - Test selection checkbox appears in selection mode
    - Test tapping empty slot triggers onAddMeal callback
  - [x] 4.2 Create MealSlotCard component
    - Adapt from `MealSlotCard.tsx` reference
    - Empty state: dashed border with centered plus icon
    - Filled state: recipe thumbnail, name, prep time, X remove button
    - Selection mode: checkbox overlay for shopping list selection
    - Long-press on filled slot shows context menu (Copy/Move)
    - Props: meal, slot, isSelected, isSelectionMode, onTap, onRemove, onSelect
  - [x] 4.3 Create DayView component
    - Display current day header (e.g., "Wednesday, Feb 5")
    - Vertically stack 4 MealSlotCard components (breakfast, lunch, dinner, snacks)
    - Support horizontal swipe gestures for day navigation
    - Use slot labels and icons from reference (slotLabels, slotIcons)
  - [x] 4.4 Create CollapsibleSnacksSection component
    - Collapsed by default with chevron indicator
    - Expand/collapse on tap
    - Persist visibility preference in AsyncStorage
    - Animate expand/collapse with react-native-reanimated
  - [x] 4.5 Ensure meal slot tests pass
    - Run ONLY the 4-5 tests written in 4.1

**Acceptance Criteria:**
- Empty and filled slot states render correctly
- Remove button works on filled slots
- Snacks section collapses and expands
- Day swipe navigation works smoothly

### Recipe Picker and Assignment

#### Task Group 5: Recipe Picker Bottom Sheet
**Dependencies:** Task Group 4

- [x] 5.0 Complete recipe picker UI
  - [x] 5.1 Write 3-4 focused tests for recipe picker
    - Test bottom sheet opens when tapping empty slot
    - Test search input filters recipe list
    - Test category pills filter by meal type
    - Test selecting a recipe calls onSelectRecipe callback
  - [x] 5.2 Create RecipePickerSheet component
    - Use react-native-bottom-sheet for modal presentation
    - Adapt from `RecipePicker.tsx` reference
    - Search input at top with clear button
    - Category filter pills: All, Breakfast, Lunch, Dinner, Snacks
    - Scrollable recipe list with thumbnail, name, prep time
    - Close on recipe selection or swipe down
  - [x] 5.3 Create RecipeListItem component
    - Display recipe thumbnail (lazy loaded), name, prep time
    - Single responsibility: render one recipe option
    - Touch feedback on press
    - Prepare for drag capability (Task Group 6)
  - [x] 5.4 Implement recipe search and filtering logic
    - Filter by name (case-insensitive substring match)
    - Filter by category/meal type
    - Combine search and category filters
    - Use existing recipe data from Convex
  - [x] 5.5 Ensure recipe picker tests pass
    - Run ONLY the 3-4 tests written in 5.1

**Acceptance Criteria:**
- Bottom sheet opens smoothly from empty slot tap
- Search filters recipe list in real-time
- Category pills filter by meal type
- Selecting recipe assigns to tapped slot

#### Task Group 6: Drag-and-Drop Interaction
**Dependencies:** Task Group 5

- [x] 6.0 Complete drag-and-drop functionality
  - [x] 6.1 Write 3-4 focused tests for drag-and-drop
    - Test dragging recipe from picker creates ghost image
    - Test valid drop targets highlight with orange border
    - Test dropping on slot assigns recipe
    - Test dragging existing meal to new slot moves it
  - [x] 6.2 Implement draggable recipe items in picker
    - Use react-native-gesture-handler for gesture detection
    - Use react-native-reanimated for drag animations
    - Ghost image follows finger during drag
    - Bottom sheet stays open during drag
  - [x] 6.3 Implement drop target highlighting
    - MealSlotCard accepts isDragTarget prop
    - Orange border highlight (#f97316) when recipe dragged over
    - Clear highlight when drag leaves slot
  - [x] 6.4 Implement drag gesture handling
    - Detect drag start, move, and end events
    - Calculate which slot is under finger position
    - On drop: call addMealToSlot or moveMeal mutation
    - Support reduced motion preference (disable animations)
  - [x] 6.5 Implement move existing meals via drag
    - Long-press filled slot to initiate drag
    - Show ghost of meal card during drag
    - Drop on different slot to move meal
    - Optimistic UI update with rollback on error
  - [x] 6.6 Ensure drag-and-drop tests pass
    - Run ONLY the 3-4 tests written in 6.1

**Acceptance Criteria:**
- Drag from picker assigns recipe to slot
- Drag existing meal moves it to new slot
- Drop targets highlight during drag
- Tap-to-assign remains as accessibility fallback

### Shopping List Integration

#### Task Group 7: Selection Mode and Shopping List Generation
**Dependencies:** Task Group 6

- [x] 7.0 Complete shopping list integration
  - [x] 7.1 Write 3-4 focused tests for selection mode
    - Test Shop button toggles selection mode
    - Test selecting meals updates selection count in header
    - Test Select All Day selects all meals for that day
    - Test Generate List navigates with selected meal IDs
  - [x] 7.2 Implement selection mode toggle
    - Green "Shop" button in header enters selection mode
    - Cancel button exits selection mode
    - Header shows selection count (e.g., "5 selected")
    - Checkboxes appear on all filled meal slots
  - [x] 7.3 Implement meal selection logic
    - Track selected meal IDs in component state
    - Individual checkbox toggles single meal
    - "Select all" link on day header selects full day
    - "Select whole week" button selects all meals
  - [x] 7.4 Implement Generate List navigation
    - "Generate List" button enabled when selections > 0
    - Navigate to Shopping List screen via expo-router
    - Pass selected meal IDs as route parameters
    - Follow pattern from `onGenerateFromMealPlan` reference
  - [x] 7.5 Ensure selection mode tests pass
    - Run ONLY the 3-4 tests written in 7.1

**Acceptance Criteria:**
- Selection mode toggles on/off cleanly
- Selection count updates in real-time
- Select all day/week functions work
- Navigation passes meal IDs to shopping list

### Bulk Actions and Polish

#### Task Group 8: Clear Actions, Context Menu, and Empty State
**Dependencies:** Task Group 7

- [x] 8.0 Complete bulk actions and polish
  - [x] 8.1 Write 3-4 focused tests for bulk actions
    - Test Clear Day removes all meals for that day
    - Test Clear Week shows confirmation dialog
    - Test context menu shows Copy and Move options
    - Test onboarding overlay appears for first-time users
  - [x] 8.2 Implement Clear Day functionality
    - "Clear" link on each day header
    - Call clearDay mutation for the day
    - No confirmation needed (single day)
    - Optimistic UI update
  - [x] 8.3 Implement Clear Week functionality
    - "Clear Week" button in header
    - Show confirmation dialog before clearing
    - Use platform Alert or custom modal
    - Call clearWeek mutation for entire week
  - [x] 8.4 Implement context menu for filled slots
    - Long-press reveals context menu
    - Options: Copy, Move, Remove
    - Copy opens day/slot picker, creates duplicate
    - Move opens day/slot picker, relocates meal
  - [x] 8.5 Create OnboardingOverlay component
    - Show for first-time users with no planned meals
    - Display hints: "Tap a slot to add a recipe" and "Drag recipes from the picker"
    - "Got it" button dismisses overlay
    - Track completion in AsyncStorage
    - Do not show after user adds first meal
  - [x] 8.6 Create EmptyWeekState component
    - Display when week has no planned meals
    - Friendly illustration and message
    - Call-to-action to add first meal
  - [x] 8.7 Ensure bulk actions tests pass
    - Run ONLY the 3-4 tests written in 8.1

**Acceptance Criteria:**
- Clear day removes meals without confirmation
- Clear week requires confirmation
- Context menu provides Copy/Move options
- Onboarding shows for new users only

### Testing

#### Task Group 9: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-8

- [x] 9.0 Review existing tests and fill critical gaps only
  - [x] 9.1 Review tests from Task Groups 1-8
    - Review the 3-5 tests written by backend (Task 1.1)
    - Review the 4-6 tests written by backend (Task 2.1)
    - Review the 3-4 tests written by calendar UI (Task 3.1)
    - Review the 4-5 tests written by calendar UI (Task 4.1)
    - Review the 3-4 tests written by recipe picker (Task 5.1)
    - Review the 3-4 tests written by drag-drop (Task 6.1)
    - Review the 3-4 tests written by shopping (Task 7.1)
    - Review the 3-4 tests written by bulk actions (Task 8.1)
    - Total existing tests: approximately 26-36 tests
  - [x] 9.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to meal planner feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [x] 9.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points (e.g., drag from picker to slot end-to-end)
    - Test week navigation combined with meal display
    - Test selection mode to navigation flow
    - Skip edge cases, performance tests unless business-critical
  - [x] 9.4 Run feature-specific tests only
    - Run ONLY tests related to meal planner feature
    - Expected total: approximately 36-46 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 36-46 tests total)
- Critical user workflows for meal planning are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on meal planner feature requirements

## Execution Order

Recommended implementation sequence:

1. **Backend Layer - Data Models** (Task Group 1)
   - Define Convex schema and TypeScript types first
   - Provides foundation for all other work

2. **Backend Layer - API Functions** (Task Group 2)
   - Implement Convex queries and mutations
   - Enables frontend development with real data

3. **Calendar UI - Week Navigation** (Task Group 3)
   - Build week header and day strip navigation
   - Core navigation pattern needed for all views

4. **Calendar UI - Meal Slots** (Task Group 4)
   - Build meal slot cards and day view
   - Primary UI for displaying and interacting with meals

5. **Recipe Picker** (Task Group 5)
   - Build bottom sheet recipe picker
   - Enables tap-to-assign workflow

6. **Drag-and-Drop** (Task Group 6)
   - Add drag-and-drop capability
   - Enhances recipe assignment and meal moving

7. **Shopping Integration** (Task Group 7)
   - Implement selection mode and list generation
   - Connects meal planner to shopping list feature

8. **Bulk Actions and Polish** (Task Group 8)
   - Add clear actions, context menu, onboarding
   - Completes feature with polish items

9. **Test Review** (Task Group 9)
   - Review all tests and fill gaps
   - Final quality assurance

## Key Dependencies

```
Task Group 1 (Schema)
    |
    v
Task Group 2 (API)
    |
    v
Task Group 3 (Navigation) --> Task Group 4 (Slots) --> Task Group 5 (Picker)
                                                            |
                                                            v
                                                      Task Group 6 (Drag-Drop)
                                                            |
                                                            v
                                                      Task Group 7 (Shopping)
                                                            |
                                                            v
                                                      Task Group 8 (Polish)
                                                            |
                                                            v
                                                      Task Group 9 (Testing)
```

## Reference Files

- **Visual Design:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/meal-planner.png`
- **Reference Components:**
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/MealPlanner.tsx`
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/MealSlotCard.tsx`
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/RecipePicker.tsx`
- **Types:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/types.ts`
- **Sample Data:** `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/data.json`

## Technical Notes

- **Frontend Stack:** React Native with Expo SDK 52+
- **Backend:** Convex (real-time database, serverless functions)
- **Navigation:** expo-router (file-based routing)
- **Authentication:** Clerk (user-scoped meal plans)
- **Gestures:** react-native-gesture-handler
- **Animations:** react-native-reanimated
- **Bottom Sheet:** react-native-bottom-sheet
- **Persistence:** AsyncStorage for user preferences (snacks visibility, onboarding completion)
