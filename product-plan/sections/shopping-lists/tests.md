# Shopping Lists Tests

Test specifications for the Shopping Lists section.

## User Flow Tests

### Generate from Meal Plan

1. Tap "From Meal Plan" quick action
2. Navigate to meal planner in selection mode
3. Select meals for the week
4. Tap "Shopping List" button
5. **Assert:** New list created with combined ingredients
6. **Assert:** Duplicate ingredients are combined and summed

### Check Off Items

1. Open an active shopping list
2. Tap checkbox on "Chicken breast"
3. **Assert:** Checkbox turns green, item shows strikethrough
4. **Assert:** Progress bar updates

### Auto-Archive on Completion

1. Open a list with few unchecked items
2. Check off all remaining items
3. **Assert:** Completion message displays
4. **Assert:** List moves to Archived section

### Add Custom Item

1. Open a shopping list
2. Tap "Add Item" button
3. Enter "Paper towels", quantity 1, unit "pack"
4. Select "Household" category
5. Tap "Add to List"
6. **Assert:** Custom item appears in Household category

### Edit Item Quantity

1. Tap edit button on an item
2. Change quantity from 2 to 4
3. Save changes
4. **Assert:** Item shows updated quantity

### Delete Item

1. Tap delete button on an item
2. Confirm deletion
3. **Assert:** Item removed from list

### Toggle View Mode

1. Open list detail in category view
2. Toggle to "By Recipe" view
3. **Assert:** Items regroup by recipe name
4. Toggle back to category view
5. **Assert:** Items regroup by aisle category

## Empty State Tests

### No Shopping Lists

1. Start with no lists
2. **Assert:** Empty state with quick action buttons

### Empty List

1. Create empty list manually
2. **Assert:** "No items" message with CTA to add

## Edge Cases

- Very long item names should truncate
- Progress bar should handle 0/0 items gracefully
- Archived lists should be read-only
