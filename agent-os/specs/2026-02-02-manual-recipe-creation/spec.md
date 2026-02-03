# Specification: Manual Recipe Creation

## Goal

Build a full-screen recipe creation form allowing users to manually enter all recipe details (title, structured ingredients, step-by-step instructions, nutrition, dietary tags, and more) with support for bulk instruction paste, AI-generated placeholder images via Gemini, and navigation to the new recipe's detail view after save.

## User Stories

- As a user, I want to manually create a recipe from scratch so that I can add my own recipes that are not from YouTube, websites, or cookbooks.
- As a user, I want to paste a block of numbered instructions and have them automatically split into individual steps so that I can quickly enter recipes without typing each step individually.

## Specific Requirements

**Full-Screen Recipe Creation Form**
- Opens as a full-screen modal that slides up from the AddRecipeMenu's "Manual Entry" option
- Form scrolls vertically to accommodate all fields on mobile screens
- Header includes "Create Recipe" title, cancel button (X), and save button
- Cancel triggers confirmation dialog if any data has been entered
- Save button disabled until required fields are valid

**Title Input Field**
- Required field with non-empty string validation
- Maximum 200 characters with character count indicator
- Placeholder text: "Recipe title"
- Validation error appears inline below field

**Structured Ingredient Entry**
- Minimum 1 ingredient required with non-empty name
- Each ingredient row has 4 fields: Quantity (number), Unit (dropdown/text), Name (text), Category (dropdown)
- Unit options: cup, tbsp, tsp, oz, lb, piece, clove, bunch, can, package, or custom text
- Category options match existing type: meat, produce, dairy, pantry, spices, condiments, bread, other
- Add ingredient button appends new empty row
- Each row has delete button (X) and drag handle for reordering
- At least one ingredient row always visible (cannot delete last row)

**Instruction Steps Entry**
- Minimum 1 instruction step required with non-empty text
- Each step is a multi-line text area with step number badge
- Add Step button appends new empty step
- Bulk Paste button opens modal for pasting multiple steps at once
- Each step has delete button and drag handles for reordering
- Step numbers auto-update after reordering

**Bulk Paste Instruction Parsing**
- Modal with large text area for pasting multi-step instructions
- Parse button processes pasted text and shows preview of detected steps
- Detect numbered patterns: `1. Step`, `1) Step`, `1: Step`
- Regex pattern: `/(?:^|\n)\s*\d+[\.\)\:]\s*/` to split at number boundaries
- Fallback: split on double newlines if no numbered pattern detected
- Preview shows each detected step as editable card before confirming
- Confirm button adds all parsed steps to instruction list
- Cancel returns to form without changes

**AI Placeholder Image Generation**
- When saving without user-provided image, trigger Gemini API call via Convex serverless function
- Pass recipe title and first 3-5 ingredient names to Gemini
- Request appetizing, realistic food photography style image
- Store generated image in Convex file storage
- Associate imageUrl with saved recipe
- Show loading indicator during generation (async, non-blocking for save)
- User can later replace placeholder with own photo from RecipeDetail

**Camera and Gallery Image Selection**
- Optional image at top of form with placeholder preview area
- Camera button triggers expo-camera for photo capture
- Gallery button triggers expo-image-picker for selection
- Selected image displays as preview with remove (X) button
- Images stored in Convex file storage on save

**Optional Metadata Fields**
- Servings: Number input, integer 1-99, placeholder "4"
- Prep Time: Number input in minutes, positive integer, placeholder "15"
- Cook Time: Number input in minutes, positive integer, placeholder "30"
- Cuisine Type: Text input or dropdown with common options (Italian, Mexican, Asian, American, etc.)
- Difficulty: Segmented control with easy, medium, hard options
- Notes: Multi-line text area for tips or variations

**Dietary Tags Selection**
- Multi-select chip list with toggle behavior
- Options: vegetarian, vegan, gluten-free, dairy-free, nut-free, low-carb, keto, paleo
- Selected tags highlighted with checkmark
- Stored as array of strings in recipe

**Nutrition Input Fields**
- Optional section with 4 number inputs: Calories (kcal), Protein (g), Carbs (g), Fat (g)
- All values must be non-negative if provided
- Manual entry only (no auto-calculation in this spec)

**Form Validation Rules**
- Title: Required, non-empty, max 200 chars
- Ingredients: At least 1 with non-empty name field
- Instructions: At least 1 with non-empty text
- Servings: If provided, integer 1-99
- Prep/Cook Time: If provided, positive integer
- Nutrition values: If provided, non-negative numbers
- Client-side validation for immediate feedback, server-side validation in Convex mutation

**Data Persistence and Save Flow**
- Recipe saves via Convex mutation with `source: 'manual'`
- `sourceUrl` and `youtubeVideoId` set to null for manual recipes
- `createdAt` timestamp auto-generated server-side
- Recipe associated with authenticated user via Clerk auth token
- After successful save, navigate to RecipeDetail view for new recipe
- Optimistic UI update recommended for responsive feel

## Visual Design

No mockups provided. Implementation should follow existing app patterns established in RecipeDetail and RecipeCard components:
- Stone color palette with orange accent colors
- Rounded corners (rounded-xl, rounded-2xl) on cards and inputs
- Dark mode support with dark: variants
- Consistent spacing (gap-3, gap-4, py-3, px-4 patterns)
- Font weights: semibold for labels, medium for buttons

## Existing Code to Leverage

**`/product-plan/sections/recipe-library/types.ts` - Recipe and Ingredient interfaces**
- Use exact Ingredient interface: name, quantity, unit, category (with specific category union type)
- Use exact Recipe interface for output: source, sourceUrl, youtubeVideoId, imageUrl, servings, prepTime, cookTime, ingredients, instructions, nutrition, notes, createdAt
- Nutrition interface with calories, protein, carbs, fat fields

**`/product-plan/sections/recipe-library/components/AddRecipeMenu.tsx` - Entry point**
- Already has `onManualEntry` callback prop defined
- Menu item styling pattern with icon, label, description layout
- Green color (`text-green-500`) already assigned to Manual Entry option

**`/product-plan/sections/recipe-library/components/RecipeDetail.tsx` - Navigation target**
- Target view after save; component already exists with RecipeDetailProps
- NutritionBadge sub-component pattern for displaying nutrition info
- Ingredient display pattern with quantity, unit, name in rows
- Instruction display with numbered step badges

**`/product-plan/data-model/types.ts` - Core data model**
- Canonical type definitions that match recipe-library types
- Category union type for ingredients to reuse in form dropdown
- Nutrition interface structure for form input fields

## Out of Scope

- Draft/auto-save functionality (save and done only for MVP)
- Recipe duplication or cloning from existing recipes
- Import from external sources (YouTube, websites, scan - handled by separate features)
- Automatic nutrition calculation from ingredients
- Recipe sharing functionality
- Recipe editing after creation (separate edit feature)
- Offline support for form or image storage
- Voice input for recipe entry
- Ingredient auto-complete from database
- Undo/redo functionality in form
