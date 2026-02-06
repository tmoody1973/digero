/**
 * Creator Economy Schema Extensions
 *
 * Extends the base schema with tables for the Nebula-inspired
 * creator profit-sharing model and creator shop functionality.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// Validators
// =============================================================================

/**
 * Creator partnership tier validator
 */
export const creatorTier = v.union(
  v.literal("emerging"),    // 10K+ YT subs - standard share
  v.literal("established"), // 100K+ YT subs - 1.2x multiplier
  v.literal("partner")      // 500K+ YT subs - 1.5x multiplier, custom deals
);

/**
 * Creator application status validator
 */
export const applicationStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

/**
 * Product type validator for creator shop
 */
export const productType = v.union(
  v.literal("cookbook"),      // Physical or digital cookbook
  v.literal("course"),        // Cooking course/class
  v.literal("merchandise"),   // Branded merchandise
  v.literal("subscription"),  // Creator-specific subscription
  v.literal("equipment")      // Kitchen equipment/tools
);

/**
 * Order status validator
 */
export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("fulfilled"),
  v.literal("refunded"),
  v.literal("cancelled")
);

/**
 * Payout status validator
 */
export const payoutStatus = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("paid"),
  v.literal("failed")
);

/**
 * Message status validator
 */
export const messageStatus = v.union(
  v.literal("sent"),
  v.literal("failed")
);

// =============================================================================
// Creator Tables
// =============================================================================

/**
 * Creator Profiles Table
 *
 * Stores creator partnership information.
 * Creators are YouTube cooking channels that have applied and been approved.
 */
export const creatorProfiles = defineTable({
  // User relationship - creators must have a Digero account
  userId: v.string(),

  // YouTube channel information
  youtubeChannelId: v.string(),
  channelName: v.string(),
  channelAvatarUrl: v.string(),
  channelBannerUrl: v.optional(v.string()),
  subscriberCount: v.number(),

  // Partnership details
  tier: creatorTier,
  applicationStatus: applicationStatus,
  appliedAt: v.number(),
  approvedAt: v.optional(v.number()),

  // Payout information
  payoutEmail: v.optional(v.string()),
  stripeConnectId: v.optional(v.string()),
  paypalEmail: v.optional(v.string()),

  // Profile customization
  bio: v.optional(v.string()),
  specialties: v.array(v.string()),
  socialLinks: v.optional(v.object({
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    website: v.optional(v.string()),
  })),

  // RES multiplier based on tier
  resMultiplier: v.number(), // 1.0 for emerging, 1.2 for established, 1.5 for partner

  // Stats (denormalized for dashboard)
  totalRecipes: v.number(),
  totalFollowers: v.number(),
  totalEarnings: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_youtube_channel", ["youtubeChannelId"])
  .index("by_tier", ["tier"])
  .index("by_status", ["applicationStatus"]);

/**
 * Creator Products Table
 *
 * Stores products that creators sell through their shop.
 * Revenue is tracked for the 50/50 profit split.
 */
export const creatorProducts = defineTable({
  // Creator relationship
  creatorId: v.id("creatorProfiles"),

  // Product information
  name: v.string(),
  description: v.string(),
  type: productType,
  imageUrl: v.string(),
  additionalImages: v.array(v.string()),

  // Pricing
  price: v.number(), // In cents
  currency: v.string(), // USD, EUR, etc.
  memberDiscount: v.number(), // Percentage discount for Plus/Creator tier members

  // Digital product details
  digitalAssetUrl: v.optional(v.string()), // For digital downloads
  externalUrl: v.optional(v.string()), // For linking to external store

  // Physical product details
  requiresShipping: v.boolean(),
  shippingCost: v.optional(v.number()),

  // Inventory (for physical products)
  inventory: v.optional(v.number()),
  trackInventory: v.boolean(),

  // Status
  isActive: v.boolean(),
  isFeatured: v.boolean(),

  // Sales stats (denormalized)
  totalSales: v.number(),
  totalRevenue: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_creator", ["creatorId"])
  .index("by_type", ["type"])
  .index("by_featured", ["isFeatured", "isActive"])
  .index("by_creator_active", ["creatorId", "isActive"]);

/**
 * Creator Orders Table
 *
 * Tracks purchases from creator shops.
 * Supports member discounts and tracks commission for creators.
 */
export const creatorOrders = defineTable({
  // Order parties
  buyerId: v.string(), // Clerk user ID
  creatorId: v.id("creatorProfiles"),
  productId: v.id("creatorProducts"),

  // Order details
  quantity: v.number(),
  unitPrice: v.number(), // Price at time of purchase (cents)
  discountApplied: v.number(), // Discount amount (cents)
  subtotal: v.number(), // After discount (cents)
  shippingCost: v.number(), // 0 for digital (cents)
  total: v.number(), // Final amount charged (cents)

  // Payment tracking
  stripePaymentIntentId: v.optional(v.string()),
  revenuecatTransactionId: v.optional(v.string()),
  status: orderStatus,

  // Shipping info (for physical products)
  shippingAddress: v.optional(v.object({
    name: v.string(),
    line1: v.string(),
    line2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
  })),

  // Digital delivery
  downloadUrl: v.optional(v.string()),
  downloadExpiresAt: v.optional(v.number()),

  // Commission tracking (50% to creator)
  creatorCommission: v.number(), // Amount creator receives (cents)
  platformFee: v.number(), // Amount platform keeps (cents)

  // Timestamps
  createdAt: v.number(),
  paidAt: v.optional(v.number()),
  fulfilledAt: v.optional(v.number()),
})
  .index("by_buyer", ["buyerId"])
  .index("by_creator", ["creatorId"])
  .index("by_product", ["productId"])
  .index("by_status", ["status"])
  .index("by_creator_status", ["creatorId", "status"]);

/**
 * Revenue Transactions Table
 *
 * Tracks all subscription revenue for profit sharing calculations.
 * Data populated via RevenueCat webhooks.
 */
export const revenueTransactions = defineTable({
  // Transaction source
  userId: v.string(),
  productId: v.string(), // RevenueCat product ID
  transactionId: v.string(), // RevenueCat or App Store transaction ID

  // Revenue details
  grossRevenue: v.number(), // Full amount charged (cents)
  appStoreFee: v.number(), // 15-30% App Store cut (cents)
  revenuecatFee: v.number(), // RevenueCat fees (cents)
  netRevenue: v.number(), // After platform fees (cents)

  // Profit split
  platformShare: v.number(), // 50% of net profit (cents)
  creatorPoolShare: v.number(), // 50% of net profit (cents)

  // Currency
  currency: v.string(),
  exchangeRate: v.optional(v.number()),

  // Period tracking
  periodStart: v.number(),
  periodEnd: v.number(),
  isRenewal: v.boolean(),

  // Timestamps
  timestamp: v.number(),
  processedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_transaction", ["transactionId"])
  .index("by_period", ["periodStart", "periodEnd"])
  .index("by_timestamp", ["timestamp"]);

/**
 * Creator Payouts Table
 *
 * Tracks monthly payouts to creators based on Recipe Engagement Score.
 */
export const creatorPayouts = defineTable({
  // Creator relationship
  creatorId: v.id("creatorProfiles"),

  // Payout period
  periodStart: v.number(),
  periodEnd: v.number(),
  periodLabel: v.string(), // "January 2026"

  // Engagement metrics
  totalRES: v.number(), // Creator's Recipe Engagement Score
  platformTotalRES: v.number(), // Total platform RES for period
  resShare: v.number(), // Creator's percentage of platform RES

  // Revenue calculation
  creatorPoolAmount: v.number(), // Total creator pool for period (cents)
  subscriptionPayout: v.number(), // Share from subscriptions (cents)
  shopPayout: v.number(), // Commission from shop sales (cents)
  totalPayout: v.number(), // Total payout amount (cents)

  // Payment details
  status: payoutStatus,
  paymentMethod: v.optional(v.string()), // stripe_connect, paypal
  paymentId: v.optional(v.string()),
  paidAt: v.optional(v.number()),

  // Error handling
  failureReason: v.optional(v.string()),
  retryCount: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_creator", ["creatorId"])
  .index("by_period", ["periodStart", "periodEnd"])
  .index("by_status", ["status"])
  .index("by_creator_period", ["creatorId", "periodStart"]);

/**
 * Recipe Engagement Table
 *
 * Tracks engagement metrics for recipes to calculate creator payouts.
 * Aggregated daily for efficient queries.
 */
export const recipeEngagement = defineTable({
  // Recipe and creator
  recipeId: v.id("recipes"),
  creatorId: v.id("creatorProfiles"),

  // Time period (daily aggregation)
  date: v.string(), // YYYY-MM-DD

  // Engagement metrics
  saves: v.number(),
  cooks: v.number(), // "I made this" button presses
  shares: v.number(),
  ratings: v.number(),
  exclusiveViews: v.number(), // Views from Creator tier members

  // Calculated RES for the day
  engagementScore: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_recipe", ["recipeId"])
  .index("by_creator", ["creatorId"])
  .index("by_date", ["date"])
  .index("by_recipe_date", ["recipeId", "date"])
  .index("by_creator_date", ["creatorId", "date"]);

/**
 * Recipe Attribution Table
 *
 * Links recipes to creator profiles for engagement tracking.
 * Used when a user saves a recipe from a partnered creator's YouTube video.
 */
export const recipeAttribution = defineTable({
  // Recipe relationship
  recipeId: v.id("recipes"),

  // Creator relationship
  creatorId: v.id("creatorProfiles"),
  youtubeChannelId: v.string(),

  // Source tracking
  youtubeVideoId: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),

  // Attribution details
  isExclusive: v.boolean(), // Exclusive to Digero
  exclusiveUntil: v.optional(v.number()),

  // Timestamps
  attributedAt: v.number(),
})
  .index("by_recipe", ["recipeId"])
  .index("by_creator", ["creatorId"])
  .index("by_youtube_channel", ["youtubeChannelId"]);

/**
 * Creator Messages Table
 *
 * Stores messages sent by creators to their followers.
 * Messages are sent via OneSignal push notifications.
 */
export const creatorMessages = defineTable({
  // Creator relationship
  creatorId: v.id("creatorProfiles"),

  // Message content
  title: v.string(), // Max 50 characters
  body: v.string(), // Max 300 characters

  // Delivery tracking
  status: messageStatus,
  onesignalNotificationId: v.optional(v.string()),
  estimatedRecipients: v.number(),

  // Error tracking (for failed messages)
  errorMessage: v.optional(v.string()),

  // Timestamps
  sentAt: v.number(),
})
  .index("by_creator", ["creatorId"])
  .index("by_creator_sent", ["creatorId", "sentAt"]);
