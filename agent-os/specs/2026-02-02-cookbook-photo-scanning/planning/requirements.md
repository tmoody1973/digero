# Spec Requirements: Cookbook Photo Scanning

## Initial Description

Implement camera capture for cookbook pages. Send image to Gemini API for OCR extraction of recipe title, ingredients, and instructions. Display extracted content for user review and editing before saving.

**Source:** Product Roadmap - Week 2: Scanning, Planning, and Monetization (Feature #7)

**Effort Estimate:** Large (L) - 2 weeks

**Priority:** Critical - Key differentiator and must be functional for hackathon demo

---

## Requirements Discussion

### First Round Questions

**Q1:** Looking at the ScanSession mockup and component, I see it supports scanning multiple recipes from a single cookbook session. I assume we want to support multi-page recipes (e.g., where ingredients are on one page and instructions on another). Is that correct, or should each scan be treated as a complete single-page recipe for the hackathon MVP?
**Answer:** Yes - support scanning multi-page recipes (e.g., ingredients on page 1, instructions on page 2). User can indicate "This recipe continues" and scan additional pages, Gemini merges content.

**Q2:** I'm assuming we'll prompt Gemini to extract and return structured JSON matching the existing Recipe type (title, ingredients with quantities/units/categories, instructions as steps, servings, prep/cook time). Should we also attempt to extract the page number for reference, or is that out of scope?
**Answer:** Yes - extract page number for reference back to physical book.

**Q3:** The mockup shows a summary view after extraction (ingredient count, step count). I assume users should be able to edit the full extracted content (title, individual ingredients, instructions) before saving - not just view a summary. Is that correct?
**Answer:** Full edit - allow complete editing of extracted content before saving. Full edit screen after extraction (similar to manual recipe form).

**Q4:** For the hackathon demo, I'm thinking we should provide real-time camera guidance (frame overlay is shown in the mockup) but skip advanced features like auto-detection of blur/lighting issues. Should we include any basic quality feedback (e.g., "Hold steady" or "Move closer"), or is the frame overlay sufficient for MVP?
**Answer:** Yes - include basic real-time feedback ("Hold steady", "Move closer"). Real-time camera guidance: frame overlay + feedback messages.

**Q5:** The mockup shows "Start with the Cover" as the first step. I assume the cover photo should be optional (the input shows "optional") - users can skip it and just start scanning recipes. The cover would be used to auto-populate cookbook name via Gemini if provided. Is this correct?
**Answer:** Yes, optional - can skip, used to auto-populate cookbook name via Gemini.

**Q6:** Looking at the types.ts, recipes have a `scannedFromBook` field with name and coverImageUrl. I assume we should store cookbook cover images in Convex file storage and create/reuse a cookbook entity when scanning (so multiple scan sessions can reference the same physical book). Is that correct, or should each scan session create a standalone reference?
**Answer:** Yes - reuse cookbook entity so multiple scans reference same physical book. Physical cookbook entity created/reused - cover stored in Convex file storage.

**Q7:** If Gemini cannot extract a valid recipe (poor image quality, non-recipe page, etc.), I'm assuming we should show an error with "Try Again" option rather than saving partial/empty data. Should we also offer a fallback to manual entry from that screen?
**Answer:** Yes - show error with retry AND fallback to manual entry. OCR failure flow: Error -> Retry -> Manual entry fallback.

**Q8:** Based on the 2-week timeline and hackathon priorities, I want to confirm we should defer: batch importing multiple pages at once (upload 10 photos), handwritten recipe support optimization, and offline scanning. Is there anything else you want to explicitly exclude?
**Answer:** No additional exclusions beyond the standard deferrals (batch import, handwritten optimization, offline scanning are deferred for post-hackathon).

### Existing Code to Reference

**Similar Features Identified:**
- Component: `ScanSession.tsx` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx`
  - Implements scan flow UI with steps: cover, scanning, processing, review, complete
  - Contains UI patterns for camera viewfinder, processing state, and recipe preview
- Types: `types.ts` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts`
  - Defines Recipe interface with `scannedFromBook` field
  - Defines ScanSession interface with bookName, coverImageUrl, scannedRecipes
- Mockup: `scan-session.png` - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/scan-session.png`
  - Shows "Start with the Cover" initial screen design
  - Dark theme with orange accent color
  - Book icon, optional cookbook name input, "Capture Cover Photo" button

### Follow-up Questions

No follow-up questions were needed.

---

## Visual Assets

### Files Provided:

**External reference (not in spec visuals folder):**
- `scan-session.png` at `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/scan-session.png`: Shows the initial "Start with the Cover" screen with dark theme, orange accents, book icon, optional cookbook name input field, and "Capture Cover Photo" button with camera icon.

### Visual Insights:
- Design follows dark theme (stone-950 background) with orange-500 accent color
- Modal-style full-screen experience with X close button
- Large iconography (book icon in rounded square container)
- Clear instructional text explaining the purpose of each step
- Optional input fields use placeholder text with "(optional)" indicator
- Primary CTAs use rounded pill-style buttons with icons
- Bottom tab bar visible showing app navigation (Recipes, Discover, Cookbooks, Plan, Shop)
- Fidelity level: High-fidelity mockup (production-ready design)

---

## Requirements Summary

### Functional Requirements

**Camera Capture Flow:**
- Implement camera capture using expo-camera for cookbook pages
- Provide real-time camera guidance with frame overlay
- Display feedback messages ("Hold steady", "Move closer") based on camera state
- Support both cover photo capture and recipe page capture

**Multi-Page Recipe Support:**
- Allow users to indicate "This recipe continues" after scanning a page
- Support scanning additional pages for the same recipe
- Gemini API merges content from multiple pages into single recipe
- Track page numbers for reference back to physical book

**Gemini OCR Integration:**
- Send captured image to Gemini API via Convex serverless function
- Extract structured recipe data: title, ingredients (with quantity, unit, category), instructions, servings, prep time, cook time
- Extract page number from scanned page
- Handle multi-page merging: combine ingredients lists, append instructions in order
- Return structured JSON matching Recipe type schema

**User Review/Edit Flow:**
- Display extraction summary (ingredient count, instruction count) immediately after processing
- Provide full edit screen for complete editing before saving (similar to manual recipe creation form)
- Allow editing of: title, all ingredients (name, quantity, unit), all instructions, servings, prep/cook time, notes
- User confirms save after review/edit

**Physical Cookbook Management:**
- Cover photo is optional - users can skip to recipe scanning
- If cover provided, use Gemini to auto-extract cookbook name
- Store cookbook cover images in Convex file storage
- Create PhysicalCookbook entity on first scan from a book
- Reuse existing cookbook entity for subsequent scans from same book
- Link recipes to source cookbook via `scannedFromBook` field

**Error Handling:**
- Detect OCR extraction failures (poor image quality, non-recipe content)
- Display clear error message with explanation
- Provide "Try Again" option to re-capture
- Provide "Enter Manually" fallback to manual recipe creation
- Pre-populate manual form with any partially extracted data if available

**Session Flow:**
- Start session: Optional cover capture -> Recipe scanning
- Per recipe: Capture -> Processing -> Review/Edit -> Save or Continue (multi-page)
- End session: Summary of all recipes scanned -> Done

### Reusability Opportunities

- `ScanSession.tsx` component provides UI patterns for the entire scan flow
- Recipe type schema already supports `scannedFromBook` field
- Existing component patterns: loading states, step indicators, action buttons
- Dark theme styling with orange accents established in mockup
- Manual recipe form patterns can be reused for edit screen

### Scope Boundaries

**In Scope:**
- Camera capture with expo-camera for cookbook pages
- Real-time camera guidance (frame overlay + feedback messages)
- Single-page and multi-page recipe scanning
- Gemini API integration for OCR and content extraction
- Page number extraction and storage
- Full review/edit screen before saving
- Physical cookbook entity management (create/reuse)
- Cover photo capture with auto-name extraction (optional)
- Error handling with retry and manual fallback
- Integration with existing Recipe data model

**Out of Scope (Deferred to Post-Hackathon):**
- Batch importing multiple pages at once (upload 10 photos simultaneously)
- Handwritten recipe recognition optimization
- Offline scanning and queued processing
- Advanced image quality detection (blur, lighting analysis)
- Auto-crop and perspective correction
- Recipe duplicate detection

### Technical Considerations

**Integration Points:**
- expo-camera for camera access and capture
- Convex file storage for cover images and scanned page images
- Convex serverless function for Gemini API calls (keeps API key secure)
- Gemini Vision API for image analysis and text extraction
- Existing Recipe mutation for saving extracted recipes

**Data Model Extensions:**
- PhysicalCookbook entity: id, name, coverImageUrl (Convex storage ID), userId, createdAt
- Recipe.scannedFromBook: reference to PhysicalCookbook
- Recipe.pageNumber: number (extracted page reference)
- Consider storing original scanned images for reference

**Gemini Prompt Structure:**
- System prompt establishing recipe extraction context
- Request structured JSON output matching Recipe schema
- Include instructions for multi-page merging when continuation detected
- Handle edge cases: partial recipes, non-recipe pages, poor quality images

**Multi-Page Merging Logic:**
- First page: Extract all available fields, mark as potentially incomplete
- Continuation pages: Extract additional content
- Merge strategy:
  - Title: Use first non-empty title found
  - Ingredients: Concatenate lists, deduplicate if identical
  - Instructions: Append in scan order
  - Servings/times: Use first non-empty values
  - Page numbers: Store as array or range (e.g., "pp. 42-43")

**Performance Considerations:**
- Image compression before upload to reduce API latency
- Show processing indicator during Gemini API call
- Consider optimistic UI updates where appropriate

**Similar Code Patterns to Follow:**
- Component: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx`
- Types: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/types.ts`
