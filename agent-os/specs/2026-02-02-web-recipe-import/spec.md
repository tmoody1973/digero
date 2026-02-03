# Specification: Web Recipe Import

## Goal

Enable users to import recipes from any website URL through two entry points (in-app paste modal and iOS Share Sheet), using a hybrid extraction strategy that attempts structured data parsing first then falls back to Gemini AI, with a smart review flow before saving.

## User Stories

- As a user, I want to paste a recipe URL into the app so that I can quickly save recipes I find online without manual data entry.
- As a user, I want to share a recipe URL directly from Safari to Digero so that I can save recipes without switching between apps.
- As a user, I want to review and edit extracted recipe data before saving so that I can correct any extraction errors.

## Specific Requirements

**URL Paste Modal**
- Triggered from AddRecipeMenu "Paste URL" option (existing `onAddFromUrl` callback)
- Full-screen modal with text input field for URL entry
- URL format validation (HTTP/HTTPS) with immediate inline error feedback
- "Import Recipe" button triggers extraction flow
- Loading state with clear progress indication during extraction

**iOS Share Sheet Extension**
- Configure Expo Share Extension to accept URLs from Safari and other browsers
- Handle app launch from share context with deep linking
- Pre-populate URL input and auto-trigger extraction when launched via share
- Support background app state restoration after share action

**Hybrid Extraction Pipeline**
- Server-side URL fetch via Convex action (avoids CORS, secures API keys)
- Set appropriate User-Agent header to avoid bot blocking
- First attempt: parse JSON-LD script tags for Schema.org Recipe markup
- Second attempt: parse microdata/RDFa Recipe markup as fallback
- Final fallback: send HTML content to Gemini API for AI extraction
- Return extraction result with confidence indicators for each field

**Gemini AI Extraction**
- Convex action calls Gemini API with structured prompt for recipe extraction
- Extract: title, ingredients (with categorization), instructions, servings, prep/cook time, image URL
- Prompt engineering to return structured JSON matching Recipe interface
- Include confidence scores (high/medium/low) for each extracted field
- Categorize each ingredient into: meat, produce, dairy, pantry, spices, condiments, bread, other

**Smart Confirmation Screen**
- Display extracted recipe in preview format (not form fields)
- Show recipe title, image, ingredient list, and instruction steps as they will appear when saved
- Inline edit triggers: each section has "Edit" button that expands to editable form fields
- Confidence indicators: subtle yellow highlight on low-confidence AI-extracted fields
- Missing fields display as "Not found - tap to add" placeholders
- "Save Recipe" (prominent) and "Cancel" actions at bottom

**Partial Extraction Support**
- Save whatever data was extracted even if some fields are missing
- Clearly display which fields are missing and allow user to fill them
- Minimum required fields: title (can prompt user to enter if missing)
- Optional fields show defaults: servings=4, prepTime=0, cookTime=0, empty instructions array

**Error Handling and Fallback**
- URL format validation before extraction attempt (client-side for UX, server-side for security)
- Clear error messages for: invalid URL format, fetch failure, timeout, paywall detected, extraction failure
- Retry button for transient failures (network errors, timeouts)
- "Create manually with this URL" option pre-fills sourceUrl field only
- Timeout handling: 30-second limit for URL fetch, 60-second limit for AI extraction

**Recipe Data Mapping**
- Map extracted data to existing Recipe interface from types.ts
- source: 'website', sourceUrl: original URL, youtubeVideoId: null
- ingredients: array of Ingredient objects with name, quantity (number), unit (string), category
- instructions: array of step strings (split on numbered steps or line breaks)
- notes: empty string (user can add later)
- createdAt: timestamp at save time

## Visual Design

No visual assets provided. Follow existing ScanSession.tsx patterns for dark theme, step-based flow, and action button styling.

## Existing Code to Leverage

**AddRecipeMenu.tsx**
- Entry point component with `onAddFromUrl` callback already defined
- Menu item pattern: icon, label, description, color theme (use blue-500 for URL import)
- Modal opening pattern to follow for URL paste modal

**ScanSession.tsx**
- Step-based flow pattern: 'cover' -> 'scanning' -> 'processing' -> 'review' -> 'complete'
- Processing state UI with Sparkles icon and loading spinner
- Review screen pattern showing extracted data with edit options
- Dark theme styling with stone-800/900 backgrounds, orange-500 accent color
- Action button patterns at bottom of screen

**Recipe and Ingredient types (types.ts)**
- Recipe interface with all required fields for data mapping
- Ingredient interface with category enum: 'meat' | 'produce' | 'dairy' | 'pantry' | 'spices' | 'condiments' | 'bread' | 'other'
- source enum includes 'website' for URL imports

**RecipeDetail.tsx pattern**
- Recipe display format to replicate in preview mode
- Ingredient list and instruction step rendering patterns

## Out of Scope

- Login-protected or paywall recipe sites (no authentication handling)
- Batch importing multiple URLs at once
- Browser extension for desktop
- Android Share Sheet integration (post-hackathon with Android support)
- Recipe deduplication (detecting if URL was already imported)
- Caching of previously fetched URLs
- Social sharing of imported recipes
- Import history or undo functionality
- Automatic recipe categorization or tagging beyond ingredient categories
- Nutrition data extraction (may be added later)
