# Milestone 5: Meal Planner

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-4 complete

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

Implement Meal Planner — a weekly calendar for planning meals across breakfast, lunch, dinner, and snacks.

## Overview

The Meal Planner provides a visual weekly calendar where users assign recipes to meal slots. Users can tap empty slots to add recipes, drag recipes between slots, and generate shopping lists from selected meals.

**Key Functionality:**
- View weekly calendar with 4 meal slots per day
- Navigate between weeks (previous/next/today)
- Add recipes to slots via tap or drag-and-drop
- Recipe picker sidebar for browsing available recipes
- Move and copy meals between slots
- Clear individual meals, days, or entire week
- Selection mode for generating shopping lists

## Recommended Approach: Test-Driven Development

See `product-plan/sections/meal-planner/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/meal-planner/components/`:

- `MealPlanner.tsx` — Main weekly calendar view
- `MealSlotCard.tsx` — Individual meal slot (empty or filled)
- `RecipePicker.tsx` — Sidebar for adding recipes

### Data Layer

```typescript
type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

interface PlannedMeal {
  id: string
  recipeId: string
  recipeName: string
  recipeImage: string
  prepTime: string
  day: string
  slot: MealSlot
}

interface WeekInfo {
  startDate: string
  endDate: string
  weekLabel: string
}
```

You'll need to:
- Store planned meals with day/slot assignments
- Week-based queries for meal data
- Handle meal move/copy operations
- Track selected meals for shopping list generation

### Callbacks

| Callback | Description |
|----------|-------------|
| `onPreviousWeek` | Navigate to previous week |
| `onNextWeek` | Navigate to next week |
| `onToday` | Jump to current week |
| `onSlotTap` | Open recipe picker for empty slot |
| `onViewRecipe` | Navigate to recipe detail |
| `onRemoveMeal` | Remove meal from slot |
| `onClearDay` | Clear all meals for a day |
| `onClearWeek` | Clear entire week |
| `onEnterSelectionMode` | Enter selection mode for shopping list |
| `onToggleMealSelection` | Toggle meal selection |
| `onGenerateShoppingList` | Generate list from selected meals |

### Empty States

- **Empty week:** Show helpful message with CTA to add meals
- **Empty day:** Show dashed outline slots with + icons
- **No recipes to pick:** Show message to save recipes first

## Files to Reference

- `product-plan/sections/meal-planner/README.md`
- `product-plan/sections/meal-planner/tests.md`
- `product-plan/sections/meal-planner/components/`
- `product-plan/sections/meal-planner/types.ts`
- `product-plan/sections/meal-planner/sample-data.json`

## Expected User Flows

### Flow 1: Add Recipe to Meal Slot

1. User taps empty breakfast slot on Monday
2. Recipe picker opens showing available recipes
3. User taps "Overnight Oats"
4. **Outcome:** Recipe appears in Monday breakfast slot

### Flow 2: Generate Shopping List

1. User taps "Shop" button to enter selection mode
2. User taps individual meals or "Select all" per day
3. User taps "Shopping List (X)" button
4. **Outcome:** Shopping list created with selected meals' ingredients

### Flow 3: Navigate Weeks

1. User taps right arrow to go to next week
2. Calendar updates to show next week's dates
3. User taps "Today" to return to current week

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Weekly calendar displays with 7 days and 4 slots each
- [ ] Week navigation works (prev/next/today)
- [ ] Adding recipes to slots works
- [ ] Recipe picker filters by meal type
- [ ] Clear day and clear week work
- [ ] Selection mode for shopping list generation works
- [ ] Empty states display properly
- [ ] Matches visual design
- [ ] Responsive on mobile
