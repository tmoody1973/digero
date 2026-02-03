# Specification: Recipe Data Model

## Goal
Define the Convex schema for recipes and physical cookbooks, establishing the foundational data layer for all recipe-related features including storage, retrieval, and multi-tenant access via Clerk user IDs.

## User Stories
- As a user, I want my recipes stored with complete metadata so that I can view all details about a recipe regardless of how it was imported
- As a user, I want my recipes isolated from other users so that only I can see and manage my personal recipe collection

## Specific Requirements

**Recipes Table Schema**
- Create `recipes` table in `convex/schema.ts` with defineTable and defineSchema
- Store `userId` as string (Clerk user ID) for multi-tenancy, not a Convex ID reference
- Use `v.union` with `v.literal` for enums: source, difficulty, ingredient category
- Store timestamps as `v.number()` (Unix milliseconds) for createdAt and updatedAt
- Use `v.optional()` for nullable fields: sourceUrl, youtubeVideoId, nutrition, cuisineType, difficulty, physicalCookbookId
- Default values (isFavorited: false, dietaryTags: [], notes: "") must be set in mutation handlers, not schema

**Physical Cookbooks Table Schema**
- Create `physicalCookbooks` table for reusable cookbook metadata across scanned recipes
- Store coverImageId as `v.optional(v.id("_storage"))` for Convex file storage reference
- Include userId, name, author (optional), coverImageId (optional), createdAt
- Reference from recipes via `physicalCookbookId: v.optional(v.id("physicalCookbooks"))`

**Ingredients Array Structure**
- Store as `v.array(v.object({...}))` with name, quantity, unit, category fields
- Use 8-value union for category: meat, produce, dairy, pantry, spices, condiments, bread, other
- Quantity as number (supports decimals like 1.5), unit as string for flexibility
- Category enum aligns with shopping list generation requirements

**Nutrition Object Structure**
- Store as optional nested object: `v.optional(v.object({calories, protein, carbs, fat}))`
- All nutrition fields as `v.number()` representing calories (kcal) and grams for macros
- Enables future Edamam API integration without schema migration

**Index Definitions**
- Create `by_user` index on `["userId"]` for primary recipe list queries
- Create `by_user_created` index on `["userId", "createdAt"]` for chronological sorting
- Create `by_user_favorited` index on `["userId", "isFavorited"]` for favorites filtering
- Create `by_user` index on physicalCookbooks for user's cookbook list

**Server-Side Validation Rules**
- Validate sourceUrl required when source is "youtube" or "website"
- Validate youtubeVideoId required when source is "youtube"
- Validate physicalCookbookId only allowed when source is "scanned"
- Throw descriptive errors in mutations: `throw new Error("YouTube video ID required for YouTube recipes")`
- Client-side validation is supplementary for UX only

**CRUD Mutations**
- Create `createRecipe` mutation with all required fields and source-specific validation
- Create `updateRecipe` mutation that auto-updates `updatedAt` timestamp
- Create `deleteRecipe` mutation that accepts recipe ID and validates user ownership
- Create `createPhysicalCookbook` and `deletePhysicalCookbook` mutations
- All mutations must verify userId matches authenticated user (via ctx.auth)

**Query Functions**
- Create `getRecipes` query filtered by userId with optional limit/cursor for pagination
- Create `getRecipeById` query that validates user ownership before returning
- Create `getFavoriteRecipes` query using by_user_favorited index
- Create `getPhysicalCookbooks` query for user's cookbook list

## Existing Code to Leverage

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`**
- Contains TypeScript interfaces for Ingredient, Nutrition, Recipe that define field structures
- Ingredient category enum matches required values: meat, produce, dairy, pantry, spices, condiments, bread, other
- Recipe interface shows source union type pattern to replicate in Convex schema
- Use as reference for field naming consistency across codebase

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/README.md`**
- Documents entity relationships: Cookbook has many Recipes, Recipe can belong to multiple Cookbooks
- Confirms recipe-cookbook is many-to-many (future junction table needed, not in this spec)
- Recipe links back to Channel for YouTube source tracking

## Out of Scope
- Recipe list and detail UI components (separate spec: Recipe List and Detail Views)
- Recipe creation form UI (separate spec: Manual Recipe Creation)
- Web recipe import functionality (separate spec: Web Recipe Import)
- YouTube recipe import functionality (separate spec: YouTube Recipe Import)
- Cookbook photo scanning (separate spec: Cookbook Photo Scanning)
- Cookbook organization and collections with many-to-many relationships (separate spec: Cookbook Organization)
- Nutrition analysis API integration with Edamam (post-MVP feature)
- Full-text search implementation on recipe fields
- Recipe filtering by cuisineType or dietaryTags (can be added incrementally)
- Channels table for YouTube channel tracking (separate spec)
