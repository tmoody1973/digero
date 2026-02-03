# Meal Planner Tests

Test specifications for the Meal Planner section.

## User Flow Tests

### Add Recipe to Meal Slot

1. Tap empty breakfast slot on Monday
2. Recipe picker opens
3. Tap a recipe (e.g., "Overnight Oats")
4. **Assert:** Recipe appears in Monday breakfast slot
5. **Assert:** Recipe shows title and image thumbnail

### Navigate Weeks

1. Note current week dates
2. Tap right arrow (next week)
3. **Assert:** Calendar updates to show next week's dates
4. Tap "Today" button
5. **Assert:** Returns to current week

### Remove Meal from Slot

1. Tap a filled meal slot
2. Tap "Remove" option
3. **Assert:** Slot returns to empty state

### Clear Day

1. Add multiple meals to Monday
2. Tap "Clear Day" for Monday
3. **Assert:** All Monday slots become empty
4. **Assert:** Other days unaffected

### Generate Shopping List

1. Add meals to multiple days
2. Tap "Shop" button to enter selection mode
3. Select individual meals or "Select all" per day
4. Tap "Shopping List (X)" button
5. **Assert:** Navigates to Shopping Lists with new list created
6. **Assert:** List contains ingredients from selected meals

## Empty State Tests

### Empty Week

1. View a week with no planned meals
2. **Assert:** All slots show empty state with + icons
3. **Assert:** Helpful message displays

### No Recipes to Pick

1. With empty recipe library
2. Tap an empty slot
3. **Assert:** Recipe picker shows empty state with CTA to save recipes

## Edge Cases

- Long recipe names should truncate in slot cards
- Week navigation should handle year boundaries
- Selecting many meals should update count in button
