# Spec Requirements: Cookbook Organization

## Initial Description

Users can create named cookbooks (e.g., "Weeknight Dinners", "Italian") and assign recipes to one or more cookbooks. Include cookbook list view and filtering.

**Source:** Product Roadmap - Week 1: Foundation and Core Flow (Feature #6)
**Effort Estimate:** Small (S) - 2-3 days
**Priority:** Medium - Enhances organization and user experience

## Requirements Discussion

### First Round Questions

**Q1:** Adding Recipes to Cookbooks - The tests mention "Add to Cookbook" button on recipe views. I assume this opens a modal/sheet showing all cookbooks with checkboxes, allowing users to add/remove the recipe from multiple cookbooks at once. Is that correct, or should it be a simpler single-selection flow?
**Answer:** Add to cookbook modal with checkboxes for multiple cookbooks at once.

**Q2:** Cover Image Selection - The CreateCookbookModal accepts a `coverUrl`. Which option(s) should we support: pick from recipe images, preset stock images, or custom upload?
**Answer:** Three options should be supported:
1. Auto-populate from cookbook's recipe images
2. Upload custom image
3. Gemini AI generation (similar to recipe placeholder generation)

**Q3:** Recently Added Behavior - The "Recently Added" built-in cookbook shows the 8 most recent recipes. Should users be able to manually remove recipes from it or configure how many it shows?
**Answer:** Purely automatic - system-managed, no manual control. Users cannot manually add/remove recipes or configure the count.

**Q4:** Favorites Behavior - Is "Favorites" automatic via heart button, or can users also manually add recipes directly from the cookbook view?
**Answer:** Automatic only - managed via favorite button on recipes. No manual adding from cookbook view.

**Q5:** Delete Confirmation - When deleting a cookbook, should we show a confirmation dialog clarifying recipes won't be deleted?
**Answer:** Yes - show dialog clarifying "This won't delete recipes, only the cookbook."

**Q6:** Drag-to-Reorder - Should drag-and-drop for manual ordering be implemented for the hackathon, or defer and rely on sort options only?
**Answer:** Yes - implement drag handles for manual recipe ordering within cookbooks.

**Q7:** Cookbook Limits - Should we have any limits (max cookbooks per user, max recipes per cookbook)?
**Answer:** No limits - unlimited cookbooks and recipes per cookbook.

**Q8:** Anything Out of Scope - Are there features visible in mockups we should exclude?
**Answer:** None - include everything shown in the mockups.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Cookbook UI Components - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/components/`
  - `Cookbooks.tsx` - Main list view with Quick Access section
  - `CookbookCard.tsx` - Individual cookbook card (grid/list views)
  - `CookbookDetail.tsx` - Cookbook contents view with sorting and multi-select
  - `CookbookRecipeCard.tsx` - Recipe card within cookbook with drag handle
- Data Types: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/types.ts`
- Core Data Model: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`
- Sample Data: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/data.json`
- Test Specifications: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/tests.md`
- Visual Mockups:
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/cookbooks-list.png`
  - `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/cookbooks/cookbook-detail.png`

**Components to potentially reuse:**
- Grid/list toggle pattern from Cookbooks.tsx
- Multi-select mode pattern from CookbookDetail.tsx
- Card hover actions pattern from CookbookCard.tsx

**Backend logic to reference:**
- Gemini AI generation for cover images (similar to recipe placeholder generation mentioned)

### Follow-up Questions

No follow-up questions needed - all requirements were clearly specified.

## Visual Assets

### Files Provided:
No additional visual assets provided in the spec planning folder.

### Existing Mockups Analyzed:
- `cookbooks-list.png`: Shows cookbook grid view with Quick Access section (Favorites, Recently Added) and My Cookbooks section. Includes "New Cookbook" button, grid/list toggle, and cookbook cards with cover images, names, descriptions, and recipe counts.
- `cookbook-detail.png`: Shows cookbook detail view with cover image header, back/share/edit buttons, cookbook info card, sort dropdown (Manual Order, Date Added, Alphabetical), grid/list toggle, Select mode, and recipe cards with source badges.

### Visual Insights:
- Orange accent color (#f97316) used throughout for primary actions
- Stone color palette for backgrounds and text
- Rounded corners (2xl) on cards and modals
- Sticky header pattern for controls
- Hover states reveal action buttons on cards
- Built-in badge styling for system cookbooks
- Recipe count badge on cookbook covers
- Source type indicators (YouTube, website, scanned, manual) on recipe cards

## Requirements Summary

### Functional Requirements

**Cookbook Management:**
- Create new cookbooks with name, description, and cover image
- Edit existing cookbook name, description, and cover image
- Delete custom cookbooks (with confirmation dialog)
- View cookbooks in grid or list layout
- Built-in cookbooks (Favorites, Recently Added) cannot be deleted

**Cover Image Options:**
1. Auto-populate from recipe images within the cookbook
2. Upload custom image from device
3. Generate image using Gemini AI (similar to existing recipe placeholder generation)

**Adding Recipes to Cookbooks:**
- "Add to Cookbook" button accessible from recipe detail/card views
- Modal displays all user cookbooks with checkboxes
- Multi-select allows adding recipe to multiple cookbooks at once
- Visual indicator shows which cookbooks already contain the recipe

**Removing Recipes from Cookbooks:**
- Remove individual recipe via X button on recipe card
- Multi-select mode for bulk removal
- Select All / Deselect All functionality
- Removal only removes from cookbook, not from recipe library

**Recipe Ordering within Cookbooks:**
- Drag-and-drop reordering via drag handles
- Position persisted in CookbookRecipe.position field
- Sort options: Manual Order, Date Added, Alphabetical
- Sort preference persisted per cookbook

**Built-in Cookbooks:**
- Favorites: Automatically managed via favorite button on recipes
- Recently Added: System-managed, shows most recent recipes (currently 8)
- Both are read-only (no manual add/remove from cookbook view)
- Can view contents and sort, but not modify membership

**View Controls:**
- Grid/List toggle for cookbook list view
- Grid/List toggle for cookbook detail view
- Sort dropdown for recipes within cookbook

### Reusability Opportunities

- Grid/list toggle component pattern
- Multi-select mode with Select All functionality
- Card with hover actions pattern
- Confirmation dialog component
- Modal with form inputs
- Drag-and-drop list/grid

### Scope Boundaries

**In Scope:**
- Full CRUD for custom cookbooks
- "Add to Cookbook" modal with multi-select
- Three cover image options (auto, upload, AI-generated)
- Drag-and-drop recipe reordering
- Grid/list view toggles
- Sort options (manual, date, alphabetical)
- Multi-select for bulk recipe removal
- Delete confirmation dialog
- Built-in cookbooks (Favorites, Recently Added)
- Share cookbook functionality (button exists in mockups)

**Out of Scope:**
- Nothing explicitly excluded - implement all features shown in mockups

### Technical Considerations

**Data Model (already defined):**
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

**Relationships:**
- Many-to-many: A recipe can belong to multiple cookbooks
- CookbookRecipe is a join entity with position for ordering
- Built-in cookbooks have `isBuiltIn: true` flag

**Tech Stack:**
- React Native + Expo (mobile app)
- Convex backend
- Gemini AI for cover image generation

**Integration Points:**
- Recipe detail view: Add "Add to Cookbook" button
- Recipe card: Add "Add to Cookbook" action in menu
- Favorites system: Connect to Favorites built-in cookbook
- Image upload: Device photo picker
- AI generation: Gemini API integration (similar to existing recipe placeholder generation)

**UI Components to Implement:**
- CreateCookbookModal
- EditCookbookModal
- AddToCookbookModal (new)
- DeleteConfirmationDialog
- CoverImagePicker (with three options)
- DraggableRecipeList/Grid
