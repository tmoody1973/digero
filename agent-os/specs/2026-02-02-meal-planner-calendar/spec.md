# Specification: Meal Planner Calendar

## Goal

Create a weekly calendar view where users can plan meals by assigning recipes to specific days and meal slots (breakfast, lunch, dinner, snacks), with both tap-to-assign and drag-and-drop interactions, optimized for mobile use.

## User Stories

- As a user, I want to view and navigate my weekly meal plan so that I can see what I have planned for each day and plan ahead.
- As a user, I want to quickly add recipes to meal slots using tap or drag-and-drop so that I can efficiently build my weekly meal plan.
- As a user, I want to generate a shopping list from my planned meals so that I know what ingredients to buy.

## Specific Requirements

**Mobile-First Single Day View**
- Display one day at a time with all meal slots vertically stacked (breakfast, lunch, dinner, snacks)
- Show a mini week strip at the top with circular date indicators for quick day navigation
- Support horizontal swipe gestures to navigate between days (left = previous, right = next)
- Indicate today with orange fill; show dot indicators on days with planned meals
- Ensure all tap targets meet minimum 48x48pt accessibility requirement

**Week Navigation**
- Implement previous/next week arrows in the header
- Provide "Today" pill button to jump to current week with today highlighted
- Display week label showing date range (e.g., "Feb 2 - 8, 2026")
- Allow navigation to past weeks for reference (editable, not read-only)
- Store current week context using WeekInfo type: startDate, endDate, weekLabel

**Meal Slot Cards**
- Four slot types per day: breakfast, lunch, dinner, snacks (collapsible)
- Empty slots show dashed border with plus icon; highlight on hover/focus
- Filled slots display recipe thumbnail, name, and prep time
- Include X button to remove meal (visible on hover/long-press)
- Selection checkbox appears when in selection mode for shopping list generation

**Tap-to-Assign Workflow**
- Tapping empty slot opens bottom sheet RecipePicker modal
- RecipePicker includes search input and category filter pills (All/Breakfast/Lunch/Dinner/Snacks)
- Selecting a recipe assigns it to the tapped slot and closes modal
- Tapping filled slot navigates to recipe detail view

**Drag-and-Drop Interaction**
- Use react-native-gesture-handler for gesture detection and react-native-reanimated for animations
- Drag recipes from RecipePicker bottom sheet to visible meal slots
- Show ghost image of recipe card following finger during drag
- Highlight valid drop target slots with orange border during drag
- Support dragging existing meals to move them between slots
- Ensure tap-to-assign remains as accessibility fallback

**Copy and Move Meals**
- Long-press on filled slot reveals context menu with Copy and Move options
- Copy duplicates meal to another day/slot selected by user
- Move relocates meal (removes from original, adds to new slot)
- Alternatively, implement via drag with modifier (drag = move, drag + hold = copy indicator)

**Collapsible Snacks Section**
- Snacks section collapsed by default to reduce visual clutter
- Chevron icon indicates expand/collapse state
- Persist user preference for snacks visibility using AsyncStorage

**Shopping List Integration**
- "Shop" button in header enters selection mode
- Checkboxes appear on all planned meals; selection count shows in header
- "Select all" link per day header to quickly select full day
- "Select whole week" button to select all meals at once
- "Generate List" button navigates to Shopping List screen with selected meal IDs as parameter
- Cancel button exits selection mode without generating list

**Empty State and Onboarding**
- First-time users see onboarding overlay explaining how to add recipes
- Onboarding shows: "Tap a slot to add a recipe" and "Drag recipes from the picker"
- Dismissible with "Got it" button; do not show after user adds first meal
- Track onboarding completion in AsyncStorage

**Bulk Actions**
- "Clear" link on each day header to remove all meals for that day
- "Clear Week" button in header removes all meals with confirmation dialog
- Confirmation uses platform Alert or custom modal

## Visual Design

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/meal-planner/meal-planner.png`**
- Vertical day-by-day layout (Sun-Sat) with each day showing date and meal slots
- Header contains "Meal Plan" title, meal count, green "Shop" button, "Clear Week" link, recipe picker toggle
- Week navigation shows left/right arrows, week label, orange "Today" pill button
- Day headers use day abbreviation with date number; today highlighted in orange circle
- Meal slot rows labeled with icons for Breakfast, Lunch, Dinner, Snacks
- Filled slots show recipe thumbnail, name, prep time, and remove X on hover
- Empty slots show dashed border with centered plus icon
- Recipe picker sidebar (adapt to bottom sheet) has search, category filter pills, scrollable recipe list

## Existing Code to Leverage

**MealPlanner.tsx (product-plan/sections/meal-planner/components/)**
- Provides complete reference for week navigation, header layout, and slot grid structure
- Adapt selection mode toggle pattern for shopping list generation
- Reuse slot label and icon mappings (slotLabels, slotIcons records)
- Follow same handler prop patterns (onPreviousWeek, onNextWeek, onToday, etc.)
- Convert 7-column grid to single-day view with swipe navigation

**MealSlotCard.tsx (product-plan/sections/meal-planner/components/)**
- Reuse filled vs empty slot rendering logic and visual states
- Adapt selection checkbox pattern for shopping list mode
- Follow same click handling pattern (selection mode vs view recipe vs tap empty)
- Convert hover states to long-press interactions for mobile

**RecipePicker.tsx (product-plan/sections/meal-planner/components/)**
- Adapt sidebar design to bottom sheet modal using react-native-bottom-sheet
- Reuse search and category filter pill patterns
- Implement same recipe list item structure with thumbnail, name, prep time
- Add draggable capability to recipe items

**types.ts (product-plan/sections/meal-planner/)**
- Use existing type definitions: MealSlot, WeekInfo, PlannedMeal, RecipePickerItem
- Implement all prop handler signatures from MealPlannerProps interface
- Follow same naming conventions for component props

**ShoppingLists integration (product-plan/sections/shopping-lists/)**
- Reference ShoppingList and ShoppingItem types for integration
- Follow onGenerateFromMealPlan pattern for navigation handoff
- Pass selected meal IDs as route parameters to shopping list generation

## Out of Scope

- Recurring meal plans (auto-repeat weekly schedules)
- Meal plan templates (save/load preset week configurations)
- Nutritional summary calculations for the week
- Serving size adjustments per individual meal
- Specific meal time scheduling (clock times like 7:00 AM)
- Push notification reminders for meals
- Social sharing of meal plans
- AI-suggested or auto-generated meal plans
- Integration with external calendars (Google Calendar, Apple Calendar)
- Multi-user meal plan sharing or collaboration
