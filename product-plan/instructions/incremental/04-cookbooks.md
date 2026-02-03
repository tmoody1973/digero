# Milestone 4: Cookbooks

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-3 complete

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

Implement Cookbooks — custom recipe collections for organizing recipes by theme, cuisine, or occasion.

## Overview

Cookbooks let users organize their saved recipes into collections. Each cookbook has a name, cover photo, and contains recipe references. Built-in Favorites and Recently Added cookbooks are always available. Users can create unlimited custom cookbooks.

**Key Functionality:**
- Browse cookbooks in grid or list view
- Create custom cookbooks with cover photos
- View cookbook contents with sorting options
- Add/remove recipes from cookbooks (many-to-many)
- Built-in Favorites and Recently Added cookbooks
- Share cookbooks externally

## Recommended Approach: Test-Driven Development

See `product-plan/sections/cookbooks/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/cookbooks/components/`:

- `Cookbooks.tsx` — Main list view with Quick Access section
- `CookbookCard.tsx` — Individual cookbook card
- `CookbookDetail.tsx` — Cookbook contents view
- `CookbookRecipeCard.tsx` — Recipe card within cookbook

### Data Layer

```typescript
interface Cookbook {
  id: string
  name: string
  description: string
  coverUrl: string
  recipeCount: number
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

interface CookbookRecipe {
  recipeId: string
  title: string
  imageUrl: string
  source: 'youtube' | 'website' | 'scanned' | 'manual'
  position: number
  dateAdded: string
}
```

You'll need to:
- Create cookbook CRUD endpoints
- Implement recipe-cookbook relationship (many-to-many)
- Auto-maintain built-in cookbooks (Favorites, Recently Added)
- Handle recipe ordering within cookbooks

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewCookbook` | Navigate to cookbook detail |
| `onCreateCookbook` | Open create cookbook modal |
| `onEditCookbook` | Open edit modal (name, cover) |
| `onDeleteCookbook` | Delete cookbook (not built-in) |
| `onShareCookbook` | Share cookbook externally |
| `onViewRecipe` | Navigate to recipe detail |
| `onRemoveRecipe` | Remove recipe from cookbook |
| `onReorderRecipes` | Drag-and-drop reordering |
| `onSortChange` | Change sort order (position, date, title) |

### Empty States

- **No custom cookbooks:** Show built-in cookbooks with CTA to create
- **Empty cookbook:** Show message with CTA to add recipes
- **No favorites:** Show message encouraging user to favorite recipes

## Files to Reference

- `product-plan/sections/cookbooks/README.md`
- `product-plan/sections/cookbooks/tests.md`
- `product-plan/sections/cookbooks/components/`
- `product-plan/sections/cookbooks/types.ts`
- `product-plan/sections/cookbooks/sample-data.json`

## Expected User Flows

### Flow 1: Create a Cookbook

1. User taps "New Cookbook" button
2. User enters name and selects/uploads cover photo
3. User taps "Create"
4. **Outcome:** New cookbook appears in list, user can add recipes

### Flow 2: Add Recipe to Cookbook

1. User views a recipe in the library
2. User taps "Add to Cookbook" button
3. User selects one or more cookbooks from list
4. **Outcome:** Recipe added to selected cookbooks

### Flow 3: Browse Cookbook Contents

1. User taps a cookbook card
2. User sees all recipes in that cookbook
3. User can sort by date added, name, or custom order
4. User can remove recipes or view recipe details

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Cookbooks display in grid and list views
- [ ] Built-in cookbooks always present (Favorites, Recently Added)
- [ ] Create cookbook with cover photo works
- [ ] Add/remove recipes works
- [ ] Sorting and reordering work
- [ ] Empty states display properly
- [ ] Matches visual design
- [ ] Responsive on mobile
