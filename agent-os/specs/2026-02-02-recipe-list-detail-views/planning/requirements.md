# Spec Requirements: Recipe List and Detail Views

## Initial Description

Display user's saved recipes in a scrollable list with search/filter. Tapping a recipe opens a detail view showing full ingredients and instructions in a cook-friendly format.

**Source:** Product Roadmap - Week 1: Foundation and Core Flow (Feature #4)
**Effort Estimate:** Medium (M) - 1 week
**Priority:** High - Essential for recipe browsing and viewing

## Requirements Discussion

### First Round Questions

**Q1:** I notice the mockups show source filtering (YouTube, Website, Scanned, Manual) but no sort options. I assume you want basic sorting by most recent (default) and alphabetical. Is that sufficient, or should we also include sorting by cook time, calories, or most recently cooked?
**Answer:** Include ALL sorting options - most recent (default), alphabetical, cook time, calories, most recently cooked.

**Q2:** The current detail view shows instructions as a static numbered list. I assume for MVP we keep this simple scroll-through format without a dedicated "Cook Mode" (step-by-step with large text, timers, voice control, etc.). Is that correct, or is hands-free cooking support important for the hackathon demo?
**Answer:** Include BOTH - simple scroll-through view AND step-by-step "Cook Mode" with large text/timers, with ability to switch between them.

**Q3:** I don't see a favorite/bookmark feature in the mockups. I assume favoriting is out of scope for this feature since recipes can be organized into cookbooks instead. Is that correct?
**Answer:** Include favorite/bookmark functionality.

**Q4:** For the ingredient selection feature (Select Items button), I assume the selected ingredients are added to a single global shopping list rather than prompting the user to choose which list. Is that correct?
**Answer:** Use best practices for UX (recommendation provided below).

**Q5:** The detail view shows "Delete Recipe" at the bottom. I assume this should show a confirmation dialog before deletion to prevent accidental data loss. Should we also support swipe-to-delete on recipe cards in the list view?
**Answer:** Yes - confirmation dialog AND swipe-to-delete on recipe cards in list view.

**Q6:** For loading and error states: I assume we show a skeleton loader while recipes are loading, a simple error message with retry button if the fetch fails. Is that sufficient, or do you need offline caching so previously viewed recipes are available without network?
**Answer:** Skeleton loader while loading, error message with retry button, and YES include offline caching for previously viewed recipes.

**Q7:** For large recipe collections, I assume we use infinite scroll to load more recipes as the user scrolls, rather than pagination. Is that correct?
**Answer:** Infinite scroll confirmed.

**Q8:** Is there anything I've described that should be excluded from this feature, or any edge cases you're concerned about?
**Answer:** No exclusions.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: RecipeList component - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeList.tsx`
- Feature: RecipeDetail component - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeDetail.tsx`
- Feature: RecipeCard component - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/RecipeCard.tsx`
- Types and interfaces - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts`
- Visual mockups - Paths: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-list.png` and `recipe-detail.png`

These are reference UI designs (React/web) that need to be adapted to React Native + Expo implementation.

### Follow-up Questions

No follow-up questions needed. User provided comprehensive answers.

### UX Recommendation: Shopping List Ingredient Selection

**Recommended Approach: Smart Default with Optional Override**

For the best user experience when adding ingredients to a shopping list:

1. **Primary Action - "Add All to Shopping List"**: Adds all scaled ingredients to the user's active/default shopping list immediately with a success toast showing "Added X ingredients to Shopping List" with an "Undo" action.

2. **Secondary Action - "Select Items"**: Enables checkbox mode for granular selection, then:
   - If user has only ONE shopping list: Add directly to that list with success feedback
   - If user has MULTIPLE shopping lists: Show a bottom sheet with list options:
     - Quick-select existing lists (radio buttons)
     - "Create New List" option at bottom
   - Remember the last-used list as default for next time

3. **Success Feedback**: Show a brief toast/snackbar with:
   - Number of items added
   - Which list they were added to
   - "Undo" action (available for 5 seconds)
   - "View List" action to navigate to shopping list

**Rationale:** This approach minimizes friction for the common case (single list) while providing flexibility for users with multiple lists. The "remember last used" behavior reduces repeated selections.

## Visual Assets

### Files Provided:
No visual assets provided in the spec visuals folder.

### Reference Mockups (from product-plan):
- `recipe-list.png`: Grid view of recipe library showing search bar, source filter pills (All, YouTube, Website, Scanned, Manual), grid/list toggle, recipe cards with images, source badges, timing, servings, and calories
- `recipe-detail.png`: Full recipe detail view (referenced but not analyzed in this session)

### Visual Insights:
- Design follows orange accent color scheme with stone/neutral backgrounds
- Source badges use color coding: YouTube (red), Website (blue), Scanned (amber), Manual (green)
- Cards show hero images with gradient overlays for text readability
- Clean, modern aesthetic with rounded corners (rounded-xl, rounded-2xl)
- Dark mode support indicated in component code
- Fidelity level: High-fidelity mockups suitable for direct implementation reference

## Requirements Summary

### Functional Requirements

#### Recipe List View
- Display user's saved recipes in scrollable grid or list format
- Toggle between grid view (cards) and list view (compact rows)
- Search recipes by title or ingredient name
- Filter by source type: All, YouTube, Website, Scanned, Manual
- Sort recipes by:
  - Most recent (default)
  - Alphabetical (A-Z)
  - Cook time (shortest first)
  - Calories (lowest first)
  - Most recently cooked
- Infinite scroll pagination for large collections
- Show recipe count with active filters
- Favorite/bookmark toggle on recipe cards
- Swipe-to-delete gesture on recipe cards (with confirmation)
- Empty state when no recipes match search/filter
- Floating action button to add new recipes

#### Recipe Card
- Display recipe image with gradient overlay
- Show source badge (YouTube/Website/Scanned/Manual) with icon and color
- Display title, servings, total cook time, calories
- Show "from [cookbook name]" for scanned recipes
- Favorite/heart icon toggle
- Tap to navigate to detail view

#### Recipe Detail View
- Hero image with back button, share button, edit button
- Source badge overlay on image
- Title and cookbook attribution (if scanned)
- Quick stats bar: Total time, Prep time, Cook time
- YouTube video embed (if source is YouTube)
- Nutrition per serving: Calories, Protein, Carbs, Fat
- Dietary conversion buttons: Convert to Vegan, Convert to Vegetarian
- Ingredients list with:
  - Serving size adjuster (+/- controls)
  - Auto-scaled ingredient quantities
  - Checkbox selection mode for shopping list
  - "Add All to Shopping List" button
  - "Select Items" button for partial add
- Instructions as numbered steps
- Notes section (if present)
- Action buttons: Add to Meal Plan, Add to Cookbook, Delete Recipe
- Favorite/bookmark toggle
- Confirmation dialog for delete action

#### Cook Mode (Step-by-Step View)
- Toggle button to enter Cook Mode from detail view
- Full-screen step display with large, readable text
- Swipe left/right to navigate between steps
- Step counter (e.g., "Step 3 of 8")
- Timer integration:
  - Auto-detect time references in step text (e.g., "cook for 10 minutes")
  - Display timer button when time is detected
  - Tap to start countdown timer
  - Audio/vibration alert when timer completes
- Keep screen awake while in Cook Mode
- Exit button to return to standard detail view
- Progress indicator showing completed steps

#### Offline Support
- Cache previously viewed recipes locally
- Display cached recipes when offline
- Show offline indicator when network unavailable
- Queue actions (favorites, deletes) for sync when online
- Clear visual indication of cached vs. fresh data

#### Loading and Error States
- Skeleton loader for recipe list while fetching
- Skeleton loader for recipe detail while loading
- Error state with:
  - Friendly error message
  - Retry button
  - Option to view cached data if available
- Pull-to-refresh on recipe list

### Reusability Opportunities
- Existing RecipeList, RecipeDetail, RecipeCard components provide UI reference
- Types defined in `types.ts` for Recipe, Ingredient, Nutrition interfaces
- Source configuration pattern (icon, label, color mapping) reusable
- Serving scaler logic reusable for meal planning
- Ingredient selection pattern reusable for shopping list feature

### Scope Boundaries

**In Scope:**
- Recipe list with grid/list views
- Search and filtering by source
- Sorting by multiple criteria
- Recipe detail view with all sections
- Serving size scaling
- Cook Mode with step navigation and timers
- Favorite/bookmark functionality
- Add to shopping list (all or selected ingredients)
- Add to meal plan (trigger action)
- Add to cookbook (trigger action)
- Delete with confirmation
- Swipe-to-delete on cards
- Offline caching of viewed recipes
- Loading skeletons and error states
- Infinite scroll pagination

**Out of Scope:**
- Voice control for Cook Mode (future enhancement)
- Recipe editing (separate feature)
- Manual recipe creation (separate feature)
- Cookbook scanning (separate feature)
- Shopping list management UI (separate feature)
- Meal planner calendar UI (separate feature)
- Nutrition analysis API integration (post-MVP)
- Recipe sharing to external apps (post-MVP)
- Dietary conversion AI logic (UI only, backend separate)

### Technical Considerations

- **Framework:** React Native + Expo (SDK 52+)
- **Backend:** Convex for real-time data sync
- **Authentication:** Clerk for user-scoped queries
- **Navigation:** Expo Router for file-based routing
- **Offline Storage:** Consider AsyncStorage or Convex offline support for recipe caching
- **Gestures:** React Native Gesture Handler for swipe-to-delete
- **Screen Wake Lock:** expo-keep-awake for Cook Mode
- **Timers:** Background timer support for Cook Mode countdown
- **Icons:** lucide-react-native (matching existing component usage)
- **Styling:** NativeWind/Tailwind CSS classes (matching existing design system)
- **Animations:** React Native Reanimated for smooth transitions

### Data Dependencies

Requires completion of:
- User Authentication (Feature #1) - for user-scoped recipe queries
- Recipe Data Model (Feature #2) - for recipe schema and Convex functions

### Integration Points

- **Shopping List:** `onAddToShoppingList` callback with ingredient data
- **Meal Planner:** `onAddToMealPlan` callback with recipe ID
- **Cookbooks:** `onAddToCookbook` callback with recipe ID
- **Recipe Edit:** `onEdit` navigation to edit screen
- **Add Recipe Menu:** Triggers for YouTube search, URL import, scan session, manual entry
