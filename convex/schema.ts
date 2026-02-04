/**
 * Convex Schema Definitions
 *
 * Defines the database schema for Digero's recipe management system.
 * Includes tables for users, recipes, physical cookbooks, digital cookbooks,
 * scan sessions, meal planner, shopping lists, YouTube channels,
 * AI chat messages, and subscription tracking with proper indexing for efficient queries.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Cooking skill level validator
 * 3-value union for user profile
 */
const cookingSkillLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
);

/**
 * Subscription status validator
 * 3-value union for tracking user subscription state
 */
const subscriptionStatus = v.union(
  v.literal("free"),
  v.literal("premium"),
  v.literal("trial")
);

/**
 * Subscription type validator
 * 3-value union for subscription product type
 */
const subscriptionType = v.union(
  v.literal("monthly"),
  v.literal("annual"),
  v.literal("lifetime")
);

/**
 * Ingredient category validator
 * 8-value union matching shopping list generation requirements
 */
const ingredientCategory = v.union(
  v.literal("meat"),
  v.literal("produce"),
  v.literal("dairy"),
  v.literal("pantry"),
  v.literal("spices"),
  v.literal("condiments"),
  v.literal("bread"),
  v.literal("other")
);

/**
 * Recipe source validator
 * 5-value union for tracking recipe origin (includes ai_generated)
 */
const recipeSource = v.union(
  v.literal("youtube"),
  v.literal("website"),
  v.literal("scanned"),
  v.literal("manual"),
  v.literal("ai_generated")
);

/**
 * Difficulty level validator
 * 3-value union for recipe complexity
 */
const difficultyLevel = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard")
);

/**
 * Cookbook sort option validator
 * 3-value union for recipe ordering within cookbooks
 */
const cookbookSortOption = v.union(
  v.literal("position"),
  v.literal("dateAdded"),
  v.literal("title")
);

/**
 * Scan session status validator
 * Tracks the current state of a scanning session
 */
const scanSessionStatus = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled")
);

/**
 * Meal slot validator
 * 4-value union for meal planning time slots
 */
const mealSlot = v.union(
  v.literal("breakfast"),
  v.literal("lunch"),
  v.literal("dinner"),
  v.literal("snacks")
);

/**
 * Shopping list status validator
 * 2-value union for list lifecycle
 */
const shoppingListStatus = v.union(
  v.literal("active"),
  v.literal("archived")
);

/**
 * Shopping item category validator
 * 8-value union for grocery store organization
 */
const shoppingItemCategory = v.union(
  v.literal("Produce"),
  v.literal("Meat & Seafood"),
  v.literal("Dairy & Eggs"),
  v.literal("Pantry"),
  v.literal("Bakery"),
  v.literal("Frozen"),
  v.literal("Beverages"),
  v.literal("Household")
);

/**
 * YouTube channel category validator
 * Categories for cooking channels
 */
const channelCategory = v.union(
  v.literal("Italian"),
  v.literal("Asian"),
  v.literal("Quick Meals"),
  v.literal("Baking"),
  v.literal("Healthy"),
  v.literal("BBQ & Grilling"),
  v.literal("General")
);

/**
 * AI Chat message role validator
 * 2-value union for distinguishing user and assistant messages
 */
const chatRole = v.union(
  v.literal("user"),
  v.literal("assistant")
);

/**
 * Ingredient object structure
 * Supports structured storage for shopping list generation
 */
const ingredientObject = v.object({
  name: v.string(),
  quantity: v.number(),
  unit: v.string(),
  category: ingredientCategory,
});

/**
 * Nutrition object structure
 * Optional nested object for future Edamam API integration
 * All values in kcal (calories) or grams (macros)
 */
const nutritionObject = v.object({
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
});

export default defineSchema({
  /**
   * Users Table
   *
   * Stores user profile data synced from Clerk via webhook.
   * Custom profile fields (cookingSkillLevel, dietaryRestrictions) are
   * stored here and updated during onboarding.
   * Subscription fields are updated via RevenueCat webhooks.
   */
  users: defineTable({
    // Clerk user ID for identity linking
    clerkId: v.string(),

    // Profile information from Clerk
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),

    // Custom profile fields set during onboarding
    cookingSkillLevel: v.optional(cookingSkillLevel),
    dietaryRestrictions: v.array(v.string()),

    // Onboarding status
    hasCompletedOnboarding: v.boolean(),

    // Subscription fields (updated via RevenueCat webhooks)
    subscriptionStatus: v.optional(subscriptionStatus),
    subscriptionType: v.optional(subscriptionType),
    subscriptionExpiresAt: v.optional(v.number()),
    subscriptionCanceledAt: v.optional(v.number()),
    hasBillingIssue: v.optional(v.boolean()),
    revenuecatUserId: v.optional(v.string()),

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for looking up user by Clerk ID
    .index("by_clerk_id", ["clerkId"])
    // Index for looking up user by RevenueCat user ID
    .index("by_revenuecat_id", ["revenuecatUserId"]),

  /**
   * Scan History Table
   *
   * Tracks cookbook scans for rolling 30-day limit enforcement.
   * Each record represents one successful scan event.
   */
  scanHistory: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Timestamp when the scan occurred (Unix milliseconds)
    scannedAt: v.number(),
  })
    // Index for fetching user's scan history
    .index("by_user", ["userId"])
    // Index for time-based queries (rolling 30-day window)
    .index("by_user_scanned_at", ["userId", "scannedAt"]),

  /**
   * Recipes Table
   *
   * Core table for storing user recipes from all sources.
   * Uses Clerk userId string directly for multi-tenancy.
   */
  recipes: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Core recipe information
    title: v.string(),
    source: recipeSource,
    sourceUrl: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    imageUrl: v.string(),

    // Timing information (in minutes)
    servings: v.number(),
    prepTime: v.number(),
    cookTime: v.number(),

    // Recipe content
    ingredients: v.array(ingredientObject),
    instructions: v.array(v.string()),
    notes: v.optional(v.string()),

    // Nutrition data (optional, for future Edamam integration)
    nutrition: v.optional(nutritionObject),

    // Metadata
    cuisineType: v.optional(v.string()),
    isFavorited: v.boolean(),
    difficulty: v.optional(difficultyLevel),
    dietaryTags: v.array(v.string()),

    // Physical cookbook reference (for scanned recipes)
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),

    // Page number from physical cookbook (for scanned recipes)
    // Stored as string to support ranges like "pp. 42-43"
    pageNumber: v.optional(v.string()),

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for fetching user's recipes
    .index("by_user", ["userId"])
    // Index for chronological sorting
    .index("by_user_created", ["userId", "createdAt"])
    // Index for favorites filtering
    .index("by_user_favorited", ["userId", "isFavorited"])
    // Index for fetching recipes by physical cookbook
    .index("by_physical_cookbook", ["physicalCookbookId"]),

  /**
   * Physical Cookbooks Table
   *
   * Stores metadata for physical cookbooks users scan recipes from.
   * Enables reuse across multiple scanned recipes.
   */
  physicalCookbooks: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Cookbook information
    name: v.string(),
    author: v.optional(v.string()),

    // Cover image stored in Convex file storage
    coverImageId: v.optional(v.id("_storage")),

    // Timestamp (Unix milliseconds)
    createdAt: v.number(),
  })
    // Index for fetching user's cookbooks
    .index("by_user", ["userId"])
    // Index for finding cookbook by name for reuse
    .index("by_user_name", ["userId", "name"]),

  /**
   * Scan Sessions Table
   *
   * Tracks active and completed scanning sessions.
   * Links to physical cookbook and tracks recipes scanned in each session.
   */
  scanSessions: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Optional link to physical cookbook (created on first scan or cover capture)
    physicalCookbookId: v.optional(v.id("physicalCookbooks")),

    // Cookbook name (user entered or extracted from cover)
    bookName: v.string(),

    // Cover image stored in Convex file storage (optional)
    coverImageId: v.optional(v.id("_storage")),

    // Session status
    status: scanSessionStatus,

    // Recipes scanned in this session (IDs)
    scannedRecipeIds: v.array(v.id("recipes")),

    // Timestamps (Unix milliseconds)
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    // Index for fetching user's sessions
    .index("by_user", ["userId"])
    // Index for finding active session
    .index("by_user_status", ["userId", "status"]),

  /**
   * Cookbooks Table
   *
   * Digital cookbook collections for organizing recipes.
   * Supports both built-in system cookbooks (Favorites, Recently Added)
   * and user-created custom cookbooks.
   */
  cookbooks: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Cookbook information
    name: v.string(),
    description: v.string(),
    coverUrl: v.string(),

    // Denormalized recipe count for display
    recipeCount: v.number(),

    // Built-in cookbooks (Favorites, Recently Added) cannot be deleted
    isBuiltIn: v.boolean(),

    // Sort preference for recipes in this cookbook
    sortBy: v.optional(cookbookSortOption),

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for fetching user's cookbooks
    .index("by_user", ["userId"])
    // Index for filtering built-in vs user cookbooks
    .index("by_user_builtin", ["userId", "isBuiltIn"]),

  /**
   * Cookbook Recipes Junction Table
   *
   * Links recipes to cookbooks with position for manual ordering.
   * A recipe can belong to multiple cookbooks.
   */
  cookbookRecipes: defineTable({
    // Foreign key to cookbook
    cookbookId: v.id("cookbooks"),

    // Foreign key to recipe
    recipeId: v.id("recipes"),

    // Position for manual ordering (0-indexed)
    position: v.number(),

    // When the recipe was added to this cookbook
    dateAdded: v.number(),
  })
    // Index for fetching recipes in a cookbook (primary use case)
    .index("by_cookbook", ["cookbookId"])
    // Index for fetching cookbooks containing a recipe
    .index("by_recipe", ["recipeId"])
    // Composite index for uniqueness and lookup
    .index("by_cookbook_recipe", ["cookbookId", "recipeId"]),

  /**
   * Planned Meals Table
   *
   * Stores meal plan assignments where users schedule recipes
   * to specific days and meal slots (breakfast, lunch, dinner, snacks).
   * Supports weekly calendar view with drag-and-drop.
   */
  plannedMeals: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Reference to the recipe being planned
    recipeId: v.id("recipes"),

    // Denormalized recipe data for display without joins
    recipeName: v.string(),
    recipeImage: v.string(),
    prepTime: v.string(),

    // Schedule information
    // Day in YYYY-MM-DD format for easy sorting and filtering
    day: v.string(),
    // Meal slot type
    slot: mealSlot,

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for fetching user's meals for a specific day
    .index("by_user_day", ["userId", "day"])
    // Index for fetching user's meals by slot type
    .index("by_user_slot", ["userId", "slot"])
    // Index for fetching all user's meals
    .index("by_user", ["userId"]),

  /**
   * Shopping Lists Table
   *
   * Stores user shopping lists with status tracking for active/archived.
   * Lists can be generated from meal plans or created empty.
   */
  shoppingLists: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // List name (e.g., "Week of Feb 2")
    name: v.string(),

    // List status for filtering
    status: shoppingListStatus,

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    // Index for fetching user's lists
    .index("by_user", ["userId"])
    // Index for filtering by status
    .index("by_user_status", ["userId", "status"]),

  /**
   * Shopping Items Table
   *
   * Stores individual items within shopping lists.
   * Supports recipe source tracking and category organization.
   */
  shoppingItems: defineTable({
    // Reference to the parent shopping list
    listId: v.id("shoppingLists"),

    // Item information
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    category: shoppingItemCategory,

    // Check status
    checked: v.boolean(),

    // Custom item flag (vs recipe-generated)
    isCustom: v.boolean(),

    // Source recipe tracking (for aggregated items)
    recipeIds: v.array(v.id("recipes")),
    recipeName: v.optional(v.string()),

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for fetching items by list
    .index("by_list", ["listId"])
    // Index for filtering checked items
    .index("by_list_checked", ["listId", "checked"]),

  /**
   * YouTube Channels Table
   *
   * Stores YouTube channel data for the Discover feature.
   * Channels are shared across users - each user follows via userFollowedChannels.
   */
  youtubeChannels: defineTable({
    // YouTube channel ID for API lookups
    youtubeChannelId: v.string(),

    // Channel information (cached from YouTube API)
    name: v.string(),
    avatarUrl: v.string(),
    bannerUrl: v.optional(v.string()),
    subscriberCount: v.number(),
    description: v.string(),
    videoCount: v.number(),

    // Categorization for discovery
    category: channelCategory,

    // Featured flag for curated channels
    isFeatured: v.boolean(),

    // Cache tracking
    lastFetchedAt: v.number(),

    // Timestamps (Unix milliseconds)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for YouTube channel ID lookup (unique)
    .index("by_youtube_channel_id", ["youtubeChannelId"])
    // Index for featured channels
    .index("by_featured", ["isFeatured"])
    // Index for category filtering
    .index("by_category", ["category"]),

  /**
   * User Followed Channels Table
   *
   * Junction table linking users to channels they follow.
   * Enables personalized video feed from followed channels.
   */
  userFollowedChannels: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Reference to the channel
    channelId: v.id("youtubeChannels"),

    // When the user followed this channel
    followedAt: v.number(),
  })
    // Index for fetching user's followed channels
    .index("by_user", ["userId"])
    // Index for finding if user follows a specific channel
    .index("by_user_channel", ["userId", "channelId"])
    // Index for counting followers of a channel
    .index("by_channel", ["channelId"]),

  /**
   * YouTube Video Cache Table
   *
   * Caches video metadata to conserve YouTube API quota.
   * Videos expire after 24 hours and are re-fetched on demand.
   */
  youtubeVideoCache: defineTable({
    // YouTube video ID
    videoId: v.string(),

    // Cached video metadata
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    duration: v.string(),
    durationSeconds: v.number(),
    viewCount: v.number(),
    publishedAt: v.string(),
    channelId: v.string(),
    channelTitle: v.string(),

    // Cache timing
    cachedAt: v.number(),
    expiresAt: v.number(),
  })
    // Index for video ID lookup
    .index("by_video_id", ["videoId"])
    // Index for channel's videos
    .index("by_channel_id", ["channelId"])
    // Index for cache expiration cleanup
    .index("by_expires_at", ["expiresAt"]),

  /**
   * YouTube API Quota Tracking Table
   *
   * Tracks daily API usage to prevent exceeding quota limits.
   * Resets daily at midnight PST.
   */
  youtubeApiQuota: defineTable({
    // Date string in YYYY-MM-DD format
    date: v.string(),

    // Number of quota units used today
    unitsUsed: v.number(),

    // Quota limit (default 10,000)
    quotaLimit: v.number(),
  })
    // Index for date lookup
    .index("by_date", ["date"]),

  /**
   * AI Chat Sessions Table
   *
   * Stores chat session metadata for organizing conversations.
   * Each session represents a distinct conversation topic.
   */
  aiChatSessions: defineTable({
    // User relationship - Clerk user ID
    userId: v.string(),

    // Session title (auto-generated from first message or user-set)
    title: v.string(),

    // Preview text (first user message truncated)
    preview: v.optional(v.string()),

    // Number of messages in session
    messageCount: v.number(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Index for fetching user's sessions
    .index("by_user", ["userId"])
    // Index for sorting by most recent activity
    .index("by_user_updated", ["userId", "updatedAt"]),

  /**
   * AI Chat Messages Table
   *
   * Stores conversation history for AI recipe chat feature.
   * Messages are retained for 30 days and cleaned up via cron job.
   * Supports multimodal input (text and images) and structured recipe responses.
   */
  aiChatMessages: defineTable({
    // User relationship - Clerk user ID for multi-tenancy
    userId: v.string(),

    // Session relationship - links message to a chat session
    sessionId: v.id("aiChatSessions"),

    // Message content
    text: v.string(),

    // Message role (user or assistant)
    role: chatRole,

    // Optional image URL for multimodal input (user-uploaded ingredient photos)
    imageUrl: v.optional(v.string()),

    // Structured recipe data from AI response (stored as JSON)
    // Contains: summary, recipes array, meal_plan object
    recipeData: v.optional(v.any()),

    // Clarification questions from AI for quick reply buttons
    clarificationQuestions: v.optional(v.array(v.string())),

    // Timestamp (Unix milliseconds)
    createdAt: v.number(),
  })
    // Index for fetching user's chat messages
    .index("by_user", ["userId"])
    // Index for fetching messages in a session
    .index("by_session", ["sessionId"])
    // Index for chronological ordering within session
    .index("by_session_created", ["sessionId", "createdAt"])
    // Index for cleanup cron job (messages older than 30 days)
    .index("by_created", ["createdAt"]),
});
