# Spec Requirements: Meal Planner Calendar

## Initial Description

Create weekly calendar view where users can assign recipes to specific days and meals (breakfast, lunch, dinner). Support drag-and-drop or tap-to-assign interaction.

**Source:** Product Roadmap - Week 2: Scanning, Planning, and Monetization (Feature #8)
**Effort Estimate:** Medium (M) - 1 week
**Priority:** High - Core planning feature

## Requirements Discussion

### First Round Questions

**Q1:** The mockup shows week navigation (previous/next arrows and "Today" button). Should users be able to navigate to past weeks to view historical meal plans, or should we limit navigation to current and future weeks only?
**Answer:** Yes - allow viewing past weeks for reference (read-only or editable).

**Q2:** The mockup hint says "Tap a recipe to add, or drag to a slot." Given the 2-week timeline and React Native complexity, should we prioritize tap-to-assign first and defer drag-and-drop to post-MVP?
**Answer:** Implement BOTH tap-to-assign AND drag-and-drop.

**Q3:** The current mockup shows a desktop-style 7-column grid with sidebar. For mobile, should we use a vertical day-by-day scroll rather than trying to fit 7 columns?
**Answer:** Use best practices for UX (recommendation requested).

**Q4:** The types.ts includes `onMoveMeal` and `onCopyMeal` handlers. Should we support copying a planned meal to another slot? For the hackathon MVP, should this be deferred, or is it critical for the core workflow?
**Answer:** Yes - support copying meals between slots.

**Q5:** The types include 'snacks' as a MealSlot, but some days in the mockup appear to skip it. Should snacks always be shown, or should it be a collapsible/optional section?
**Answer:** Collapsible and optional.

**Q6:** The mockup shows a "Shop" button that enters selection mode. Should the generated list be for the entire selected week, or only the specific meals the user checks?
**Answer:** Both - generate for entire week OR specific selected meals.

**Q7:** When a user first opens Meal Planner with no planned meals, should we show an onboarding hint or tutorial?
**Answer:** Yes - show onboarding hint/tutorial for first-time users.

### Existing Code to Reference

**Similar Features Identified:**
- Component: `MealPlanner.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/MealPlanner.tsx`
- Component: `MealSlotCard.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/MealSlotCard.tsx`
- Component: `RecipePicker.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/components/RecipePicker.tsx`
- Types: `types.ts` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/types.ts`
- Sample Data: `data.json` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/data.json`

**Notes:** These are web/React mockup components that demonstrate the intended UI patterns. They need to be adapted to React Native with Expo, but provide a clear reference for:
- Week navigation with previous/next/today buttons
- Meal slot grid layout with 4 slots (breakfast, lunch, dinner, snacks)
- Recipe picker sidebar with search and category filtering
- Selection mode for shopping list generation
- Clear day/week functionality

### Follow-up Questions

No additional follow-up questions were required.

## Visual Assets

### Files Provided:
- `meal-planner.png` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/meal-planner.png`

### Visual Insights:
- **Layout:** Vertical day-by-day calendar (Sunday through Saturday) with each day showing date and meal slots
- **Header:** "Meal Plan" title with meal count, "Shop" button (green), "Clear Week" option, and recipe picker toggle
- **Week Navigation:** Left/right arrows with week label (e.g., "Feb 2 - 8, 2026") and orange "Today" pill button
- **Day Headers:** Day abbreviation (Sun, Mon, etc.) with date number; today highlighted in orange
- **Meal Slots:** Four rows per day - Breakfast, Lunch, Dinner, Snacks - each with icon
- **Filled Slots:** Recipe thumbnail, name, and prep time; X button to remove on hover
- **Empty Slots:** Dashed border with plus icon; hover state shows orange highlight
- **Recipe Picker Sidebar:** Search bar, category filter pills (All/Breakfast/Lunch/Dinner/Snacks), scrollable recipe list with thumbnails
- **Color Scheme:** Orange accent color (#f97316), stone/neutral backgrounds, dark mode support indicated
- **Fidelity Level:** High-fidelity mockup showing production-ready design

### Additional Visual Notes:
No additional visual files were provided in the spec's visuals folder.

## Mobile Layout Recommendation

Based on UX best practices for mobile meal planning apps, I recommend a **Hybrid Approach** combining vertical scrolling with horizontal day navigation:

### Primary View: Vertical Day Focus
- **Single Day View** as the primary mobile experience
- Show one day at a time with all 4 meal slots vertically stacked
- Large, touch-friendly meal slot cards (minimum 48px tap targets)
- Swipe horizontally between days (left = previous day, right = next day)

### Secondary View: Week Overview
- **Mini Week Strip** at the top showing all 7 days as small circular date indicators
- Tap any day in the strip to jump directly to that day
- Today highlighted with orange fill; days with planned meals show a dot indicator
- Current selected day shows selection ring

### Navigation Pattern
```
+------------------------------------------+
|  < Feb 2 - 8, 2026        Today   Shop   |
+------------------------------------------+
|  [S] [M] [T] [W] [T] [F] [S]            |  <- Week strip (tappable)
|   2   3   4   5   6   7   8              |
|       *   *       *                      |  <- Dots = has meals
+------------------------------------------+
|          Wednesday, Feb 5                |  <- Current day header
+------------------------------------------+
|  Breakfast                               |
|  +------------------------------------+  |
|  | [img] Overnight Oats     25 min   X|  |
|  +------------------------------------+  |
+------------------------------------------+
|  Lunch                                   |
|  +------------------------------------+  |
|  |         [+] Add Recipe            |  |  <- Empty slot
|  +------------------------------------+  |
+------------------------------------------+
|  Dinner                                  |
|  +------------------------------------+  |
|  | [img] Grilled Salmon     40 min   X|  |
|  +------------------------------------+  |
+------------------------------------------+
|  v Snacks (tap to expand)                |  <- Collapsible
+------------------------------------------+
```

### Rationale
1. **Touch-Friendly:** Single-day focus allows large tap targets and easy drag-and-drop
2. **Discoverability:** Week strip provides quick navigation without hiding context
3. **Gesture Support:** Horizontal swipe between days feels natural on mobile
4. **Scalability:** Works on small phones (iPhone SE) through large phones (iPhone Pro Max)
5. **Consistency:** Matches common calendar app patterns users already know

### Recipe Picker (Mobile Adaptation)
- **Bottom Sheet Modal** instead of sidebar
- Triggered by tapping empty slot or "+" floating action button
- Searchable list with category tabs
- Drag recipe from picker to visible slot, or tap to assign to last-tapped slot

## Requirements Summary

### Functional Requirements

#### Week Navigation
- Navigate between weeks using previous/next arrows
- "Today" button jumps to current week with today highlighted
- Past weeks viewable for reference (no restriction on edit vs read-only specified)
- Week label displays date range (e.g., "Feb 2 - 8, 2026")

#### Meal Slot Management
- Four meal slot types: breakfast, lunch, dinner, snacks
- Snacks section is collapsible/optional (collapsed by default, user can expand)
- Each slot can hold one recipe assignment
- Display recipe thumbnail, name, and prep time in filled slots
- Empty slots show dashed border with plus icon

#### Adding Recipes to Slots
- **Tap-to-Assign:** Tap empty slot to open recipe picker, select recipe to assign
- **Drag-and-Drop:** Drag recipe from picker and drop onto target slot
- Recipe picker includes search and category filtering (All/Breakfast/Lunch/Dinner/Snacks)

#### Meal Actions
- **Remove:** Delete a planned meal from a slot (X button or swipe-to-delete)
- **Copy:** Copy a meal to another day/slot (long-press menu or dedicated action)
- **Move:** Drag existing meal to a different slot (drag-and-drop reordering)
- **View Recipe:** Tap filled slot to navigate to full recipe detail view

#### Bulk Actions
- **Clear Day:** Remove all meals for a specific day
- **Clear Week:** Remove all meals for the entire week (with confirmation)

#### Shopping List Integration
- "Shop" button enters selection mode
- **Individual Selection:** Checkbox on each planned meal to include/exclude
- **Select All Day:** Quick action to select all meals for a specific day
- **Add Whole Week:** Button to select all meals in the current week at once
- Generate shopping list from selected meals (navigates to Shopping List feature)
- Selection count displayed in header during selection mode

#### Empty State / Onboarding
- First-time users see onboarding hint explaining how to add recipes
- Suggested actions: "Tap a slot to add a recipe" or "Drag recipes from your collection"
- Onboarding dismissible and not shown after user adds first meal

### Reusability Opportunities

**Components to Adapt from Mockups:**
- `MealPlanner.tsx` - Main container, week navigation, header actions
- `MealSlotCard.tsx` - Individual slot rendering (empty vs filled states)
- `RecipePicker.tsx` - Recipe search and selection (adapt to bottom sheet)

**Patterns to Follow:**
- Week navigation with previous/next/today (already defined in mockup)
- Selection mode toggle pattern for shopping list generation
- Category filtering with pill buttons

**Backend Patterns to Reference:**
- Convex real-time queries for meal plan data
- User-scoped data filtering (meals belong to authenticated user)

### Scope Boundaries

**In Scope:**
- Weekly calendar view with 7 days
- 4 meal slots per day (breakfast, lunch, dinner, snacks with collapse)
- Week navigation (past, current, future)
- Tap-to-assign recipe selection
- Drag-and-drop recipe assignment
- Copy meal to another slot
- Move meal between slots
- Remove individual meals
- Clear day / clear week bulk actions
- Selection mode for shopping list generation
- Individual meal selection + select all day + select whole week
- Empty state with onboarding hint
- Mobile-optimized layout (single day view with week strip)
- Recipe picker as bottom sheet modal

**Out of Scope:**
- Recurring meal plans (auto-repeat weekly)
- Meal plan templates (save/load preset weeks)
- Nutritional summary for the week
- Serving size adjustments per meal
- Meal time scheduling (specific clock times)
- Push notification reminders
- Social sharing of meal plans
- AI-suggested meal plans
- Integration with external calendars (Google Calendar, Apple Calendar)

### Technical Considerations

#### Tech Stack (from product tech-stack.md)
- **Frontend:** React Native with Expo SDK 52+
- **Backend:** Convex (real-time database, serverless functions)
- **Navigation:** expo-router (file-based routing)
- **Authentication:** Clerk (user-scoped meal plans)

#### Data Model Requirements
- `PlannedMeal` entity with: id, recipeId, recipeName, recipeImage, prepTime, day (date string), slot (MealSlot enum)
- `WeekInfo` for navigation: startDate, endDate, weekLabel
- User relationship for multi-tenancy (meals belong to user)

#### Drag-and-Drop Implementation
- Use `react-native-gesture-handler` for gesture detection
- Use `react-native-reanimated` for smooth drag animations
- Consider `react-native-draggable-flatlist` or custom implementation
- Drag feedback: ghost image of recipe card follows finger
- Drop targets: highlight valid slots during drag
- Accessibility: ensure tap-to-assign works as fallback for users who cannot use drag

#### Shopping List Integration Flow
1. User taps "Shop" button in header
2. UI enters selection mode (checkboxes appear on all planned meals)
3. User selects individual meals OR taps "Select All" for day/week
4. Selection count updates in header (e.g., "Shopping List (5)")
5. User taps "Generate List" button
6. App navigates to Shopping List screen (spec #9) with selected meal IDs as parameter
7. Shopping List feature aggregates ingredients from selected recipes

#### Performance Considerations
- Lazy load recipe images with placeholder
- Virtualize week list if allowing extended navigation range
- Cache current week data for offline viewing
- Optimistic UI updates for meal add/remove/move actions

#### Accessibility Requirements
- All interactive elements have minimum 48x48pt tap targets
- Screen reader labels for meal slots ("Empty breakfast slot for Wednesday")
- Drag-and-drop has tap-to-assign alternative
- Color is not the only indicator (icons + text for meal types)
- Support for reduced motion (disable drag animations if preferred)
