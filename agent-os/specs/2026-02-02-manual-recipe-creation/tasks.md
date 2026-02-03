# Task Breakdown: Manual Recipe Creation

## Overview
Total Tasks: 38 sub-tasks across 6 task groups

## Task List

### Form Infrastructure

#### Task Group 1: Form Shell and Navigation
**Dependencies:** None

- [x] 1.0 Complete form infrastructure and navigation
  - [x] 1.1 Write 4-6 focused tests for form infrastructure
    - Test form opens as full-screen modal from AddRecipeMenu
    - Test cancel with empty form closes without confirmation
    - Test cancel with data shows confirmation dialog
    - Test save button disabled when required fields empty
    - Test successful save navigates to RecipeDetail
  - [x] 1.2 Create ManualRecipeForm component shell
    - Full-screen modal that slides up from bottom
    - Header with "Create Recipe" title
    - Cancel button (X) in header
    - Save button in header (disabled by default)
    - Scrollable content area for form fields
    - Follow existing modal patterns in codebase
  - [x] 1.3 Wire up AddRecipeMenu integration
    - Connect `onManualEntry` callback to open ManualRecipeForm
    - Pass necessary props for user context
  - [x] 1.4 Implement form state management
    - Track dirty state (data entered) for cancel confirmation
    - Track validation state for save button enable/disable
    - Use local state management (lift only when necessary per component standards)
  - [x] 1.5 Implement cancel confirmation dialog
    - Show confirmation only when form has data entered
    - "Discard changes?" with Cancel and Discard buttons
    - Discard closes form, Cancel returns to form
  - [x] 1.6 Ensure form infrastructure tests pass
    - Run ONLY the tests written in 1.1
    - Verify modal opens/closes correctly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- Form opens as full-screen modal from AddRecipeMenu
- Cancel with data shows confirmation, empty form closes directly
- Save button enables/disables based on validation state
- Form scrolls vertically on mobile screens

---

### Form Input Components

#### Task Group 2: Title and Metadata Fields
**Dependencies:** Task Group 1

- [x] 2.0 Complete title and metadata input components
  - [x] 2.1 Write 4-6 focused tests for title and metadata fields
    - Test title validation (required, max 200 chars)
    - Test character count indicator updates correctly
    - Test servings accepts integers 1-99 only
    - Test prep/cook time accepts positive integers only
    - Test difficulty segmented control toggles correctly
  - [x] 2.2 Create TitleInput component
    - Text input with placeholder "Recipe title"
    - Character count indicator (e.g., "45/200")
    - Inline validation error display below field
    - Required field indicator
    - Style: consistent with existing input patterns (rounded corners, stone palette)
  - [x] 2.3 Create MetadataFields component group
    - Servings: Number input, placeholder "4", integer 1-99 validation
    - Prep Time: Number input in minutes, placeholder "15", positive integer
    - Cook Time: Number input in minutes, placeholder "30", positive integer
    - All fields optional with clear placeholders
  - [x] 2.4 Create CuisineInput component
    - Text input with dropdown suggestions (Italian, Mexican, Asian, American, Indian, Mediterranean, French, Japanese, Thai, Chinese)
    - Allow custom text entry
    - Optional field
  - [x] 2.5 Create DifficultySelector component
    - Segmented control with 3 options: Easy, Medium, Hard
    - Single selection toggle behavior
    - Visual highlight for selected option (orange accent)
    - Optional field (default: none selected)
  - [x] 2.6 Create NotesInput component
    - Multi-line text area for tips or variations
    - Placeholder: "Add notes, tips, or variations..."
    - Optional field with no character limit
  - [x] 2.7 Ensure title and metadata tests pass
    - Run ONLY the tests written in 2.1
    - Verify validation rules work correctly

**Acceptance Criteria:**
- Title shows validation errors inline and updates character count
- Metadata fields accept only valid input types
- Difficulty selector has clear visual feedback
- All fields follow mobile-first responsive design

---

#### Task Group 3: Ingredient Entry System
**Dependencies:** Task Group 1

- [x] 3.0 Complete structured ingredient entry system
  - [x] 3.1 Write 4-6 focused tests for ingredient entry
    - Test adding new ingredient row
    - Test deleting ingredient row (cannot delete last)
    - Test ingredient validation (non-empty name required)
    - Test unit dropdown selection
    - Test category dropdown selection
  - [x] 3.2 Create IngredientRow component
    - 4 fields in row: Quantity (number), Unit (dropdown/text), Name (text), Category (dropdown)
    - Delete button (X) - hidden if only row remaining
    - Drag handle for reordering (left side)
    - Compact mobile-friendly layout
  - [x] 3.3 Implement Unit dropdown
    - Options: cup, tbsp, tsp, oz, lb, piece, clove, bunch, can, package
    - Allow custom text entry for unlisted units
    - Style consistent with other dropdowns
  - [x] 3.4 Implement Category dropdown
    - Options from type: meat, produce, dairy, pantry, spices, condiments, bread, other
    - Default to "other" if not selected
    - Match existing Ingredient interface category type
  - [x] 3.5 Create IngredientList container component
    - Manages array of ingredient rows
    - "Add Ingredient" button appends new empty row
    - Minimum 1 ingredient always visible
    - Drag-and-drop reordering functionality
  - [x] 3.6 Implement ingredient validation
    - At least 1 ingredient required
    - Each ingredient must have non-empty name
    - Validation state propagates to parent form
  - [x] 3.7 Ensure ingredient entry tests pass
    - Run ONLY the tests written in 3.1
    - Verify add/delete/reorder works correctly

**Acceptance Criteria:**
- Users can add, delete, and reorder ingredient rows
- Cannot delete the last ingredient row
- Unit and category dropdowns work with all options
- Validation prevents save without valid ingredient

---

#### Task Group 4: Instruction Entry and Bulk Paste
**Dependencies:** Task Group 1

- [x] 4.0 Complete instruction entry with bulk paste feature
  - [x] 4.1 Write 4-6 focused tests for instruction entry
    - Test adding new instruction step
    - Test deleting instruction step (cannot delete last)
    - Test bulk paste modal opens/closes
    - Test bulk paste parses numbered steps correctly
    - Test step numbers auto-update after reorder
  - [x] 4.2 Create InstructionStep component
    - Step number badge (1, 2, 3...)
    - Multi-line text area for instruction text
    - Delete button (X) - hidden if only step remaining
    - Drag handle for reordering
  - [x] 4.3 Create InstructionList container component
    - Manages array of instruction steps
    - "Add Step" button appends new empty step
    - "Bulk Paste" button opens BulkPasteModal
    - Minimum 1 step always visible
    - Step numbers auto-update on reorder
  - [x] 4.4 Create BulkPasteModal component
    - Large text area for pasting multi-step instructions
    - Parse button processes pasted text
    - Cancel button returns without changes
    - Modal overlay with slide-up animation
  - [x] 4.5 Implement bulk paste parsing logic
    - Detect numbered patterns: `1. Step`, `1) Step`, `1: Step`
    - Regex: `/(?:^|\n)\s*\d+[\.\)\:]\s*/` to split at number boundaries
    - Fallback: split on double newlines if no numbered pattern
    - Filter empty strings from results
  - [x] 4.6 Create BulkPastePreview component
    - Shows each detected step as editable card
    - User can edit individual steps before confirming
    - Confirm button adds all parsed steps to instruction list
    - Cancel returns to text area for re-editing
  - [x] 4.7 Implement instruction validation
    - At least 1 instruction required
    - Each instruction must have non-empty text
    - Validation state propagates to parent form
  - [x] 4.8 Ensure instruction entry tests pass
    - Run ONLY the tests written in 4.1
    - Verify bulk paste parsing works correctly

**Acceptance Criteria:**
- Users can add, delete, and reorder instruction steps
- Bulk paste correctly parses numbered steps
- Preview allows editing before confirming
- Step numbers auto-update after any reorder

---

### Specialized Features

#### Task Group 5: Image Handling and AI Generation
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete image capture, selection, and AI placeholder generation
  - [x] 5.1 Write 4-6 focused tests for image handling
    - Test camera button triggers expo-camera
    - Test gallery button triggers expo-image-picker
    - Test selected image displays as preview
    - Test remove button clears selected image
    - Test AI placeholder generation triggers when no image on save
  - [x] 5.2 Create ImageSelector component
    - Placeholder preview area at top of form
    - Camera button (triggers expo-camera)
    - Gallery button (triggers expo-image-picker)
    - Preview of selected image with remove (X) button
    - Style: rounded corners, stone palette, consistent with app design
  - [x] 5.3 Implement expo-camera integration
    - Request camera permissions
    - Capture photo and return as image URI
    - Handle permission denied gracefully
  - [x] 5.4 Implement expo-image-picker integration
    - Request gallery permissions
    - Select image and return as image URI
    - Handle permission denied gracefully
  - [x] 5.5 Create Convex mutation for recipe creation
    - Accept all recipe fields matching Recipe interface
    - Set `source: 'manual'`, `sourceUrl: null`, `youtubeVideoId: null`
    - Auto-generate `createdAt` timestamp server-side
    - Associate recipe with authenticated user via Clerk
    - Return created recipe ID for navigation
  - [x] 5.6 Implement Convex file storage for images
    - Upload user-provided image to Convex file storage
    - Return imageUrl for recipe association
    - Handle upload errors gracefully
  - [x] 5.7 Create Convex serverless function for AI placeholder
    - Accept recipe title and first 3-5 ingredient names
    - Call Gemini API for food photography style image
    - Store generated image in Convex file storage
    - Return imageUrl for recipe association
    - Async/non-blocking (recipe saves immediately, image updates later)
  - [x] 5.8 Implement loading state for AI generation
    - Show loading indicator while generating
    - Update recipe image when generation completes
    - Handle generation failure gracefully (recipe still valid without image)
  - [x] 5.9 Ensure image handling tests pass
    - Run ONLY the tests written in 5.1
    - Verify camera/gallery integration works

**Acceptance Criteria:**
- Users can capture or select images
- Images upload to Convex file storage on save
- AI placeholder generates when no user image provided
- Recipe saves and navigates even while AI image generates async

---

#### Task Group 6: Dietary Tags and Nutrition
**Dependencies:** Task Group 1

- [x] 6.0 Complete dietary tags and nutrition input
  - [x] 6.1 Write 4-6 focused tests for dietary tags and nutrition
    - Test dietary tag toggle on/off
    - Test multiple tags can be selected
    - Test nutrition fields accept non-negative numbers only
    - Test nutrition fields are optional (can be empty)
  - [x] 6.2 Create DietaryTagSelector component
    - Multi-select chip list with toggle behavior
    - Options: vegetarian, vegan, gluten-free, dairy-free, nut-free, low-carb, keto, paleo
    - Selected tags highlighted with checkmark
    - Horizontal scrollable or wrap layout
    - Output: array of strings
  - [x] 6.3 Create NutritionInputs component
    - 4 number inputs: Calories (kcal), Protein (g), Carbs (g), Fat (g)
    - All fields optional
    - Non-negative validation (reject negative numbers)
    - Compact grid layout for mobile
    - Match Nutrition interface structure
  - [x] 6.4 Integrate tags and nutrition with form state
    - Dietary tags stored as string array
    - Nutrition stored as Nutrition object (or null if all empty)
    - Values included in save mutation
  - [x] 6.5 Ensure dietary and nutrition tests pass
    - Run ONLY the tests written in 6.1
    - Verify toggle behavior and validation

**Acceptance Criteria:**
- Dietary tags toggle on/off with visual feedback
- Multiple tags can be selected simultaneously
- Nutrition fields validate non-negative numbers
- All values correctly included in saved recipe

---

### Integration and Testing

#### Task Group 7: Form Integration and Final Validation
**Dependencies:** Task Groups 1-6

- [x] 7.0 Complete form integration and validation
  - [x] 7.1 Assemble complete ManualRecipeForm
    - Integrate all components in scrollable form layout
    - Order: Image, Title, Ingredients, Instructions, Servings/Times, Cuisine/Difficulty, Dietary Tags, Nutrition, Notes
    - Section headers for visual grouping
    - Consistent spacing (gap-3, gap-4, py-3, px-4 patterns)
  - [x] 7.2 Implement complete form validation
    - Client-side validation for immediate feedback
    - Title: required, non-empty, max 200 chars
    - Ingredients: min 1 with non-empty name
    - Instructions: min 1 with non-empty text
    - Servings: if provided, integer 1-99
    - Prep/Cook time: if provided, positive integer
    - Nutrition: if provided, non-negative numbers
    - Enable save button only when all validations pass
  - [x] 7.3 Implement save flow
    - Collect all form data into Recipe interface format
    - Upload image to Convex if provided
    - Call Convex mutation to create recipe
    - Trigger AI placeholder if no image
    - Handle save errors with user feedback
  - [x] 7.4 Implement navigation after save
    - On successful save, navigate to RecipeDetail view
    - Pass new recipe ID to RecipeDetail
    - Optimistic UI update for responsive feel
  - [x] 7.5 Apply dark mode support
    - Add dark: variants for all components
    - Test light and dark mode appearance
    - Ensure contrast meets accessibility standards

**Acceptance Criteria:**
- Complete form renders with all sections
- Validation prevents invalid saves
- Successful save creates recipe and navigates to detail
- Dark mode works correctly throughout

---

### Testing

#### Task Group 8: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-7

- [x] 8.0 Review existing tests and fill critical gaps only
  - [x] 8.1 Review tests from Task Groups 1-7
    - Review tests from form infrastructure (Task 1.1)
    - Review tests from title/metadata (Task 2.1)
    - Review tests from ingredients (Task 3.1)
    - Review tests from instructions (Task 4.1)
    - Review tests from images/AI (Task 5.1)
    - Review tests from dietary/nutrition (Task 6.1)
    - Total existing tests: approximately 24-36 tests
  - [x] 8.2 Analyze test coverage gaps for this feature only
    - Identify critical end-to-end workflows lacking coverage
    - Focus on integration points between components
    - Prioritize complete user journeys over unit test gaps
    - Do NOT assess entire application test coverage
  - [x] 8.3 Write up to 10 additional strategic tests maximum
    - End-to-end: Complete recipe creation flow (fill all fields, save, verify navigation)
    - End-to-end: Minimal recipe creation (title, 1 ingredient, 1 instruction)
    - Integration: Bulk paste to instruction list integration
    - Integration: Image selection to preview to save
    - Integration: Form validation blocking save
    - Focus on behavior, not implementation details per testing standards
  - [x] 8.4 Run feature-specific tests only
    - Run ONLY tests related to Manual Recipe Creation feature
    - Expected total: approximately 34-46 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical user journeys have test coverage
- No more than 10 additional tests added to fill gaps
- Testing focused exclusively on Manual Recipe Creation feature

---

## Execution Order

Recommended implementation sequence:

1. **Form Infrastructure** (Task Group 1) - Foundation for all other groups
2. **Title and Metadata Fields** (Task Group 2) - Can proceed in parallel with 3, 4, 6
3. **Ingredient Entry System** (Task Group 3) - Can proceed in parallel with 2, 4, 6
4. **Instruction Entry and Bulk Paste** (Task Group 4) - Can proceed in parallel with 2, 3, 6
5. **Dietary Tags and Nutrition** (Task Group 6) - Can proceed in parallel with 2, 3, 4
6. **Image Handling and AI Generation** (Task Group 5) - Requires backend integration
7. **Form Integration and Final Validation** (Task Group 7) - Requires all input components
8. **Test Review and Gap Analysis** (Task Group 8) - Final testing phase

**Parallel Execution Opportunities:**
- Task Groups 2, 3, 4, and 6 can be developed in parallel after Task Group 1 completes
- Task Group 5 can begin backend work (Convex mutations) while frontend components are being built

---

## Technical Notes

**Tech Stack (from requirements):**
- React Native with Expo
- Convex for backend and data storage
- Clerk for user authentication
- Gemini API for AI placeholder image generation
- expo-camera for photo capture
- expo-image-picker for gallery selection

**Key Interfaces to Match:**
- `Recipe` interface from `/product-plan/sections/recipe-library/types.ts`
- `Ingredient` interface with: name, quantity, unit, category
- `Nutrition` interface with: calories, protein, carbs, fat
- Category type: 'meat' | 'produce' | 'dairy' | 'pantry' | 'spices' | 'condiments' | 'bread' | 'other'

**Visual Design Guidelines:**
- Stone color palette with orange accent colors
- Rounded corners (rounded-xl, rounded-2xl)
- Dark mode support with dark: variants
- Consistent spacing patterns (gap-3, gap-4, py-3, px-4)
- Font weights: semibold for labels, medium for buttons
