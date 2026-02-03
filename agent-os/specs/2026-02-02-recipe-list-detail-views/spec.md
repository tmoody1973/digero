# Specification: Recipe List and Detail Views

## Goal
Enable users to browse, search, filter, and view their saved recipes in a mobile-friendly interface with an optional Cook Mode for hands-free step-by-step cooking guidance.

## User Stories
- As a home cook, I want to quickly find a specific recipe by searching or filtering so that I can start cooking without scrolling through my entire collection.
- As a user cooking in the kitchen, I want a step-by-step Cook Mode with large text and timers so that I can follow instructions hands-free while cooking.

## Specific Requirements

**Recipe List View with Grid/List Toggle**
- Display recipes in a scrollable FlatList with toggle between grid (2-column cards) and list (compact rows) views
- Show recipe count with active filters (e.g., "6 recipes in YouTube matching 'chicken'")
- Implement infinite scroll pagination using Convex's paginated queries
- Persist view mode preference in AsyncStorage
- Add floating action button (FAB) to trigger add recipe menu

**Search and Filter Functionality**
- Real-time search by recipe title or ingredient name with debounced input (300ms)
- Horizontal scrollable filter pills for source types: All, YouTube, Website, Scanned, Manual
- Clear search button (X icon) when search has text
- Empty state with appropriate messaging when no recipes match filters

**Sort Options**
- Sort dropdown/bottom sheet with options: Most Recent (default), Alphabetical (A-Z), Cook Time (shortest first), Calories (lowest first), Most Recently Cooked
- Persist last-used sort preference in AsyncStorage
- Display current sort option as a button/chip next to view toggle

**Recipe Card Component**
- Grid view: 4:3 aspect ratio image with gradient overlay, source badge (color-coded), time badge, title, servings, calories
- List view: 80px square thumbnail, source icon badge, title, cookbook attribution (if scanned), time and servings row
- Favorite heart icon toggle (top-right of card) with optimistic UI update
- Use React Native Reanimated for smooth hover/press scaling effects

**Recipe Detail View**
- Hero image (16:10 aspect ratio) with back, share, and edit buttons overlaid
- Source badge on image, title, cookbook attribution for scanned recipes
- Quick stats bar: Total time, Prep time, Cook time with icons
- YouTube video embed using react-native-youtube-iframe (if source is YouTube)
- Nutrition grid: Calories, Protein, Carbs, Fat with colored values
- Dietary conversion buttons (Convert to Vegan, Convert to Vegetarian) - UI only, triggers callback

**Ingredients Section with Serving Scaler**
- Serving adjuster with +/- buttons and current serving count
- Auto-scale ingredient quantities using scaleFactor = newServings / originalServings
- Ingredient selection mode: "Add All to Shopping List" and "Select Items" buttons
- When selecting, show checkbox per ingredient with count of selected items
- Use smart shopping list UX: add directly if single list, show bottom sheet picker if multiple lists

**Cook Mode (Step-by-Step View)**
- Toggle button in detail view header to enter Cook Mode
- Full-screen step display with large, readable text (24px+ font)
- Horizontal swipeable steps using react-native-pager-view or FlatList with horizontal pagination
- Step counter (e.g., "Step 3 of 8") and progress indicator bar
- Auto-detect time patterns in step text (regex for "X minutes", "X hours") and show timer button
- Countdown timer with audio/vibration alert on completion using expo-av for sound
- Keep screen awake using expo-keep-awake while in Cook Mode
- Exit button to return to standard detail view

**Favorites Functionality**
- Heart icon on recipe cards and detail view header
- Toggle favorite status with optimistic UI (immediate visual feedback)
- Sync favorite status to Convex backend
- Queue favorite toggle for sync if offline

**Swipe-to-Delete and Confirmation Dialogs**
- Swipe left on recipe cards to reveal delete action using react-native-gesture-handler Swipeable
- Red delete button revealed on swipe with trash icon
- Confirmation dialog (Alert.alert or custom modal) before deletion: "Delete Recipe?" with Cancel/Delete buttons
- Same confirmation for "Delete Recipe" button in detail view

**Offline Caching Strategy**
- Cache viewed recipe details in AsyncStorage or MMKV for offline access
- Store last N recipes (configurable, default 50) with LRU eviction
- Display offline indicator banner when network unavailable
- Show "Cached" badge on recipes available offline
- Queue mutations (favorites, deletes) in local storage and sync when online
- Pull-to-refresh to fetch fresh data and clear stale cache

**Loading and Error States**
- Skeleton loader for recipe list (shimmer effect on card placeholders)
- Skeleton loader for recipe detail (hero image, stats, ingredients sections)
- Error state with friendly message, retry button, and option to view cached data
- Pull-to-refresh on list view using RefreshControl

## Visual Design

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-list.png`**
- Orange accent color (#f97316) for active filter pills and view toggle
- Source badges use color coding: YouTube (red-500), Website (blue-500), Scanned (amber-500), Manual (green-500)
- Search bar with stone-50 background, rounded-xl corners, search icon left, clear X right
- Recipe cards with rounded-2xl corners, drop shadow on hover, gradient overlay on images
- Grid shows 3 columns on desktop/tablet, adapt to 2 columns on mobile
- Filter pills are horizontally scrollable with hide-scrollbar

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/recipe-detail.png`**
- Hero image with gradient from-black/70 via-black/20 to-transparent
- Circular back/share/edit buttons with white/90 background, backdrop blur
- Quick stats in horizontal card with dividers, orange clock icon for total time
- Nutrition badges in 4-column grid with colored values (orange, red, amber, green)
- Ingredients list in white card with border, monospace quantities in orange
- Instructions with orange numbered circles (rounded-full bg-orange-100)
- Action buttons with border, hover states transitioning to orange

## Existing Code to Leverage

**RecipeList.tsx (product-plan/sections/recipe-library/components/)**
- Filter options array with icon, label, color mapping for source types
- Search input with clear button pattern
- View mode toggle UI (grid/list buttons)
- Empty state component design
- Recipe count with filter/search context display

**RecipeDetail.tsx (product-plan/sections/recipe-library/components/)**
- sourceConfig object mapping source type to icon, label, color
- NutritionBadge component for displaying nutrition values
- Serving adjuster UI with +/- buttons pattern
- Ingredient selection toggle with checkbox states
- Shopping list action buttons layout

**RecipeCard.tsx (product-plan/sections/recipe-library/components/)**
- Dual-mode rendering (grid vs list) in single component
- Source badge positioning and styling
- Time badge overlay on images
- Scanned recipe cookbook attribution display

**types.ts (product-plan/sections/recipe-library/)**
- Recipe, Ingredient, Nutrition interfaces for type definitions
- RecipeLibraryProps interface for list component props
- RecipeDetailProps interface for detail component callbacks

**ShoppingItemRow.tsx (product-plan/sections/shopping-lists/components/)**
- Checkbox toggle UI pattern with animated states
- Edit/delete action buttons pattern
- Group hover state for action visibility

## Out of Scope
- Voice control for Cook Mode navigation (future enhancement)
- Recipe editing functionality (separate spec)
- Manual recipe creation flow (separate spec)
- Cookbook page scanning (separate spec)
- Shopping list management UI (separate spec)
- Meal planner calendar UI (separate spec)
- Nutrition analysis API integration (post-MVP)
- Recipe sharing to external apps via native share sheet (post-MVP)
- Dietary conversion AI logic implementation (backend separate, UI triggers callback only)
- Background timer notifications when app is minimized (post-MVP)
