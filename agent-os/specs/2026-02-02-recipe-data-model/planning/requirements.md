# Spec Requirements: Recipe Data Model

## Initial Description

Create Convex schema for recipes with fields for title, source, sourceUrl, imageUrl, ingredients, instructions, servings, and notes. Include user relationship for multi-tenancy.

Source: Product Roadmap - Week 1: Foundation and Core Flow (Feature #2)
Effort Estimate: Small (S) - 2-3 days
Priority: Critical - Foundation for all recipe-related features

## Requirements Discussion

### First Round Questions

**Q1:** The existing `Recipe` type includes `prepTime` and `cookTime` (both numbers, presumably minutes), but your idea.md description doesn't mention these. I assume we should include them in the Convex schema since they're essential for meal planning. Is that correct?
**Answer:** Yes, include in schema

**Q2:** The `Nutrition` type (calories, protein, carbs, fat) is included in the existing Recipe interface, but the roadmap indicates Nutrition Analysis is a post-MVP feature. Should we include the `nutrition` field in the schema now as an optional field, or omit it entirely until post-hackathon?
**Answer:** Yes, include as optional field now

**Q3:** For `ingredients`, the existing type uses structured objects with `name`, `quantity`, `unit`, and `category`. Is this the correct structure for Convex, or should we simplify to just string arrays for the MVP?
**Answer:** Use structured objects `{name, quantity, unit, category}`

**Q4:** I assume each recipe will have a `userId` field that references the Clerk user ID (synced to Convex via webhook). Should this be the Clerk `userId` string directly, or should we create a separate `users` table in Convex and reference that ID?
**Answer:** Store Clerk `userId` string directly on recipes (no separate users table reference)

**Q5:** For the `scannedFromBook` optional field (linking to a physical cookbook), should this be a nested object as shown in types.ts, or should we create a separate `CookbookSource` table for physical books that users can reuse across multiple scanned recipes?
**Answer:** Use whatever is best practice (recommendation needed)

**Q6:** The `source` union type validation - should we add validation logic in Convex mutations to enforce source type rules, or handle it purely in the client?
**Answer:** Use best practices (recommendation needed)

**Q7:** Are there any additional fields not in the current types.ts that you want to add?
**Answer:** Add ALL of these: cuisine type, favorited boolean, difficulty level, dietary tags

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Existing Data Model Types - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`
- Feature: Entity Relationships - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/README.md`

No existing Convex schemas identified - this will be the first Convex table implementation.

### Follow-up Questions

No follow-up questions needed - user provided comprehensive answers.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Best Practice Recommendations

### Recommendation #5: scannedFromBook Structure

**Recommendation: Use a separate `physicalCookbooks` table.**

Rationale:
- Users will likely scan multiple recipes from the same physical cookbook
- A separate table enables:
  - Reusing cookbook metadata (name, cover image) across recipes
  - Future features like "browse all recipes from this cookbook"
  - Updating cookbook info in one place (e.g., fixing a typo in the book name)
  - Avoiding data duplication and inconsistency
- The `recipes` table will store a nullable `physicalCookbookId` foreign key
- This follows database normalization best practices per `agent-os/standards/backend/models.md`

Schema addition:
```typescript
// physicalCookbooks table
{
  userId: string,        // Clerk user ID (owner)
  name: string,          // e.g., "Salt Fat Acid Heat"
  author: string,        // optional, e.g., "Samin Nosrat"
  coverImageId: string,  // Convex file storage ID (optional)
  createdAt: number,     // timestamp
}

// recipes table addition
{
  physicalCookbookId: Id<"physicalCookbooks"> | null,  // nullable reference
}
```

### Recommendation #6: Validation Location

**Recommendation: Implement validation in Convex mutations (server-side) as the primary enforcement, with lightweight client-side validation for UX.**

Rationale:
- **Server-side (Convex mutations) is authoritative:** Prevents invalid data regardless of client implementation, ensures data integrity, and follows defense-in-depth principle
- **Client-side is supplementary:** Provides immediate feedback to users without round-trip, but never trusted as sole validation
- Convex's TypeScript schema provides automatic type validation; business rules should be in mutation handlers

Validation rules to enforce in mutations:
1. `sourceUrl` must be non-null when `source` is `'youtube'` or `'website'`
2. `sourceUrl` should be null (or ignored) when `source` is `'manual'` or `'scanned'`
3. `youtubeVideoId` must be non-null when `source` is `'youtube'`
4. `youtubeVideoId` should be null for all other source types
5. `physicalCookbookId` should only be set when `source` is `'scanned'`

## Requirements Summary

### Functional Requirements

**Core Recipe Entity:**
- Store recipe data with full metadata for all source types (manual, web, YouTube, scanned)
- Support multi-tenancy via Clerk userId stored directly on each recipe
- Enable structured ingredient storage for shopping list generation
- Support optional nutrition data for future Edamam integration
- Track recipe source and preserve source-specific metadata

**Recipe Fields (Complete):**
- `userId` - Clerk user ID string (required, indexed)
- `title` - Recipe name (required)
- `source` - Enum: 'youtube' | 'website' | 'scanned' | 'manual' (required)
- `sourceUrl` - Original URL (nullable, required for youtube/website)
- `youtubeVideoId` - YouTube video ID (nullable, required for youtube)
- `imageUrl` - Recipe image URL or Convex file ID (required)
- `servings` - Number of servings (required)
- `prepTime` - Preparation time in minutes (required)
- `cookTime` - Cooking time in minutes (required)
- `ingredients` - Array of structured ingredient objects (required)
- `instructions` - Array of step strings (required)
- `notes` - User notes (optional, default empty string)
- `nutrition` - Optional nutrition object (calories, protein, carbs, fat)
- `cuisineType` - String for cuisine category (optional)
- `isFavorited` - Boolean flag (default false)
- `difficulty` - Enum: 'easy' | 'medium' | 'hard' (optional)
- `dietaryTags` - Array of strings: 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', etc. (default empty array)
- `physicalCookbookId` - Reference to physicalCookbooks table (nullable)
- `createdAt` - Timestamp (required, auto-set)
- `updatedAt` - Timestamp (required, auto-updated)

**Supporting Entity - Physical Cookbooks:**
- Store metadata for physical cookbooks users scan from
- Enable reuse across multiple scanned recipes
- Track cookbook name, author, and cover image

**Ingredient Structure:**
```typescript
{
  name: string,      // e.g., "all-purpose flour"
  quantity: number,  // e.g., 2
  unit: string,      // e.g., "cups"
  category: 'meat' | 'produce' | 'dairy' | 'pantry' | 'spices' | 'condiments' | 'bread' | 'other'
}
```

**Nutrition Structure (Optional):**
```typescript
{
  calories: number,
  protein: number,   // grams
  carbs: number,     // grams
  fat: number        // grams
}
```

### Reusability Opportunities

- Ingredient category enum aligns with ShoppingList ItemCategory for shopping list generation
- Recipe source types will be reused across import features (YouTube, web, scanner)
- Structured ingredients enable automatic shopping list aggregation
- Dietary tags and cuisine type enable future filtering/search features

### Scope Boundaries

**In Scope:**
- Convex schema definition for `recipes` table
- Convex schema definition for `physicalCookbooks` table
- TypeScript type definitions matching Convex schema
- Basic CRUD mutations (create, read, update, delete)
- Server-side validation in mutations
- Index definitions for common queries (userId, createdAt, isFavorited)

**Out of Scope:**
- Recipe list/detail UI components (separate spec: Recipe List and Detail Views)
- Recipe creation form UI (separate spec: Manual Recipe Creation)
- Import functionality (separate specs: Web Recipe Import, YouTube Recipe Import, Cookbook Photo Scanning)
- Cookbook organization/collections (separate spec: Cookbook Organization)
- Nutrition analysis API integration (post-MVP)
- Search/filtering implementation (can be added incrementally)

### Technical Considerations

**Convex Schema Definition:**
```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    // User relationship
    userId: v.string(),

    // Core fields
    title: v.string(),
    source: v.union(
      v.literal("youtube"),
      v.literal("website"),
      v.literal("scanned"),
      v.literal("manual")
    ),
    sourceUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    imageUrl: v.string(),

    // Timing
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),

    // Content
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.string(),
        category: v.union(
          v.literal("meat"),
          v.literal("produce"),
          v.literal("dairy"),
          v.literal("pantry"),
          v.literal("spices"),
          v.literal("condiments"),
          v.literal("bread"),
          v.literal("other")
        ),
      })
    ),
    instructions: v.array(v.string()),
    notes: v.optional(v.string()),

    // Nutrition (optional, for future Edamam integration)
    nutrition: v.optional(
      v.object({
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number(),
      })
    ),

    // Additional metadata
    cuisineType: v.optional(v.string()),
    isFavorited: v.boolean(),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )
    ),
    dietaryTags: v.array(v.string()),

    // Physical cookbook reference (for scanned recipes)
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_favorited", ["userId", "isFavorited"]),

  physicalCookbooks: defineTable({
    userId: v.string(),
    name: v.string(),
    author: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
```

**Integration Points:**
- Clerk authentication provides userId for all mutations
- Convex real-time queries enable automatic UI updates
- File storage (Convex `_storage`) for recipe images and cookbook covers
- Schema supports future Cookbook Organization feature (many-to-many via separate junction table)

**Indexes Defined:**
- `by_user` - Primary query pattern for fetching user's recipes
- `by_user_created` - Sorting by creation date
- `by_user_favorited` - Quick access to favorited recipes

**Validation Implementation:**
Server-side validation should be implemented in mutation handlers following these patterns:
```typescript
// Example validation in mutation
if (args.source === "youtube" && !args.youtubeVideoId) {
  throw new Error("YouTube video ID is required for YouTube recipes");
}
if (args.source === "youtube" && !args.sourceUrl) {
  throw new Error("Source URL is required for YouTube recipes");
}
if (args.source === "scanned" && args.physicalCookbookId === undefined) {
  // Allow but log warning - cookbook ID is recommended but not required
}
```
