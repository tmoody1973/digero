# Specification: Cookbook Organization

## Goal

Enable users to create named cookbooks (e.g., "Weeknight Dinners", "Italian") and assign recipes to one or more cookbooks, with built-in quick access cookbooks (Favorites, Recently Added), flexible cover image options, and manual recipe ordering via drag-and-drop.

## User Stories

- As a user, I want to create custom cookbooks so that I can organize my recipes into meaningful collections
- As a user, I want to add a recipe to multiple cookbooks at once so that I can categorize recipes flexibly without duplicating them

## Specific Requirements

**Cookbook List View**
- Display two sections: "Quick Access" (built-in cookbooks) and "My Cookbooks" (user-created)
- Grid/list view toggle persisted in user preferences
- "New Cookbook" button in header and as dashed card in grid view
- Empty state with CTA when no user cookbooks exist
- Cookbook count displayed in header subtitle

**Built-in Cookbooks**
- "Favorites" cookbook automatically populated via favorite button on recipes
- "Recently Added" cookbook shows 8 most recent recipes, system-managed
- Both are read-only: users cannot manually add/remove recipes from cookbook view
- Built-in badge displayed on cards; delete option hidden for built-in cookbooks
- Users can view contents and sort, but not modify membership

**Create/Edit Cookbook Modal**
- Form fields: name (required), description (optional), cover image
- Cover image picker with three options: auto-populate from recipe images, upload from device, or generate via Gemini AI
- Validation: name must not be empty; max character limits for name (50) and description (200)
- Modal uses bottom sheet pattern on mobile, centered modal on tablet

**Cover Image Options**
- Auto-populate: select from recipe images already in the cookbook (default for new cookbooks shows placeholder)
- Upload: device photo picker integration via Expo ImagePicker
- AI-generated: Gemini API generates thematic food image based on cookbook name/description
- Loading state shown during AI generation; fallback to placeholder on error

**Add to Cookbook Modal**
- Triggered from recipe detail view or recipe card context menu
- Displays all user cookbooks with checkboxes for multi-select
- Visual indicator (checked) for cookbooks that already contain this recipe
- "Create New Cookbook" option at bottom of list
- Confirm button applies changes; cancel discards without saving

**Recipe Ordering within Cookbooks**
- Drag handles visible on recipe cards for manual reordering
- Position persisted in CookbookRecipe.position field
- Sort dropdown: Manual Order (default), Date Added, Alphabetical
- Sort preference persisted per cookbook
- Drag-and-drop only active when sort is set to "Manual Order"

**Remove Recipes from Cookbooks**
- Individual remove via X button on recipe card (hover/long-press to reveal)
- Multi-select mode for bulk removal with Select All/Deselect All
- Removal only removes cookbook association; recipe remains in library
- Built-in cookbooks do not show remove buttons

**Delete Cookbook Confirmation**
- Confirmation dialog required before deleting a cookbook
- Message clarifies: "This won't delete your recipes, only the cookbook collection"
- Only custom cookbooks can be deleted; delete option hidden for built-in

**Cookbook Detail View**
- Cover image header with gradient overlay
- Info card showing name, description, recipe count, built-in badge if applicable
- Sticky controls bar with sort dropdown, view toggle, and Select mode button
- Empty state with CTA to add recipes when cookbook is empty

## Visual Design

**`product-plan/sections/cookbooks/cookbooks-list.png`**
- Header with "Cookbooks" title, count subtitle, orange "New Cookbook" button
- Grid/List toggle buttons with orange active state
- Quick Access section with star icon, 2-column grid for Favorites and Recently Added
- My Cookbooks section with 3-column grid on wider screens
- Cookbook cards show cover image, recipe count badge, name, description, updated date
- Dashed "New Cookbook" placeholder card in grid view
- Hover states reveal edit, share, delete action buttons

**`product-plan/sections/cookbooks/cookbook-detail.png`**
- Full-width cover image with gradient overlay at top
- Floating back button and share/edit buttons on cover
- White info card overlapping cover with name, description, recipe count
- Sticky control bar with sort dropdown (Manual Order, Date Added, Alphabetical)
- Grid/list toggle in control bar, Select link on right
- Recipe cards with source type badges (YouTube, website, scanned, manual)
- 2-3 column responsive grid for recipes

## Existing Code to Leverage

**Cookbooks.tsx Component**
- Separates built-in and user cookbooks with filter function
- Implements grid/list view toggle pattern with orange active state
- Shows Quick Access and My Cookbooks sections; reuse section layout pattern
- Empty state component with icon, message, and CTA button
- Dashed "Add" card pattern for creating new cookbooks

**CookbookDetail.tsx Component**
- Multi-select mode state management with selectedRecipes array
- Select All/Deselect All toggle logic and handleToggleSelect function
- Sort dropdown with position/dateAdded/title options and sorting logic
- Cover image header with gradient overlay and floating action buttons
- Reuse sticky controls bar pattern and recipe grid/list rendering

**CookbookCard.tsx Component**
- Grid and list view variants with responsive layouts
- Hover-reveal action buttons (share, edit, delete) pattern
- Built-in badge styling and conditional delete button visibility
- Recipe count badge overlay on cover image
- Date formatting utility function

**CookbookRecipeCard.tsx Component**
- Source type icons mapping for youtube/website/scanned/manual
- Selection checkbox and overlay styling for multi-select mode
- Drag handle element (horizontal lines icon) for reordering
- Remove button with hover reveal and red color treatment
- Grid and list view variants with appropriate layouts

**RecipePreviewModal.tsx Component**
- Modal overlay pattern with backdrop blur and click-to-close
- Sticky header with icon, title, and close button
- Sticky footer with cancel and confirm action buttons
- Responsive animation (slide-in-from-bottom on mobile, zoom on desktop)
- Reuse this pattern for Create/Edit Cookbook and Add to Cookbook modals

## Out of Scope

- Collaborative cookbooks or sharing cookbooks with other users (share button present but sharing flow deferred)
- Cookbook folders or nested organization of cookbooks
- Importing/exporting cookbooks
- Cookbook templates or pre-made cookbook suggestions
- Recipe tags or labels separate from cookbooks
- Smart cookbooks with auto-population rules beyond Favorites and Recently Added
- Cookbook cover image cropping or editing after selection
- Cookbook duplication feature
- Public cookbook discovery or browsing other users' cookbooks
- Cookbook statistics or analytics beyond recipe count
