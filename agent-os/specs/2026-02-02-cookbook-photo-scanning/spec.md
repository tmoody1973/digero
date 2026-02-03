# Specification: Cookbook Photo Scanning

## Goal

Enable users to capture photos of physical cookbook pages and extract structured recipe data using Gemini AI, with support for multi-page recipes, physical cookbook entity management, and full review/edit capabilities before saving.

## User Stories

- As a home cook, I want to scan recipe pages from my physical cookbooks so that I can access them digitally in my recipe library
- As a user with multi-page recipes, I want to indicate when a recipe continues on another page so that Gemini can merge the content into a complete recipe

## Specific Requirements

**Camera Capture with Quality Guidance**
- Use expo-camera for camera access and image capture on mobile
- Display frame overlay (orange corner markers) to guide page positioning
- Show real-time feedback messages: "Hold steady", "Move closer", "Position page within frame"
- Capture high-resolution image suitable for OCR processing
- Compress image before upload to optimize API latency (target under 2MB)

**Multi-Page Recipe Support**
- After scanning a page, provide "This recipe continues" option to scan additional pages
- Track page sequence for proper content merging
- Gemini merges content: concatenate ingredients, append instructions in scan order
- Use first non-empty value for title, servings, prep/cook times
- Store page numbers as range (e.g., "pp. 42-43") when multiple pages scanned

**Gemini OCR Integration**
- Call Gemini Vision API via Convex serverless function (keeps API key secure)
- Extract structured JSON matching Recipe schema: title, ingredients (with quantity, unit, category), instructions, servings, prepTime, cookTime
- Extract page number from scanned page for reference back to physical book
- System prompt establishes recipe extraction context with structured output requirements
- Handle edge cases: partial recipes, non-recipe pages, poor quality images

**Physical Cookbook Entity Management**
- Cover photo is optional - users can skip directly to recipe scanning
- If cover provided, use Gemini to auto-extract cookbook name from cover image
- Store cookbook cover images in Convex file storage
- Create PhysicalCookbook entity on first scan session from a book
- Reuse existing PhysicalCookbook when user selects same book for subsequent scans
- Link recipes to source cookbook via scannedFromBook field with name and coverImageUrl

**Full Review/Edit Flow**
- Display extraction summary immediately after processing (ingredient count, instruction count)
- Provide full edit screen for complete editing before saving (reuse manual recipe form patterns)
- Allow editing of: title, all ingredients (name, quantity, unit), all instructions, servings, prep/cook time, notes
- User must explicitly confirm save after review/edit
- "Scan Another Recipe" option to continue session after saving

**Error Handling with Manual Fallback**
- Detect OCR extraction failures: poor image quality, non-recipe content, API errors
- Display clear error message explaining the issue
- Provide "Try Again" option to re-capture the page
- Provide "Enter Manually" fallback that navigates to manual recipe creation
- Pre-populate manual form with any partially extracted data if available

**Session Flow Management**
- Session starts with optional cover capture, then recipe scanning mode
- Per recipe flow: Capture -> Processing -> Review/Edit -> Save or Continue (multi-page)
- Track all recipes scanned in session with preview list
- Session complete screen shows summary of all recipes added from this cookbook
- Allow "Scan More from This Book" to continue session after completion

## Visual Design

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/scan-session.png`**
- Dark theme with stone-950 background and orange-500 accent color
- Full-screen modal with X close button in top-left header
- Large book icon (amber-500) in rounded amber-500/20 container for cover step
- "Start with the Cover" heading with explanatory text below
- Text input with "(optional)" placeholder for cookbook name
- Primary CTA: rounded pill button with camera icon and "Capture Cover Photo" text
- Bottom tab bar visible (Recipes, Discover, Cookbooks, Plan, Shop)

## Existing Code to Leverage

**ScanSession.tsx Component (`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx`)**
- Provides complete UI flow structure with steps: cover, scanning, processing, review, complete
- Camera viewfinder with orange frame overlay and corner markers already implemented
- Processing state with sparkles icon and loading spinner pattern
- Review screen with ingredient/step count display in stone-700 rounded boxes
- "Scan Another Recipe" and "Done Scanning" button patterns

**Recipe Type Schema (`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts`)**
- Recipe interface with scannedFromBook field (name, coverImageUrl)
- Ingredient interface with name, quantity, unit, category
- ScanSession interface with bookName, coverImageUrl, scannedRecipes, isActive
- Use existing source type 'scanned' for recipes created via scanning

**AddRecipeMenu.tsx (`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/AddRecipeMenu.tsx`)**
- Entry point pattern: "Scan Cookbook" menu item with Camera icon
- Color coding: amber-500 for scan-related actions
- Menu item structure with icon, label, and description

**Data Model Types (`/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`)**
- Core Ingredient and Nutrition interfaces to match for extraction
- Cookbook entity structure (can inform PhysicalCookbook design)
- Recipe source enum includes 'scanned' option

## Out of Scope

- Batch importing multiple pages at once (uploading 10 photos simultaneously)
- Handwritten recipe recognition optimization (rely on Gemini's default capabilities)
- Offline scanning and queued processing for later upload
- Advanced image quality detection (blur analysis, lighting correction)
- Auto-crop and perspective correction of scanned images
- Recipe duplicate detection against existing library
- Sharing physical cookbook entities between users
- OCR for non-English languages (English-only for hackathon)
- Integration with external cookbook databases or ISBNs
- Barcode/QR code scanning from cookbook covers
