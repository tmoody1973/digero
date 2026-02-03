# Cookbooks Tests

Test specifications for the Cookbooks section.

## User Flow Tests

### Create a Cookbook

1. Tap "New Cookbook" button
2. Enter name and select cover photo
3. Tap "Create"
4. **Assert:** New cookbook appears in list
5. **Assert:** Cookbook is empty with CTA to add recipes

### Add Recipe to Cookbook

1. View a recipe in the library
2. Tap "Add to Cookbook" button
3. Select one or more cookbooks from list
4. **Assert:** Recipe added to selected cookbooks
5. View the cookbook
6. **Assert:** Recipe appears in cookbook

### Remove Recipe from Cookbook

1. Open a cookbook with recipes
2. Tap remove button on a recipe
3. **Assert:** Recipe removed from cookbook
4. **Assert:** Recipe still exists in library

### View Built-in Cookbooks

1. Open Cookbooks section
2. **Assert:** Favorites and Recently Added appear in Quick Access
3. **Assert:** Built-in cookbooks cannot be deleted

### Sort Cookbook Recipes

1. Open a cookbook with multiple recipes
2. Change sort to "Alphabetical"
3. **Assert:** Recipes reorder alphabetically
4. Change sort to "Date Added"
5. **Assert:** Recipes reorder by date

## Empty State Tests

### No Custom Cookbooks

1. With no user cookbooks
2. **Assert:** Quick Access shows built-in cookbooks
3. **Assert:** My Cookbooks section shows empty state with CTA

### Empty Cookbook

1. Create new cookbook
2. View it immediately
3. **Assert:** "No recipes yet" message with CTA to add

## Edge Cases

- Cookbook with very long name should truncate
- Cover image should crop/scale correctly
- Recipe count should update when adding/removing
