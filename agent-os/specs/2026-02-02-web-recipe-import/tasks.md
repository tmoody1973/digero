# Task Breakdown: Web Recipe Import

## Overview
Total Tasks: 32
Feature enables users to import recipes from any website URL through two entry points (in-app paste modal and iOS Share Sheet), using a hybrid extraction strategy (structured data parsing with Gemini AI fallback), and a smart review flow before saving.

## Task List

### Backend Layer

#### Task Group 1: Convex Actions for URL Fetching and Parsing
**Dependencies:** None

- [x] 1.0 Complete URL fetching and structured data parsing backend
  - [x] 1.1 Write 2-6 focused tests for URL fetching and parsing
    - Test successful URL fetch with mock HTML response
    - Test JSON-LD Recipe schema extraction
    - Test timeout handling (30-second limit)
    - Test invalid URL rejection
    - Mock external HTTP requests to avoid network dependencies
  - [x] 1.2 Create Convex action `fetchRecipeUrl`
    - Accept URL string as input parameter
    - Validate URL format (HTTP/HTTPS) server-side
    - Set User-Agent header to avoid bot blocking (e.g., Mozilla/5.0 compatible)
    - Implement 30-second timeout for URL fetch
    - Return HTML content or error object with specific error type
  - [x] 1.3 Create utility function `parseJsonLdRecipe`
    - Extract JSON-LD script tags from HTML string
    - Parse for Schema.org Recipe type (`@type: "Recipe"`)
    - Map Schema.org properties to app Recipe interface
    - Return parsed recipe data or null if not found
  - [x] 1.4 Create utility function `parseMicrodataRecipe`
    - Parse microdata/RDFa Recipe markup as fallback
    - Look for itemtype="http://schema.org/Recipe"
    - Map extracted properties to app Recipe interface
    - Return parsed recipe data or null if not found
  - [x] 1.5 Create Convex action `extractRecipeFromUrl`
    - Orchestrate fetch -> parse JSON-LD -> parse microdata -> return result
    - Include extraction method in response ('jsonld' | 'microdata' | 'none')
    - Return structured result with recipe data and confidence indicators
  - [x] 1.6 Ensure backend URL parsing tests pass
    - Run ONLY the 2-6 tests written in 1.1
    - Verify all parsing utilities work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 1.1 pass
- URL fetching handles timeouts and errors gracefully
- JSON-LD parsing extracts Recipe schema data correctly
- Microdata parsing works as fallback
- Server-side URL validation prevents malformed requests

---

#### Task Group 2: Gemini AI Extraction Integration
**Dependencies:** Task Group 1

- [x] 2.0 Complete Gemini AI extraction backend
  - [x] 2.1 Write 2-6 focused tests for Gemini extraction
    - Test Gemini prompt returns structured JSON matching Recipe interface
    - Test ingredient categorization output (meat, produce, dairy, pantry, spices, condiments, bread, other)
    - Test confidence score inclusion in response
    - Test 60-second timeout handling
    - Mock Gemini API responses
  - [x] 2.2 Create Gemini extraction prompt template
    - Define structured prompt for recipe extraction
    - Request: title, ingredients (with name, quantity, unit, category), instructions, servings, prepTime, cookTime, imageUrl
    - Specify JSON output format matching Recipe/Ingredient interfaces
    - Include instruction for ingredient categorization
    - Request confidence scores (high/medium/low) for each field
  - [x] 2.3 Create Convex action `extractRecipeWithGemini`
    - Accept HTML content string as input
    - Call Gemini API with extraction prompt (use existing Gemini integration pattern)
    - Implement 60-second timeout for AI extraction
    - Parse Gemini response into Recipe-compatible structure
    - Include confidence indicators in response
  - [x] 2.4 Update `extractRecipeFromUrl` action for hybrid pipeline
    - After structured data parsing fails, call `extractRecipeWithGemini`
    - Set extraction method to 'ai' when using Gemini
    - Return unified response structure regardless of extraction method
    - Include sourceUrl in all responses
  - [x] 2.5 Ensure Gemini extraction tests pass
    - Run ONLY the 2-6 tests written in 2.1
    - Verify Gemini integration works end-to-end (with mocks)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 2.1 pass
- Gemini prompt reliably extracts recipe data
- Ingredient categorization works correctly
- Confidence scores are included in AI-extracted data
- Hybrid pipeline falls back to AI when structured data unavailable

---

### Frontend Components

#### Task Group 3: URL Paste Modal Component
**Dependencies:** Task Group 2

- [x] 3.0 Complete URL paste modal UI
  - [x] 3.1 Write 2-6 focused tests for URL paste modal
    - Test modal opens when triggered from AddRecipeMenu
    - Test URL format validation shows inline error for invalid URLs
    - Test "Import Recipe" button triggers extraction
    - Test loading state displays during extraction
    - Use React Native Testing Library patterns
  - [x] 3.2 Create `UrlPasteModal` component
    - Full-screen modal following ScanSession.tsx dark theme pattern
    - Stone-800/900 backgrounds, text input with clear styling
    - Text input field for URL entry with placeholder text
    - "Import Recipe" button (orange-500 accent, disabled until valid URL)
    - Close/Cancel button in header
  - [x] 3.3 Implement URL validation logic
    - Client-side HTTP/HTTPS URL format validation
    - Immediate inline error feedback below input field
    - Clear error when user corrects input
    - Enable "Import Recipe" button only when URL is valid
  - [x] 3.4 Implement extraction trigger and loading state
    - Call `extractRecipeFromUrl` Convex action on button press
    - Display loading spinner with "Importing recipe..." text
    - Use Sparkles icon pattern from ScanSession.tsx
    - Disable input and button during extraction
  - [x] 3.5 Integrate with AddRecipeMenu
    - Wire `onAddFromUrl` callback to open UrlPasteModal
    - Use blue-500 color theme for URL import menu item
    - Pass extracted data to review flow on success
  - [x] 3.6 Ensure URL paste modal tests pass
    - Run ONLY the 2-6 tests written in 3.1
    - Verify modal behavior and validation work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 3.1 pass
- Modal opens from AddRecipeMenu "Paste URL" option
- URL validation provides immediate feedback
- Loading state clearly indicates extraction in progress
- Follows existing dark theme and styling patterns

---

#### Task Group 4: Smart Confirmation/Review Screen
**Dependencies:** Task Group 3

- [x] 4.0 Complete recipe review and confirmation UI
  - [x] 4.1 Write 2-6 focused tests for review screen
    - Test extracted recipe displays in preview format
    - Test inline edit expands section to editable fields
    - Test low-confidence fields show yellow highlight
    - Test "Save Recipe" button saves to database
    - Test missing fields show "Not found - tap to add" placeholder
  - [x] 4.2 Create `RecipeReviewScreen` component
    - Display extracted recipe in preview format (not form fields)
    - Show recipe title, image (if extracted), ingredient list, instruction steps
    - Follow RecipeDetail.tsx display patterns
    - Dark theme consistent with ScanSession.tsx
  - [x] 4.3 Implement confidence indicators
    - Subtle yellow highlight on low-confidence AI-extracted fields
    - Medium-confidence fields unmarked (normal display)
    - High-confidence fields unmarked (normal display)
    - Small info icon or tooltip explaining confidence
  - [x] 4.4 Implement inline editing capability
    - "Edit" button on each section (title, ingredients, instructions, times)
    - Clicking "Edit" expands section to editable form fields
    - "Done" button collapses back to preview mode
    - Preserve edits when switching between sections
  - [x] 4.5 Implement missing field handling
    - Display "Not found - tap to add" for missing optional fields
    - Tapping placeholder opens inline edit for that field
    - Required field (title) prompts user if missing before save
    - Default values: servings=4, prepTime=0, cookTime=0
  - [x] 4.6 Implement save and cancel actions
    - "Save Recipe" button at bottom (prominent, orange-500)
    - "Cancel" button (secondary styling)
    - Map data to Recipe interface on save
    - Set source='website', sourceUrl=original URL, youtubeVideoId=null
    - Set createdAt timestamp at save time
  - [x] 4.7 Ensure review screen tests pass
    - Run ONLY the 2-6 tests written in 4.1
    - Verify preview, editing, and save work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 4.1 pass
- Extracted recipe displays in readable preview format
- Confidence indicators clearly mark uncertain fields
- Inline editing works smoothly for all sections
- Missing fields are obvious and easy to fill
- Save correctly maps to Recipe interface

---

#### Task Group 5: Error Handling and Partial Extraction
**Dependencies:** Task Group 4

- [x] 5.0 Complete error handling and fallback flows
  - [x] 5.1 Write 2-6 focused tests for error handling
    - Test invalid URL error message display
    - Test network error with retry button
    - Test timeout error handling
    - Test "Create manually" fallback pre-fills sourceUrl
    - Test partial extraction displays available data
  - [x] 5.2 Create error state UI in UrlPasteModal
    - Clear error messages for: invalid URL format, fetch failure, timeout, paywall detected, extraction failure
    - Error displayed inline below URL input
    - "Retry" button for transient failures (network errors, timeouts)
    - "Create manually with this URL" option below retry
  - [x] 5.3 Implement retry functionality
    - Retry button re-triggers extraction with same URL
    - Clear previous error on retry
    - Maintain URL input value during retry
  - [x] 5.4 Implement "Create manually" fallback
    - Navigate to manual recipe creation flow
    - Pre-fill only sourceUrl field with entered URL
    - All other fields empty for user to fill
  - [x] 5.5 Implement partial extraction support
    - Navigate to review screen even with incomplete data
    - Missing fields clearly marked
    - Allow save with minimum required field (title)
    - If title missing, prompt user to enter before proceeding
  - [x] 5.6 Ensure error handling tests pass
    - Run ONLY the 2-6 tests written in 5.1
    - Verify all error states and fallbacks work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-6 tests written in 5.1 pass
- Clear, specific error messages for each failure type
- Retry functionality works for transient errors
- Manual creation fallback preserves URL
- Partial extractions can be reviewed and saved

---

### iOS Share Sheet Integration

#### Task Group 6: iOS Share Sheet Extension
**Dependencies:** Task Group 4

- [x] 6.0 Complete iOS Share Sheet integration
  - [x] 6.1 Write 2-4 focused tests for Share Sheet flow
    - Test app launches with shared URL in deep link
    - Test URL pre-populates in modal and auto-triggers extraction
    - Test background state restoration after share action
    - Mock Expo Share Extension APIs
  - [x] 6.2 Configure Expo Share Extension
    - Add expo-share-extension package if not already installed
    - Configure app.json/app.config.js for Share Extension
    - Set extension to accept URLs from Safari and other browsers
    - Configure URL scheme for deep linking
  - [x] 6.3 Implement deep link handler for share context
    - Detect app launch from share extension
    - Extract shared URL from launch parameters
    - Navigate directly to UrlPasteModal with URL pre-filled
  - [x] 6.4 Implement auto-trigger extraction on share
    - When launched via share, auto-trigger extraction
    - Skip manual "Import Recipe" button press
    - Show loading state immediately
    - Handle errors same as manual flow
  - [x] 6.5 Implement background state restoration
    - Handle case where app was backgrounded
    - Restore to appropriate screen after share action
    - Preserve any in-progress data
  - [x] 6.6 Ensure Share Sheet tests pass
    - Run ONLY the 2-4 tests written in 6.1
    - Verify Share Sheet flow works end-to-end
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 6.1 pass
- Share Sheet appears for URL content in Safari
- App opens with URL pre-filled
- Extraction auto-triggers on share
- Background state handled gracefully

---

### Integration and Testing

#### Task Group 7: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 2-6 tests written for backend URL parsing (Task 1.1)
    - Review the 2-6 tests written for Gemini extraction (Task 2.1)
    - Review the 2-6 tests written for URL paste modal (Task 3.1)
    - Review the 2-6 tests written for review screen (Task 4.1)
    - Review the 2-6 tests written for error handling (Task 5.1)
    - Review the 2-4 tests written for Share Sheet (Task 6.1)
    - Total existing tests: approximately 12-34 tests
  - [x] 7.2 Analyze test coverage gaps for this feature only
    - Identify critical end-to-end workflows lacking coverage
    - Focus ONLY on gaps related to Web Recipe Import feature
    - Do NOT assess entire application test coverage
    - Prioritize integration points (backend-to-frontend, share-to-save)
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on: full import flow (URL -> extract -> review -> save)
    - Test hybrid pipeline switching (structured data -> AI fallback)
    - Test data persistence to database
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to Web Recipe Import feature
    - Expected total: approximately 22-44 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-44 tests total)
- Critical end-to-end workflows for this feature are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on Web Recipe Import feature requirements

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: URL Fetching and Parsing** - Backend foundation for fetching and parsing structured data
2. **Task Group 2: Gemini AI Extraction** - Complete the hybrid extraction pipeline with AI fallback
3. **Task Group 3: URL Paste Modal** - Primary entry point UI for in-app URL import
4. **Task Group 4: Review Screen** - Smart confirmation flow with inline editing
5. **Task Group 5: Error Handling** - Robust error states and fallback options
6. **Task Group 6: iOS Share Sheet** - Secondary entry point for Safari sharing
7. **Task Group 7: Test Review** - Fill critical gaps and verify feature completeness

## Technical Notes

**Data Flow:**
1. User enters URL (paste modal) or shares URL (Share Sheet)
2. `fetchRecipeUrl` action fetches HTML content
3. `parseJsonLdRecipe` attempts structured data extraction
4. `parseMicrodataRecipe` attempts microdata extraction as fallback
5. `extractRecipeWithGemini` performs AI extraction if structured data not found
6. Review screen displays extracted data with confidence indicators
7. User edits/confirms and saves to database

**Recipe Data Mapping:**
- source: 'website'
- sourceUrl: original URL
- youtubeVideoId: null
- ingredients: Ingredient[] with name, quantity (number), unit (string), category
- instructions: string[] (split on numbered steps or line breaks)
- notes: '' (empty, user can add later)
- createdAt: timestamp at save time

**Styling Patterns:**
- Dark theme: stone-800/900 backgrounds
- Accent color: orange-500 for primary actions
- URL import menu item: blue-500 color theme
- Follow ScanSession.tsx patterns for loading states and step-based flow
- Follow RecipeDetail.tsx patterns for recipe preview display

## Implementation Summary

### Files Created

**Backend (Convex):**
- `convex/lib/recipeTypes.ts` - Shared type definitions for recipe extraction
- `convex/lib/parseJsonLdRecipe.ts` - JSON-LD structured data parser
- `convex/lib/parseMicrodataRecipe.ts` - Microdata/RDFa fallback parser
- `convex/actions/fetchRecipeUrl.ts` - URL fetching action with timeout/validation
- `convex/actions/extractRecipeFromUrl.ts` - Orchestration action for hybrid pipeline
- `convex/actions/extractRecipeWithGemini.ts` - Gemini AI extraction action

**Frontend (Components):**
- `components/import/types.ts` - Type definitions for import components
- `components/import/ConfidenceIndicator.tsx` - Visual confidence level indicator
- `components/import/InlineEditSection.tsx` - Collapsible edit sections
- `components/import/UrlPasteModal.tsx` - Full-screen URL input modal
- `components/import/RecipeReviewScreen.tsx` - Smart confirmation/review screen
- `components/import/index.ts` - Component exports

**App Routes:**
- `app/(app)/recipes/import.tsx` - Import screen entry point
- `app/(app)/recipes/_layout.tsx` - Updated to include import route

**Configuration:**
- `app.config.ts` - Expo configuration with deep linking
- `lib/shareExtension.ts` - Deep link parsing and share context handling
- `app/_layout.tsx` - Updated root layout with deep link handling

**Tests:**
- `convex/__tests__/web-recipe-import.test.ts` - Backend parsing tests (18 tests)
- `convex/__tests__/web-recipe-import-frontend.test.ts` - Frontend component tests (36 tests)
- `convex/__tests__/share-extension.test.ts` - Share extension tests (19 tests)
- `convex/__tests__/web-recipe-import-integration.test.ts` - Integration tests (18 tests)

**Total Tests: 91 tests passing**
