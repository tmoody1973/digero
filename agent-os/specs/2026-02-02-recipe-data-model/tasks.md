# Task Breakdown: Recipe Data Model

## Overview
Total Tasks: 25 (across 4 task groups)

This spec establishes the foundational Convex schema and data layer for recipes and physical cookbooks, including schema definitions, CRUD mutations, query functions, and server-side validation.

## Task List

### Schema Layer

#### Task Group 1: Convex Schema Definitions
**Dependencies:** None

- [x] 1.0 Complete Convex schema definitions
  - [x] 1.1 Write 4-6 focused tests for schema validation
    - Test that recipes table accepts valid recipe data with all required fields
    - Test that ingredient category enum rejects invalid values
    - Test that source enum validates correctly (youtube, website, scanned, manual)
    - Test that physicalCookbooks table accepts valid cookbook data
    - Test that optional fields (nutrition, cuisineType, difficulty) are truly optional
    - Test that array fields (ingredients, instructions, dietaryTags) work correctly
  - [x] 1.2 Create `convex/schema.ts` with recipes table definition
    - Define userId as `v.string()` for Clerk user ID storage
    - Define core fields: title, source (4-value union), sourceUrl, youtubeVideoId, imageUrl
    - Define timing fields: servings, prepTime, cookTime as `v.number()`
    - Define content fields: ingredients (array of objects), instructions (array of strings), notes
    - Use `v.optional()` for nullable fields: sourceUrl, youtubeVideoId, nutrition, cuisineType, difficulty, physicalCookbookId
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts` for field naming consistency
  - [x] 1.3 Define ingredients array structure in schema
    - Create object validator with: name (string), quantity (number), unit (string), category (8-value union)
    - Category values: meat, produce, dairy, pantry, spices, condiments, bread, other
    - Use `v.array(v.object({...}))` pattern
  - [x] 1.4 Define nutrition object structure in schema
    - Create optional nested object: `v.optional(v.object({calories, protein, carbs, fat}))`
    - All fields as `v.number()` representing kcal and grams
  - [x] 1.5 Add metadata fields to recipes table
    - cuisineType as `v.optional(v.string())`
    - isFavorited as `v.boolean()`
    - difficulty as optional 3-value union: easy, medium, hard
    - dietaryTags as `v.array(v.string())`
    - createdAt and updatedAt as `v.number()` (Unix milliseconds)
  - [x] 1.6 Create physicalCookbooks table definition
    - Define userId as `v.string()` for Clerk user ID
    - Define name as `v.string()`, author as `v.optional(v.string())`
    - Define coverImageId as `v.optional(v.id("_storage"))` for Convex file storage
    - Define createdAt as `v.number()`
  - [x] 1.7 Add physicalCookbookId reference to recipes table
    - Define as `v.optional(v.id("physicalCookbooks"))`
    - Enables linking scanned recipes to their source cookbook
  - [x] 1.8 Define indexes for both tables
    - recipes: `by_user` on ["userId"]
    - recipes: `by_user_created` on ["userId", "createdAt"]
    - recipes: `by_user_favorited` on ["userId", "isFavorited"]
    - physicalCookbooks: `by_user` on ["userId"]
  - [x] 1.9 Ensure schema tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify schema compiles without errors
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Schema compiles successfully with `npx convex dev`
- All field types match spec requirements
- Indexes are created for efficient queries
- physicalCookbooks table is properly defined with file storage reference

---

### Mutations Layer

#### Task Group 2: CRUD Mutations with Validation
**Dependencies:** Task Group 1

- [x] 2.0 Complete CRUD mutations
  - [x] 2.1 Write 6-8 focused tests for mutation functionality
    - Test createRecipe successfully creates recipe with valid data
    - Test createRecipe sets default values (isFavorited: false, dietaryTags: [], notes: "")
    - Test createRecipe throws error when YouTube source lacks youtubeVideoId
    - Test createRecipe throws error when website source lacks sourceUrl
    - Test updateRecipe auto-updates updatedAt timestamp
    - Test deleteRecipe validates user ownership before deletion
    - Test createPhysicalCookbook creates cookbook for authenticated user
    - Test mutations reject requests from non-authenticated users
  - [x] 2.2 Create `convex/recipes.ts` with createRecipe mutation
    - Accept all recipe fields as arguments
    - Set default values in handler: isFavorited: false, dietaryTags: [], notes: ""
    - Set createdAt and updatedAt to current timestamp (Date.now())
    - Get userId from ctx.auth and validate authentication
    - Return the created recipe ID
  - [x] 2.3 Implement source-specific validation in createRecipe
    - Validate sourceUrl required when source is "youtube" or "website"
    - Validate youtubeVideoId required when source is "youtube"
    - Validate physicalCookbookId only allowed when source is "scanned"
    - Throw descriptive errors: `throw new Error("YouTube video ID required for YouTube recipes")`
  - [x] 2.4 Create updateRecipe mutation
    - Accept recipe ID and partial update fields
    - Validate user ownership: recipe.userId must match authenticated user
    - Auto-update `updatedAt` to current timestamp
    - Preserve source-specific validation rules on updates
  - [x] 2.5 Create deleteRecipe mutation
    - Accept recipe ID as argument
    - Validate user ownership before deletion
    - Throw error if recipe not found or user unauthorized
  - [x] 2.6 Create `convex/physicalCookbooks.ts` with createPhysicalCookbook mutation
    - Accept name, author (optional), coverImageId (optional)
    - Set userId from authenticated user
    - Set createdAt to current timestamp
    - Return the created cookbook ID
  - [x] 2.7 Create deletePhysicalCookbook mutation
    - Accept cookbook ID as argument
    - Validate user ownership before deletion
    - Consider: should deletion be blocked if recipes reference this cookbook?
  - [x] 2.8 Create toggleFavorite mutation for convenience
    - Accept recipe ID
    - Toggle isFavorited boolean value
    - Update updatedAt timestamp
    - Validate user ownership
  - [x] 2.9 Ensure mutation tests pass
    - Run ONLY the 6-8 tests written in 2.1
    - Verify all CRUD operations work correctly
    - Verify validation rules are enforced
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 2.1 pass
- All mutations enforce authentication via ctx.auth
- All mutations validate user ownership
- Default values are correctly set in createRecipe
- Source-specific validation prevents invalid data combinations
- Timestamps are automatically managed

---

### Queries Layer

#### Task Group 3: Query Functions
**Dependencies:** Task Group 2

- [x] 3.0 Complete query functions
  - [x] 3.1 Write 4-6 focused tests for query functionality
    - Test getRecipes returns only recipes for authenticated user
    - Test getRecipes supports pagination with limit/cursor
    - Test getRecipeById returns recipe when user owns it
    - Test getRecipeById returns null/throws when user does not own recipe
    - Test getFavoriteRecipes returns only favorited recipes for user
    - Test getPhysicalCookbooks returns only cookbooks for authenticated user
  - [x] 3.2 Create getRecipes query in `convex/recipes.ts`
    - Filter by authenticated userId using `by_user` index
    - Accept optional limit parameter for pagination
    - Accept optional cursor parameter for continuation
    - Return recipes ordered by createdAt descending (newest first)
  - [x] 3.3 Create getRecipeById query
    - Accept recipe ID as argument
    - Fetch recipe by ID
    - Validate user ownership before returning
    - Return null or throw error if unauthorized
  - [x] 3.4 Create getFavoriteRecipes query
    - Use `by_user_favorited` index for efficient filtering
    - Filter by userId and isFavorited === true
    - Support optional limit/cursor for pagination
  - [x] 3.5 Create getPhysicalCookbooks query in `convex/physicalCookbooks.ts`
    - Filter by authenticated userId using `by_user` index
    - Return cookbooks ordered by createdAt descending
  - [x] 3.6 Create getPhysicalCookbookById query
    - Accept cookbook ID as argument
    - Validate user ownership before returning
  - [x] 3.7 Ensure query tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify all queries return correct data
    - Verify user isolation is enforced
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- All queries enforce user isolation via userId filtering
- Pagination works correctly with limit/cursor
- Indexes are properly utilized for performance
- Recipe ownership is validated before returning data

---

### Testing

#### Task Group 4: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 4-6 tests written by Task Group 1 (schema validation)
    - Review the 6-8 tests written by Task Group 2 (mutations)
    - Review the 4-6 tests written by Task Group 3 (queries)
    - Total existing tests: approximately 14-20 tests
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify critical data layer workflows that lack test coverage
    - Focus ONLY on gaps related to recipe data model requirements
    - Do NOT assess entire application test coverage
    - Prioritize integration scenarios: create recipe -> query recipe -> update -> delete
  - [x] 4.3 Write up to 8 additional strategic tests maximum
    - Add tests for end-to-end recipe lifecycle if not covered
    - Add tests for ingredient category validation if not covered
    - Add tests for nutrition object structure if not covered
    - Add tests for physicalCookbook-recipe relationship if not covered
    - Focus on integration points between schema, mutations, and queries
    - Do NOT write comprehensive coverage for all edge cases
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to recipe data model (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 22-28 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-28 tests total)
- Critical data layer workflows are covered
- No more than 8 additional tests added in gap filling
- Testing focused exclusively on recipe data model requirements
- Schema, mutations, and queries work together correctly

---

## Execution Order

Recommended implementation sequence:

1. **Schema Layer (Task Group 1)** - Foundation for all other work
   - Define tables, fields, types, and indexes
   - Verify schema compiles with Convex

2. **Mutations Layer (Task Group 2)** - Depends on schema
   - Implement CRUD operations with validation
   - Set up authentication and ownership checks

3. **Queries Layer (Task Group 3)** - Depends on mutations for test data
   - Implement query functions with user isolation
   - Utilize indexes for performance

4. **Test Review (Task Group 4)** - Depends on all above
   - Review coverage and fill critical gaps
   - Ensure end-to-end workflows function correctly

---

## Key Files to Create/Modify

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Convex schema definitions for recipes and physicalCookbooks tables |
| `convex/recipes.ts` | Recipe CRUD mutations and query functions |
| `convex/physicalCookbooks.ts` | Physical cookbook mutations and queries |
| `convex/__tests__/recipes.test.ts` | Test file for recipe functionality |
| `convex/__tests__/physicalCookbooks.test.ts` | Test file for cookbook functionality |

---

## Reference Files

| File | Purpose |
|------|---------|
| `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts` | TypeScript interfaces for field naming consistency |
| `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/README.md` | Entity relationship documentation |

---

## Validation Rules Summary

| Source Type | Required Fields | Forbidden Fields |
|-------------|----------------|------------------|
| youtube | sourceUrl, youtubeVideoId | physicalCookbookId |
| website | sourceUrl | youtubeVideoId, physicalCookbookId |
| scanned | (none additional) | youtubeVideoId |
| manual | (none additional) | sourceUrl, youtubeVideoId, physicalCookbookId |
