# Spec Requirements: Web Recipe Import

## Initial Description

Allow users to paste a URL from a recipe website. Parse the page to extract recipe title, ingredients, and instructions using structured data or AI extraction.

**Source:** Product Roadmap - Week 1: Foundation and Core Flow (Feature #5)
**Effort Estimate:** Medium (M) - 1 week
**Priority:** High - Key differentiator for ease of use

## Requirements Discussion

### First Round Questions

**Q1:** URL Input Method - I assume the primary entry point will be the existing "Paste URL" option in the AddRecipeMenu (which already has `onAddFromUrl` callback). This would open a simple modal/screen with a text input for pasting URLs. Is that correct, or do you also want iOS Share Sheet integration so users can share URLs directly from Safari to Digero?
**Answer:** Do BOTH - paste URL modal AND iOS Share Sheet integration. Two entry points for maximum convenience.

**Q2:** Extraction Strategy - Given the 2-week hackathon timeline and your existing Gemini API integration, I'm thinking we use a hybrid approach: first attempt to parse structured data (JSON-LD, Schema.org Recipe markup) which many recipe sites include, then fall back to Gemini AI extraction for sites without structured data. Does that sound right, or should we simplify to AI-only extraction to reduce complexity?
**Answer:** Hybrid approach confirmed - try structured data (JSON-LD/Schema.org) first, fall back to Gemini AI for sites without structured markup.

**Q3:** Recipe Review Flow - I assume after extraction, users should see a review/edit screen before saving - similar to how the cookbook scanning flow shows "extracted content for user review and editing before saving" (from roadmap). This would let users correct any extraction errors. Should this use the same UI pattern as the manual recipe creation form, or a simpler confirmation screen?
**Answer:** Use best practices for UX - recommendation requested from spec researcher.

**Q4:** Extraction Failure Handling - When extraction fails (unsupported site, paywall, rate limiting), I'm planning to: (a) show a clear error message, (b) offer to retry, and (c) provide a "Create manually with this URL" option that pre-fills just the sourceUrl. Should we also include partial extraction - saving whatever was extracted even if incomplete?
**Answer:** Do BOTH - error with retry/manual fallback AND partial extraction (save incomplete data when possible).

**Q5:** URL Validation and Scope - I assume we should accept any valid HTTP/HTTPS URL (no whitelist) since limiting to specific sites would frustrate users. We would validate the URL format before attempting extraction. Is that correct?
**Answer:** Yes - accept any valid HTTP/HTTPS URL with format validation only. No whitelist restrictions.

**Q6:** Recipe Data Mapping - Looking at your existing Recipe type, extracted recipes would populate: title, source ('website'), sourceUrl, imageUrl, servings, prepTime, cookTime, ingredients (with structured Ingredient objects), instructions, and notes. Should Gemini attempt to categorize ingredients (meat, produce, dairy, etc.) during extraction, or should we default to 'other' and let users categorize later?
**Answer:** Yes - AI categorizes ingredients during extraction into: meat, produce, dairy, pantry, spices, condiments, bread, other.

**Q7:** Is there anything specific you want to explicitly exclude from this feature's initial implementation?
**Answer:** No exclusions - implement full feature set as discussed.

### Existing Code to Reference

**Similar Features Identified:**
- Component: `ScanSession.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx` - Camera capture and AI extraction flow pattern
- Component: `AddRecipeMenu.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/AddRecipeMenu.tsx` - Entry point with `onAddFromUrl` callback
- Types: `types.ts` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts` - Recipe and Ingredient interfaces

**Patterns to Follow:**
- Recipe data structure with structured ingredients (name, quantity, unit, category)
- Source type enum includes 'website' for URL imports
- Existing UI patterns for recipe management in RecipeDetail and RecipeList components

### Follow-up Questions

No follow-up questions required - all requirements sufficiently clarified.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes to analyze.

## UX Recommendation: Review Flow

**Recommended Approach: Smart Confirmation with Inline Editing**

Rather than forcing users through a full form (friction) or a simple yes/no confirmation (no control), I recommend a **hybrid confirmation screen** that shows extracted data in a readable format with inline edit capabilities:

1. **Display extracted recipe in "preview" format** - Show the recipe as it will appear when saved (title, image, ingredients list, instructions), not as form fields.

2. **Inline edit triggers** - Each section (title, ingredients, instructions, etc.) has an "Edit" icon/button that expands that section into editable form fields.

3. **Confidence indicators** - For AI-extracted content, show subtle confidence indicators (e.g., yellow highlight for low-confidence fields) to guide users on what might need review.

4. **Partial extraction handling** - Missing fields display as "Not found - tap to add" placeholders, making gaps obvious and easy to fill.

5. **Primary actions** - "Save Recipe" (prominent) and "Cancel" buttons at bottom.

**Rationale:**
- Reduces friction for high-confidence extractions (user can review and save quickly)
- Provides full editing capability when needed without overwhelming the UI
- Consistent with mobile-first patterns (progressive disclosure)
- Aligns with ScanSession.tsx pattern of "review and edit before saving"

## Requirements Summary

### Functional Requirements

**URL Entry Points:**
- In-app paste modal triggered from AddRecipeMenu "Paste URL" option
- iOS Share Sheet extension for sharing URLs directly from Safari/browsers to Digero

**Hybrid Extraction Pipeline:**
1. Fetch URL content
2. Parse HTML for structured data (JSON-LD, Schema.org Recipe markup)
3. If structured data found: extract and map to Recipe schema
4. If no structured data: send page content to Gemini API for AI extraction
5. Gemini extracts: title, ingredients (with categorization), instructions, servings, prep/cook time, image URL
6. Return extracted data with confidence indicators

**Ingredient Categorization:**
- AI categorizes each ingredient into one of: meat, produce, dairy, pantry, spices, condiments, bread, other
- Categories align with existing Ingredient interface in types.ts

**Review Flow:**
- Smart confirmation screen showing extracted recipe in preview format
- Inline editing capability for each section
- Confidence indicators for AI-extracted fields
- Clear display of missing/incomplete fields
- Save and Cancel actions

**Error Handling:**
- URL format validation before extraction attempt
- Clear error messages for: invalid URL, fetch failure, paywall detected, extraction failure
- Retry option for transient failures
- "Create manually" fallback that pre-fills sourceUrl
- Partial extraction: save available data even if some fields missing

**Data Mapping:**
- source: 'website'
- sourceUrl: original URL
- title: extracted or user-entered
- imageUrl: first recipe image found
- servings: extracted number or null
- prepTime: extracted minutes or null
- cookTime: extracted minutes or null
- ingredients: array of Ingredient objects with name, quantity, unit, category
- instructions: array of step strings
- notes: empty string (user can add)

### Reusability Opportunities

- ScanSession.tsx extraction and review flow pattern
- AddRecipeMenu.tsx entry point integration
- Existing Recipe/Ingredient type definitions
- Potential shared Gemini API utility for both cookbook scanning and URL import

### Scope Boundaries

**In Scope:**
- In-app URL paste modal
- iOS Share Sheet extension
- JSON-LD/Schema.org structured data parsing
- Gemini AI fallback extraction
- Ingredient categorization during extraction
- Smart confirmation/review screen with inline editing
- Partial extraction support
- Error handling with retry and manual fallback
- URL format validation

**Out of Scope:**
- Login-protected recipe sites (no authentication handling)
- Batch importing multiple URLs at once
- Browser extension
- Android Share Sheet (post-hackathon with Android support)
- Recipe deduplication (detecting if URL already imported)

### Technical Considerations

**iOS Share Sheet Integration:**
- Requires Expo Share Extension configuration
- Must handle app launch from share context
- Deep linking to import flow with shared URL

**Structured Data Parsing:**
- Parse JSON-LD script tags for Recipe schema
- Handle microdata and RDFa formats as secondary options
- Map Schema.org Recipe properties to app's Recipe interface

**Gemini API Integration:**
- Convex serverless function for API calls (keeps API key secure)
- Prompt engineering for reliable recipe extraction
- Structured output format matching Recipe schema
- Ingredient categorization as part of extraction prompt

**URL Fetching:**
- Server-side fetch via Convex function (avoids CORS issues)
- User-agent header to avoid bot blocking
- Timeout handling for slow sites
- Content-type validation (expect HTML)

**Existing Type Alignment:**
- Recipe interface: id, title, source, sourceUrl, youtubeVideoId (null), imageUrl, servings, prepTime, cookTime, ingredients, instructions, nutrition (may be empty), notes, createdAt
- Ingredient interface: name, quantity, unit, category
- Source enum value: 'website'
