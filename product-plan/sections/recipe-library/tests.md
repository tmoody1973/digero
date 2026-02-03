# Recipe Library Tests

Test specifications for the Recipe Library section.

## User Flow Tests

### Save Recipe from YouTube

1. Click "Add Recipe" FAB
2. Select "Search YouTube"
3. Enter search query, verify results display
4. Tap a video to preview extracted recipe
5. Confirm and save
6. **Assert:** Recipe appears in library with YouTube source indicator

### Save Recipe from URL

1. Click "Add Recipe" FAB
2. Select "Paste URL"
3. Enter valid recipe URL
4. Wait for AI extraction
5. Review and confirm
6. **Assert:** Recipe saved with website source

### View Recipe Detail

1. Tap a recipe card in the library
2. **Assert:** Detail view shows photo, ingredients, instructions, nutrition
3. **Assert:** Source badge displays correctly

### Scale Servings

1. Open a recipe detail view
2. Adjust serving slider (e.g., from 4 to 8)
3. **Assert:** All ingredient quantities double
4. Decrease servings back to 4
5. **Assert:** Quantities return to original

### Filter by Source

1. On recipe list, tap "YouTube" filter
2. **Assert:** Only YouTube recipes display
3. Tap "All" filter
4. **Assert:** All recipes display

### Search Recipes

1. Enter "chicken" in search bar
2. **Assert:** Only recipes with "chicken" in title or ingredients display
3. Clear search
4. **Assert:** All recipes display again

## Empty State Tests

### No Recipes

1. Start with empty library
2. **Assert:** Empty state displays with CTAs for import methods

### No Search Results

1. Search for "xyznonexistent"
2. **Assert:** "No recipes found" message displays

## Edge Cases

- Recipe with missing image should show placeholder
- Very long recipe titles should truncate properly
- Nutrition values of 0 should display correctly
