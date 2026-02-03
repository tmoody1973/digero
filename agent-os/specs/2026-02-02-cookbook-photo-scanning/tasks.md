# Task Breakdown: Cookbook Photo Scanning

**KEY DIFFERENTIATOR** - This feature is critical for the hackathon demo and must be functional.

## Overview
Total Tasks: 6 Task Groups with 35+ Sub-tasks

**Effort Estimate:** Large (L) - 2 weeks
**Priority:** Critical - Must be functional for hackathon demo

## Task List

### Data Layer

#### Task Group 1: PhysicalCookbook Entity and Schema Extensions
**Dependencies:** None

- [x] 1.0 Complete data layer for cookbook scanning
  - [x] 1.1 Write 4-6 focused tests for PhysicalCookbook and Recipe scanning fields
    - Test PhysicalCookbook creation with required fields (name, userId, createdAt)
    - Test PhysicalCookbook with optional coverImageUrl (Convex storage ID)
    - Test Recipe creation with scannedFromBook reference
    - Test Recipe with pageNumber field for scanned recipes
    - Test linking multiple recipes to same PhysicalCookbook
  - [x] 1.2 Create PhysicalCookbook schema in Convex
    - Fields: `_id`, `name` (string), `coverImageUrl` (optional, Convex storage ID), `userId` (Id<"users">), `createdAt` (number)
    - Add index on userId for querying user's cookbooks
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`
  - [x] 1.3 Extend Recipe schema for scanning support
    - Add `scannedFromBook` field: `{ cookbookId: Id<"physicalCookbooks">, name: string, coverImageUrl?: string }`
    - Add `pageNumber` field (optional string, e.g., "42" or "pp. 42-43")
    - Ensure `source: 'scanned'` enum value exists
    - Reference existing Recipe type: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts`
  - [x] 1.4 Create ScanSession schema for tracking active sessions
    - Fields: `_id`, `userId`, `physicalCookbookId` (optional), `bookName`, `coverImageUrl` (optional), `isActive` (boolean), `startedAt`, `completedAt` (optional)
    - Add index on userId + isActive for finding active sessions
  - [x] 1.5 Set up Convex file storage configuration for images
    - Configure storage for cover photos and scanned page images
    - Implement image upload mutation with size validation (target under 2MB)
  - [x] 1.6 Ensure data layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify schemas compile correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- PhysicalCookbook entity can be created and queried
- Recipes can reference scannedFromBook with cookbook link
- Page numbers stored correctly for scanned recipes
- Cover images upload to Convex file storage
- The 4-6 tests written in 1.1 pass

---

### API Layer

#### Task Group 2: Convex Functions for Scanning and Gemini Integration
**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer for scanning operations
  - [x] 2.1 Write 5-8 focused tests for scanning API functions
    - Test createPhysicalCookbook mutation
    - Test startScanSession mutation
    - Test processRecipeImage action (mock Gemini response)
    - Test saveScannedRecipe mutation
    - Test completeScanSession mutation
    - Test multi-page merge logic
  - [x] 2.2 Create physicalCookbooks mutations
    - `createPhysicalCookbook`: Create new cookbook entity
    - `getOrCreateByName`: Find existing or create new cookbook by name + userId
    - `getUserCookbooks`: Query all cookbooks for a user
    - Follow Convex patterns for mutations and queries
  - [x] 2.3 Create scanSession mutations
    - `startSession`: Create new scan session, optionally link to PhysicalCookbook
    - `updateSession`: Update session with cover image or cookbook ID
    - `completeSession`: Mark session complete, update completedAt
    - `getActiveSession`: Get user's current active session if any
  - [x] 2.4 Implement Gemini OCR action for recipe extraction
    - Create Convex action `processRecipeImage` (actions can call external APIs)
    - Accept image data (base64 or storage ID)
    - Call Gemini Vision API with structured prompt
    - System prompt: "You are a recipe extraction assistant. Analyze this cookbook page image and extract recipe data in JSON format."
    - Request structured output: `{ title, ingredients: [{name, quantity, unit, category}], instructions: string[], servings, prepTime, cookTime, pageNumber }`
    - Handle edge cases: return `{ success: false, error: "reason" }` for non-recipe pages, poor quality
    - Keep API key in Convex environment variables
  - [x] 2.5 Implement Gemini action for cover name extraction
    - Create `extractCookbookName` action
    - Simple prompt: "Extract the cookbook title from this cover image. Return only the title text."
    - Return extracted name or null if not readable
  - [x] 2.6 Create multi-page merge utility function
    - Input: Array of extracted recipe data from multiple pages
    - Merge strategy:
      - Title: Use first non-empty value
      - Ingredients: Concatenate all lists (in scan order)
      - Instructions: Append in scan order
      - Servings/times: Use first non-empty values
      - Page numbers: Combine as range (e.g., "pp. 42-43")
    - Return single merged recipe object
  - [x] 2.7 Create saveScannedRecipe mutation
    - Accept extracted recipe data + session info
    - Link to PhysicalCookbook via scannedFromBook
    - Set source to 'scanned'
    - Store pageNumber field
    - Handle partial data gracefully
  - [x] 2.8 Ensure API layer tests pass
    - Run ONLY the 5-8 tests written in 2.1
    - Use mocked Gemini responses for testing
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- PhysicalCookbook CRUD operations work correctly
- Scan sessions can be created, updated, and completed
- Gemini API called successfully with proper error handling
- Multi-page recipes merge correctly
- Scanned recipes save with cookbook reference
- The 5-8 tests written in 2.1 pass

---

### Camera and Image Capture

#### Task Group 3: Camera Integration with expo-camera
**Dependencies:** Task Group 1

- [x] 3.0 Complete camera capture functionality
  - [x] 3.1 Write 3-5 focused tests for camera components
    - Test CameraViewfinder renders with frame overlay
    - Test capture button triggers callback with image data
    - Test camera guidance message display logic
    - Test image compression reduces file size
  - [x] 3.2 Set up expo-camera in the project
    - Install expo-camera package
    - Configure camera permissions in app.json
    - Handle permission request flow gracefully
  - [x] 3.3 Create CameraViewfinder component
    - Full-screen camera preview
    - Orange corner markers (frame overlay) matching mockup
    - Reference existing UI: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx` lines 172-177
    - Dark theme with stone-950 background
  - [x] 3.4 Implement real-time camera guidance feedback
    - Display guidance messages: "Hold steady", "Move closer", "Position page within frame"
    - Use device motion or simple heuristics for feedback
    - Position message above capture button
    - Hackathon scope: Basic feedback is acceptable, skip advanced blur/lighting detection
  - [x] 3.5 Implement image capture with compression
    - High-resolution capture for OCR quality
    - Compress image before upload (target under 2MB)
    - Use expo-image-manipulator or similar for compression
    - Return base64 or blob for API upload
  - [x] 3.6 Create capture button with visual feedback
    - Large orange circular button (matches mockup)
    - Active state animation (scale-95)
    - Disable during processing to prevent double-capture
  - [x] 3.7 Ensure camera tests pass
    - Run ONLY the 3-5 tests written in 3.1
    - Mock camera APIs for unit tests
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- Camera opens with proper permissions
- Frame overlay guides page positioning
- Real-time feedback messages display appropriately
- Images capture and compress to target size
- The 3-5 tests written in 3.1 pass

---

### Frontend Flow Components

#### Task Group 4: Scan Session UI Flow
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete scan session UI flow
  - [x] 4.1 Write 5-8 focused tests for scan session flow
    - Test ScanSessionModal opens from menu entry point
    - Test cover step with optional name input and skip functionality
    - Test transition from cover capture to scanning mode
    - Test processing state displays during Gemini extraction
    - Test review screen shows extraction summary
    - Test "This recipe continues" triggers multi-page flow
    - Test session complete screen shows all scanned recipes
  - [x] 4.2 Create ScanSessionModal component (modal wrapper)
    - Full-screen modal matching mockup design
    - X close button in header (top-left)
    - Dark theme (stone-950 background, orange-500 accents)
    - Manages step state: 'cover' | 'scanning' | 'processing' | 'review' | 'complete'
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx`
  - [x] 4.3 Implement Cover Step (initial screen)
    - Large book icon (amber-500 in rounded amber-500/20 container)
    - "Start with the Cover" heading with explanatory text
    - Text input for cookbook name with "(optional)" placeholder
    - "Capture Cover Photo" primary CTA button with camera icon
    - "Skip" option to proceed directly to recipe scanning
    - Match visual: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/scan-session.png`
  - [x] 4.4 Implement Scanning Step
    - Integrate CameraViewfinder component (from Task Group 3)
    - Show cover preview bar if cover was captured
    - Display count of recipes scanned in session
    - Large capture button (orange) centered at bottom
    - "Done" check button to finish scanning
  - [x] 4.5 Implement Processing Step
    - Sparkles icon with pulse animation in orange container
    - "Extracting Recipe" heading
    - "AI is reading the recipe..." text
    - Loading spinner (Loader2 with spin animation)
    - Call Gemini action and handle response
  - [x] 4.6 Implement Review Step with extraction summary
    - Success indicator (green checkmark)
    - Recipe title from extraction
    - Ingredient count and instruction count in stone-700 boxes
    - "Edit Details" button to open full edit form
    - "This recipe continues" option for multi-page recipes
    - "Scan Another Recipe" secondary CTA
    - "Done Scanning" primary CTA
  - [x] 4.7 Implement Multi-Page Recipe Flow
    - "This recipe continues" button after review
    - Return to camera for additional page capture
    - Track page sequence in state
    - Show page count indicator (e.g., "Page 2 of recipe")
    - Trigger multi-page merge when user confirms complete
  - [x] 4.8 Implement Complete Step
    - Large green checkmark in success container
    - "Scanning Complete!" heading
    - Summary: X recipes added from [Cookbook Name]
    - Cover image preview with gradient overlay
    - List of scanned recipes with titles
    - "Scan More from This Book" secondary action
    - "Done" primary CTA to close modal
  - [x] 4.9 Ensure UI flow tests pass
    - Run ONLY the 5-8 tests written in 4.1
    - Mock API calls for component tests
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- All scan session steps render correctly
- Navigation between steps works properly
- Cover capture is optional (can skip)
- Multi-page recipe flow tracks and merges pages
- Session summary displays all scanned recipes
- The 5-8 tests written in 4.1 pass

---

### Review and Edit Flow

#### Task Group 5: Recipe Review and Edit Screen
**Dependencies:** Task Groups 2, 4

- [x] 5.0 Complete recipe review and edit functionality
  - [x] 5.1 Write 4-6 focused tests for review/edit flow
    - Test extracted data populates edit form correctly
    - Test all fields are editable (title, ingredients, instructions)
    - Test ingredient editing (name, quantity, unit)
    - Test instruction reordering/editing
    - Test save triggers mutation with edited data
    - Test "Enter Manually" fallback navigates to manual entry with partial data
  - [x] 5.2 Create ScannedRecipeEditForm component
    - Reuse patterns from manual recipe creation form
    - Pre-populate with extracted data from Gemini
    - Editable fields:
      - Title (text input)
      - Ingredients list (add/edit/remove individual items)
      - Instructions list (add/edit/remove/reorder steps)
      - Servings (number input)
      - Prep time (number input, minutes)
      - Cook time (number input, minutes)
      - Notes (textarea)
      - Page number (display, non-editable)
    - Dark theme consistent with scan session
  - [x] 5.3 Implement ingredient editing interface
    - Each ingredient: name, quantity, unit, category
    - Inline editing or modal for each ingredient
    - Add new ingredient button
    - Delete ingredient button
    - Category dropdown with standard options
  - [x] 5.4 Implement instruction editing interface
    - Numbered step list
    - Text editing for each step
    - Add new step button
    - Delete step button
    - Drag-to-reorder functionality (nice-to-have for hackathon)
  - [x] 5.5 Implement error handling with manual fallback
    - Detect extraction failures from Gemini response
    - Display clear error message explaining issue
    - "Try Again" button to re-capture page
    - "Enter Manually" button to navigate to manual recipe creation
    - Pre-populate manual form with any partial extracted data
  - [x] 5.6 Implement save flow
    - "Save Recipe" button validates required fields
    - Calls saveScannedRecipe mutation
    - Links recipe to PhysicalCookbook
    - Shows success state before returning to session
  - [x] 5.7 Ensure review/edit tests pass
    - Run ONLY the 4-6 tests written in 5.1
    - Test form validation and submission
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- All extracted fields can be edited before saving
- Ingredient and instruction lists are fully editable
- Error states show clear messages with retry and manual fallback
- Manual fallback pre-populates with partial data
- Save completes and returns to scan session
- The 4-6 tests written in 5.1 pass

---

### Integration and Testing

#### Task Group 6: Integration, End-to-End Testing, and Polish
**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete integration and testing
  - [x] 6.1 Review all existing tests from Task Groups 1-5
    - Review 4-6 data layer tests (Task 1.1)
    - Review 5-8 API layer tests (Task 2.1)
    - Review 3-5 camera tests (Task 3.1)
    - Review 5-8 UI flow tests (Task 4.1)
    - Review 4-6 review/edit tests (Task 5.1)
    - Total existing tests: approximately 21-33 tests
  - [x] 6.2 Analyze critical workflow gaps
    - Full end-to-end: Open modal -> Capture cover -> Scan page -> Review -> Save -> Complete
    - Multi-page recipe: Capture page 1 -> Continue -> Capture page 2 -> Merge -> Save
    - Error recovery: Failed extraction -> Retry or Manual fallback
    - Session persistence: Start session -> Close app -> Resume session
  - [x] 6.3 Write up to 8 additional integration tests
    - Test complete single-page recipe scan flow (cover -> scan -> review -> save)
    - Test multi-page recipe merge produces correct combined recipe
    - Test skipping cover photo still creates valid cookbook entity
    - Test extraction failure shows error with retry and manual fallback options
    - Test multiple recipes in single session all save correctly
    - Test cookbook reuse when scanning from same book again
    - Add tests only for critical integration gaps identified
  - [x] 6.4 Integrate entry point in AddRecipeMenu
    - Add "Scan Cookbook" menu item with Camera icon
    - Use amber-500 color for scan-related actions
    - Include description text: "Scan pages from physical cookbooks"
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/AddRecipeMenu.tsx`
  - [x] 6.5 Verify PhysicalCookbook reuse flow
    - When user starts new session, show existing cookbooks to select
    - "Scan from Same Book" at session complete reuses current cookbook
    - New cookbook created only when scanning from different book
  - [x] 6.6 Polish UI and transitions
    - Smooth transitions between scan session steps
    - Loading states have appropriate animations
    - Error states are clear and actionable
    - Success states provide positive feedback
  - [x] 6.7 Run all feature-specific tests
    - Run ALL tests from Task Groups 1-5 plus new integration tests
    - Expected total: approximately 29-41 tests
    - Do NOT run unrelated application tests
    - Fix any failing tests before marking complete
  - [ ] 6.8 Manual QA checklist for hackathon demo
    - [ ] Camera opens and shows frame overlay
    - [ ] Cover photo captures and extracts cookbook name
    - [ ] Recipe page scans and extracts structured data
    - [ ] Multi-page recipe merges correctly
    - [ ] Edit form allows all field modifications
    - [ ] Save creates recipe with cookbook reference
    - [ ] Session complete shows all scanned recipes
    - [ ] Error states are clear and recoverable

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 29-41 total)
- End-to-end scanning flow works completely
- Multi-page recipes merge and save correctly
- Cookbook entity reuse works as expected
- Entry point accessible from AddRecipeMenu
- Manual QA checklist passes for hackathon demo

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Data Layer** - PhysicalCookbook entity and schema extensions
2. **Task Group 2: API Layer** - Convex functions and Gemini integration (can partially parallel with 3)
3. **Task Group 3: Camera** - expo-camera integration and image capture (can parallel with 2)
4. **Task Group 4: UI Flow** - Scan session modal and all step components
5. **Task Group 5: Review/Edit** - Recipe editing form and error handling
6. **Task Group 6: Integration** - Testing, polish, and hackathon demo prep

## Technical Notes

**Key Integration Points:**
- expo-camera for mobile camera access
- Convex file storage for cover and page images
- Convex actions for Gemini API calls (keeps API key secure)
- Gemini Vision API for OCR and structured extraction

**Gemini Prompt Structure:**
```
System: You are a recipe extraction assistant. Analyze this cookbook page image and extract recipe data in the following JSON format:
{
  "title": "Recipe Title",
  "ingredients": [{"name": "...", "quantity": 1, "unit": "cup", "category": "produce"}],
  "instructions": ["Step 1...", "Step 2..."],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "pageNumber": "42"
}
If this is not a recipe page or the image quality is too poor, return: {"success": false, "error": "reason"}
```

**Multi-Page Merge Strategy:**
- Title: First non-empty value across pages
- Ingredients: Concatenate all lists in scan order
- Instructions: Append in scan order
- Servings/times: First non-empty values
- Page numbers: Store as range (e.g., "pp. 42-43")

## File References

**Existing Code to Leverage:**
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx` - UI patterns and flow structure
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts` - Recipe and ScanSession types
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/AddRecipeMenu.tsx` - Entry point pattern
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts` - Core data types

**Visual References:**
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/scan-session.png` - Cover step design mockup

## Implementation Summary

### Files Created/Modified:

**Convex Backend:**
- `/Users/tarikmoody/Documents/Projects/digero/convex/schema.ts` - Updated with scanSessions table and pageNumber field on recipes
- `/Users/tarikmoody/Documents/Projects/digero/convex/physicalCookbooks.ts` - Added getOrCreateByName, generateUploadUrl, getPhysicalCookbookWithCover, getRecipesByPhysicalCookbook
- `/Users/tarikmoody/Documents/Projects/digero/convex/scanSessions.ts` - New file with session management mutations and queries
- `/Users/tarikmoody/Documents/Projects/digero/convex/recipes.ts` - Added saveScannedRecipe mutation
- `/Users/tarikmoody/Documents/Projects/digero/convex/actions/processRecipeImage.ts` - Gemini Vision API for recipe extraction
- `/Users/tarikmoody/Documents/Projects/digero/convex/actions/extractCookbookName.ts` - Gemini Vision API for cover name extraction
- `/Users/tarikmoody/Documents/Projects/digero/convex/lib/multiPageMerge.ts` - Multi-page recipe merge utility

**Frontend Components:**
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/` - New directory
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/types.ts` - Type definitions
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/CameraViewfinder.tsx` - Camera with frame overlay
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/CoverStep.tsx` - Cover capture step
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/ScanningStep.tsx` - Recipe scanning step
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/ProcessingStep.tsx` - AI processing step
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/ReviewStep.tsx` - Recipe review step
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/CompleteStep.tsx` - Session complete step
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/ScannedRecipeEditForm.tsx` - Full edit form
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/ScanSessionModal.tsx` - Main modal orchestrator
- `/Users/tarikmoody/Documents/Projects/digero/components/scanning/index.ts` - Exports

**App Routes:**
- `/Users/tarikmoody/Documents/Projects/digero/app/(app)/recipes/scan.tsx` - Scan screen entry point

**Tests:**
- `/Users/tarikmoody/Documents/Projects/digero/convex/__tests__/scanning.test.ts` - Comprehensive test suite

**Configuration:**
- `/Users/tarikmoody/Documents/Projects/digero/package.json` - Added expo-image-manipulator dependency
