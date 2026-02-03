# Milestone 2: Recipe Library

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Recipe Library — the central hub where users save, browse, and manage all their recipes.

## Overview

The Recipe Library lets users save recipes from multiple sources: YouTube videos, website URLs, physical cookbook scanning, and manual entry. Users can browse recipes in grid or list view, search and filter, view detailed recipe information with nutrition data, scale servings, and manage their collection.

**Key Functionality:**
- Save recipes from YouTube, websites, scanned cookbooks, or manual entry
- Browse recipes in grid or list view with search and source filtering
- View recipe details with ingredients, instructions, and nutrition
- Scale servings with auto-calculated ingredient quantities
- Add ingredients to shopping list or schedule in meal plan
- Edit, share, and delete recipes

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/recipe-library/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

## What to Implement

### Components

Copy the section components from `product-plan/sections/recipe-library/components/`:

- `RecipeLibrary.tsx` — Main list view with grid/list toggle, search, filters
- `RecipeCard.tsx` — Individual recipe card for grid/list display
- `RecipeDetail.tsx` — Full recipe detail view

### Data Layer

The components expect these data shapes:

```typescript
interface Recipe {
  id: string
  title: string
  source: 'youtube' | 'website' | 'scanned' | 'manual'
  sourceUrl: string | null
  youtubeVideoId: string | null
  imageUrl: string
  servings: number
  prepTime: number
  cookTime: number
  ingredients: Ingredient[]
  instructions: string[]
  nutrition: Nutrition
  notes: string
  createdAt: string
  scannedFromBook?: { name: string; coverImageUrl: string }
}
```

You'll need to:
- Create API endpoints for CRUD operations
- Implement recipe import from YouTube URLs
- Implement recipe import from website URLs
- Implement cookbook page scanning and OCR
- Store recipes in your database

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onView` | Navigate to recipe detail view |
| `onEdit` | Open edit mode for recipe |
| `onDelete` | Delete recipe with confirmation |
| `onShare` | Share recipe externally |
| `onSearchYouTube` | Open YouTube search modal |
| `onAddFromUrl` | Open URL paste modal |
| `onStartScanSession` | Open camera for cookbook scanning |
| `onManualEntry` | Open manual recipe form |
| `onScaleServings` | Recalculate ingredients for new serving size |
| `onAddToShoppingList` | Add recipe ingredients to shopping list |
| `onAddToMealPlan` | Open day/slot picker to schedule recipe |
| `onAddToCookbook` | Open cookbook picker to add recipe |

### Empty States

Implement empty state UI for when no recipes exist yet:

- **No recipes yet:** Show helpful message with CTAs for each import method
- **No search results:** Show "No recipes found" with suggestion to adjust search
- **First-time user:** Guide them to save their first recipe

## Files to Reference

- `product-plan/sections/recipe-library/README.md` — Feature overview and design intent
- `product-plan/sections/recipe-library/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/recipe-library/components/` — React components
- `product-plan/sections/recipe-library/types.ts` — TypeScript interfaces
- `product-plan/sections/recipe-library/sample-data.json` — Test data

## Expected User Flows

### Flow 1: Save Recipe from YouTube

1. User clicks "Add Recipe" button in header
2. User selects "Search YouTube" option
3. User enters search query, sees video results
4. User taps a video to preview extracted recipe
5. User confirms and saves to library
6. **Outcome:** Recipe appears in library with YouTube source indicator

### Flow 2: View and Scale Recipe

1. User taps a recipe card in the library
2. User sees full details: photo, ingredients, instructions, nutrition
3. User adjusts serving slider from 4 to 8 servings
4. **Outcome:** All ingredient quantities double automatically

### Flow 3: Add to Shopping List

1. User opens a recipe detail view
2. User taps "Add to Shopping List" button
3. User optionally selects specific ingredients (or adds all)
4. **Outcome:** Ingredients added to active shopping list

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Recipes display in grid and list views
- [ ] Search and source filter work
- [ ] Recipe detail view shows all information
- [ ] Serving scaler recalculates ingredients
- [ ] Empty states display properly when no recipes exist
- [ ] All import methods work (YouTube, URL, scan, manual)
- [ ] Add to shopping list and meal plan work
- [ ] Matches the visual design
- [ ] Responsive on mobile
