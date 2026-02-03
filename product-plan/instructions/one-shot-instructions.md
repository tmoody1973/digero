# Digero — Complete Implementation Guide

> **This document combines all milestone instructions for a single comprehensive build session.**
> For step-by-step implementation, use the individual files in `instructions/incremental/`.

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
- **DO** implement empty states when no records exist
- **DO** use test-driven development — write tests first

---

## Milestone 1: Foundation

Set up the core application infrastructure.

### Goals
- Initialize project with React/Next.js
- Configure Tailwind CSS with design tokens
- Set up routing structure
- Implement authentication system
- Create database schema foundations

### Design Tokens
- **Primary:** Orange (`orange-500`)
- **Secondary:** Green (`green-500`)
- **Neutral:** Stone palette
- **Typography:** Nunito Sans

### Core Entities
- User
- Recipe
- Cookbook
- MealPlan
- ShoppingList

---

## Milestone 2: Recipe Library

The central hub for managing recipes.

### Components
Copy from `sections/recipe-library/components/`:
- `RecipeList.tsx`
- `RecipeCard.tsx`
- `RecipeDetail.tsx`
- `AddRecipeMenu.tsx`
- `ScanSession.tsx`

### Key Features
- Save recipes from YouTube, websites, scanning, manual entry
- Grid/list views with search and filtering
- Recipe detail with ingredient scaling
- Add to shopping list / meal plan

### API Endpoints Needed
- `GET/POST/PUT/DELETE /api/recipes`
- `POST /api/recipes/import/youtube`
- `POST /api/recipes/import/url`
- `POST /api/recipes/import/scan`

---

## Milestone 3: Discover

YouTube channel hub for finding cooking content.

### Components
Copy from `sections/discover/components/`:
- `Discover.tsx`
- `VideoCard.tsx`
- `ChannelCard.tsx`
- `ChannelDetail.tsx`
- `CategoryChip.tsx`
- `RecipePreviewModal.tsx`

### Key Features
- Video feed from followed channels
- Channel discovery and following
- AI recipe extraction from videos
- Category browsing

### External Integration
- YouTube Data API for channel/video data
- AI service for recipe extraction

---

## Milestone 4: Cookbooks

Recipe organization and collections.

### Components
Copy from `sections/cookbooks/components/`:
- `Cookbooks.tsx`
- `CookbookCard.tsx`
- `CookbookDetail.tsx`
- `CookbookRecipeCard.tsx`

### Key Features
- Create custom cookbooks
- Built-in Favorites and Recently Added
- Add/remove recipes (many-to-many)
- Sorting and reordering

### API Endpoints Needed
- `GET/POST/PUT/DELETE /api/cookbooks`
- `POST/DELETE /api/cookbooks/:id/recipes`

---

## Milestone 5: Meal Planner

Weekly calendar for meal planning.

### Components
Copy from `sections/meal-planner/components/`:
- `MealPlanner.tsx`
- `MealSlotCard.tsx`
- `RecipePicker.tsx`

### Key Features
- Weekly calendar with 4 slots per day
- Week navigation
- Recipe assignment to slots
- Shopping list generation from selections

### API Endpoints Needed
- `GET/POST/PUT/DELETE /api/meal-plans`
- `POST /api/meal-plans/generate-shopping-list`

---

## Milestone 6: Shopping Lists

Auto-generated shopping lists from meal plans.

### Components
Copy from `sections/shopping-lists/components/`:
- `ShoppingLists.tsx`
- `ShoppingListCard.tsx`
- `ShoppingListDetail.tsx`
- `ShoppingItemRow.tsx`

### Key Features
- Generate from meal plan selections
- Category (aisle) and recipe grouping
- Check off, edit, delete items
- Add custom items
- Auto-archive on completion

### API Endpoints Needed
- `GET/POST/PUT/DELETE /api/shopping-lists`
- `PUT /api/shopping-lists/:id/items/:itemId`

---

## Implementation Checklist

### Foundation
- [ ] Project setup with TypeScript
- [ ] Tailwind CSS with design tokens
- [ ] Authentication (sign up, login, logout)
- [ ] Database schema
- [ ] Application shell with navigation

### Recipe Library
- [ ] Recipe CRUD operations
- [ ] YouTube import with AI extraction
- [ ] URL import with AI extraction
- [ ] Cookbook scanning (camera + OCR)
- [ ] Manual entry form
- [ ] Serving scaler
- [ ] Search and filtering

### Discover
- [ ] YouTube API integration
- [ ] Channel follow/unfollow
- [ ] Video feed
- [ ] Recipe extraction preview

### Cookbooks
- [ ] Cookbook CRUD
- [ ] Recipe-cookbook relationships
- [ ] Built-in cookbooks
- [ ] Sorting and reordering

### Meal Planner
- [ ] Weekly calendar display
- [ ] Meal slot assignments
- [ ] Week navigation
- [ ] Shopping list generation

### Shopping Lists
- [ ] List generation from meals
- [ ] Ingredient combination
- [ ] Category grouping
- [ ] Item check-off and editing
- [ ] Auto-archiving

---

## Files Reference

```
product-plan/
├── product-overview.md         # Product context
├── design-system/              # Tokens and fonts
├── data-model/                 # Types and sample data
├── shell/                      # App shell components
├── sections/
│   ├── recipe-library/
│   │   ├── components/
│   │   ├── types.ts
│   │   ├── data.json
│   │   └── tests.md
│   ├── discover/
│   ├── cookbooks/
│   ├── meal-planner/
│   └── shopping-lists/
└── instructions/
    └── incremental/            # Step-by-step guides
```
