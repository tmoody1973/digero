# Milestone 6: Shopping Lists

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-5 complete

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

Implement Shopping Lists — auto-generated categorized shopping lists from meal plans with full item management.

## Overview

Shopping Lists aggregates ingredients from planned meals into organized shopping lists. Items are automatically combined and grouped by grocery store aisle (produce, dairy, meat, etc.) or by recipe. Users can check off items while shopping, edit quantities, add custom items, and manage multiple lists.

**Key Functionality:**
- Generate lists from selected meals or entire week
- View items grouped by category (aisle) or by recipe
- Check off items as purchased
- Edit item quantities and delete items
- Add custom items not from recipes
- Manage multiple active lists
- Auto-archive completed lists
- Share lists with others

## Recommended Approach: Test-Driven Development

See `product-plan/sections/shopping-lists/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/shopping-lists/components/`:

- `ShoppingLists.tsx` — Lists overview with active and archived sections
- `ShoppingListCard.tsx` — Individual list card with progress
- `ShoppingListDetail.tsx` — Detail view with items and checkboxes
- `ShoppingItemRow.tsx` — Individual item row with actions

### Data Layer

```typescript
type ItemCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Bakery'
  | 'Frozen'
  | 'Beverages'
  | 'Household'

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: ItemCategory
  isChecked: boolean
  recipeId: string | null
  recipeName: string | null
  isCustom: boolean
}

interface ShoppingList {
  id: string
  name: string
  status: 'active' | 'archived'
  totalItems: number
  checkedItems: number
  items: ShoppingItem[]
}
```

You'll need to:
- Generate shopping lists from meal plan selections
- Combine duplicate ingredients across recipes
- Categorize ingredients by grocery aisle
- Track checked/unchecked status
- Auto-archive when all items checked

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewList` | Navigate to list detail |
| `onCreateList` | Create empty list manually |
| `onDeleteList` | Delete a list |
| `onGenerateFromMealPlan` | Open meal plan to select meals |
| `onToggleItem` | Check/uncheck an item |
| `onEditItem` | Change quantity or unit |
| `onDeleteItem` | Remove item from list |
| `onAddItem` | Add custom item |
| `onViewModeChange` | Toggle category/recipe grouping |
| `onRenameList` | Change list name |
| `onShareList` | Share list externally |

### Empty States

- **No lists:** Show quick action buttons with CTA to generate
- **Empty list:** Show message with CTA to add items
- **All items checked:** Show completion message before auto-archive

## Files to Reference

- `product-plan/sections/shopping-lists/README.md`
- `product-plan/sections/shopping-lists/tests.md`
- `product-plan/sections/shopping-lists/components/`
- `product-plan/sections/shopping-lists/types.ts`
- `product-plan/sections/shopping-lists/sample-data.json`

## Expected User Flows

### Flow 1: Generate from Meal Plan

1. User taps "From Meal Plan" quick action
2. User is taken to meal planner in selection mode
3. User selects meals for the week
4. User taps "Shopping List" button
5. **Outcome:** New list created with combined ingredients

### Flow 2: Shop with List

1. User opens active shopping list
2. User checks off "Chicken breast" as purchased
3. Checkbox turns green, item shows strikethrough
4. User continues checking items
5. When all checked, **Outcome:** List auto-archives to history

### Flow 3: Add Custom Item

1. User taps "Add Item" button
2. User enters "Paper towels", quantity 1, unit "pack"
3. User selects "Household" category
4. User taps "Add to List"
5. **Outcome:** Custom item appears in Household category

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Lists overview shows active and archived lists
- [ ] Generate from meal plan works
- [ ] Items display grouped by category or recipe
- [ ] Check off items works with visual feedback
- [ ] Edit quantity and delete item work
- [ ] Add custom items works
- [ ] Auto-archive on completion works
- [ ] Share functionality works
- [ ] Empty states display properly
- [ ] Matches visual design
- [ ] Responsive on mobile
