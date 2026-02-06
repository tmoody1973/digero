/**
 * Creator Demo Data Seeding
 *
 * Seeds Eitan Bernath as a Partner tier creator with products,
 * engagement data, and revenue transactions for hackathon demo.
 *
 * This script is IDEMPOTENT - running it multiple times will not
 * create duplicate data.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// =============================================================================
// Constants
// =============================================================================

/**
 * Eitan Bernath's YouTube channel ID
 * This is his real YouTube channel ID
 */
export const EITAN_YOUTUBE_CHANNEL_ID = "UCa_mGJ_h36iQ4hLthsncCCg";

/**
 * Demo user ID for the creator profile
 * This would be linked to an actual Clerk user in production
 */
export const DEMO_CREATOR_USER_ID = "demo_eitan_user";

/**
 * Eitan's creator profile data
 */
export const EITAN_PROFILE = {
  youtubeChannelId: EITAN_YOUTUBE_CHANNEL_ID,
  channelName: "Eitan Bernath",
  channelAvatarUrl:
    "https://yt3.googleusercontent.com/ytc/AIdro_mKxQvQqGkJ6YPiPWePfSUNYgIgvGBOmJqKJYxJ9OVQ8kw=s800-c-k-c0x00ffffff-no-rj",
  channelBannerUrl:
    "https://yt3.googleusercontent.com/M9OKb7Q2PFLCz0lM8w1NvqLvN5TJfljJLOLDkfCvXgdZ-UQRc5Bb3FGnwrJPOlKxF0prAWiuGQ=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
  subscriberCount: 3700000,
  tier: "partner" as const,
  resMultiplier: 1.5,
  bio: "James Beard Award-winning chef, Food Network star, and cookbook author. Bringing global flavors to home cooks everywhere!",
  specialties: ["International", "Quick Meals", "Comfort Food", "Baking"],
  socialLinks: {
    instagram: "@eitanbernath",
    tiktok: "@eitanbernath",
    website: "https://www.eitanbernath.com",
  },
  payoutEmail: "demo@eitanbernath.com",
};

/**
 * Products to seed for Eitan's shop
 */
export const EITAN_PRODUCTS = [
  {
    name: "Eitan Eats the World: A Cookbook",
    description:
      "Eitan's debut cookbook featuring globally-inspired recipes from his viral cooking videos. 100+ recipes from around the world, including fan favorites like his famous 15-minute pasta and show-stopping desserts. Perfect for home cooks who want to explore international flavors without complicated techniques.",
    type: "cookbook" as const,
    imageUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638392411i/59710420.jpg",
    additionalImages: [],
    price: 2499, // $24.99
    memberDiscount: 15,
    externalUrl: "https://www.eitanbernath.com/cookbook/",
    requiresShipping: false,
    trackInventory: false,
    isFeatured: true,
  },
  {
    name: "Eitan's Kitchen Essentials Bundle",
    description:
      "The essential tools Eitan uses in his own kitchen! This curated bundle includes a high-quality chef's knife, wooden cutting board, silicone spatula set, and more. Perfect for setting up your kitchen or upgrading your cooking game.",
    type: "equipment" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    additionalImages: [],
    price: 4999, // $49.99
    memberDiscount: 15,
    requiresShipping: true,
    shippingCost: 999, // $9.99
    trackInventory: false,
    isFeatured: false,
  },
];

/**
 * Generate engagement data for the last 30 days
 * Creates realistic, varied engagement with an upward trend
 */
function generateEngagementData(recipeIds: string[], creatorId: string) {
  const engagementRecords: Array<{
    recipeId: string;
    creatorId: string;
    date: string;
    saves: number;
    cooks: number;
    shares: number;
    ratings: number;
    exclusiveViews: number;
    engagementScore: number;
  }> = [];

  const now = new Date();

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Each recipe gets engagement data for each day
    recipeIds.forEach((recipeId, recipeIndex) => {
      // Base engagement varies by recipe "popularity"
      const popularityFactor = 1 - recipeIndex * 0.15; // First recipe is most popular

      // Trend factor: engagement increases over time (newer days = more engagement)
      const trendFactor = 1 + (30 - dayOffset) * 0.02;

      // Day of week factor: weekends are higher
      const dayOfWeek = date.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;

      // Random variation
      const randomFactor = 0.7 + Math.random() * 0.6;

      // Calculate base values
      const baseSaves = Math.floor(15 * popularityFactor * trendFactor * weekendFactor * randomFactor);
      const baseCooks = Math.floor(8 * popularityFactor * trendFactor * weekendFactor * randomFactor);
      const baseShares = Math.floor(5 * popularityFactor * trendFactor * weekendFactor * randomFactor);
      const baseRatings = Math.floor(3 * popularityFactor * trendFactor * weekendFactor * randomFactor);
      const baseExclusiveViews = Math.floor(10 * popularityFactor * trendFactor * weekendFactor * randomFactor);

      // Calculate RES: saves (1pt) + cooks (5pt) + shares (3pt) + ratings (2pt) + exclusive views (2pt)
      const engagementScore =
        baseSaves * 1 +
        baseCooks * 5 +
        baseShares * 3 +
        baseRatings * 2 +
        baseExclusiveViews * 2;

      engagementRecords.push({
        recipeId,
        creatorId,
        date: dateStr,
        saves: baseSaves,
        cooks: baseCooks,
        shares: baseShares,
        ratings: baseRatings,
        exclusiveViews: baseExclusiveViews,
        engagementScore,
      });
    });
  }

  return engagementRecords;
}

/**
 * Generate revenue transactions for the current month
 * Simulates $1000 gross revenue -> ~$500 creator pool
 */
function generateRevenueTransactions() {
  const transactions: Array<{
    userId: string;
    productId: string;
    transactionId: string;
    grossRevenue: number;
    appStoreFee: number;
    revenuecatFee: number;
    netRevenue: number;
    platformShare: number;
    creatorPoolShare: number;
    currency: string;
    periodStart: number;
    periodEnd: number;
    isRenewal: boolean;
    timestamp: number;
  }> = [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Simulate ~20 subscription transactions this month
  // Mix of Plus ($4.99) and Creator ($9.99) subscriptions
  const transactionCount = 20;

  for (let i = 0; i < transactionCount; i++) {
    // Random day within the month
    const dayOffset = Math.floor(Math.random() * (now.getDate()));
    const transactionDate = new Date(startOfMonth);
    transactionDate.setDate(transactionDate.getDate() + dayOffset);

    // 70% Plus, 30% Creator subscriptions
    const isCreatorTier = Math.random() > 0.7;
    const grossRevenue = isCreatorTier ? 999 : 499; // $9.99 or $4.99

    // App Store takes ~30% (15% for small business, 30% standard)
    const appStoreFee = Math.floor(grossRevenue * 0.3);
    const revenuecatFee = Math.floor(grossRevenue * 0.01); // ~1% RevenueCat fee
    const netRevenue = grossRevenue - appStoreFee - revenuecatFee;

    // 50/50 split between platform and creator pool
    const platformShare = Math.floor(netRevenue * 0.5);
    const creatorPoolShare = netRevenue - platformShare;

    transactions.push({
      userId: `demo_user_${i}`,
      productId: isCreatorTier ? "digero_creator_monthly" : "digero_plus_monthly",
      transactionId: `demo_txn_${Date.now()}_${i}`,
      grossRevenue,
      appStoreFee,
      revenuecatFee,
      netRevenue,
      platformShare,
      creatorPoolShare,
      currency: "USD",
      periodStart: startOfMonth.getTime(),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime(),
      isRenewal: Math.random() > 0.5,
      timestamp: transactionDate.getTime(),
    });
  }

  return transactions;
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Check if demo data already exists
 */
export const checkDemoDataExists = query({
  args: {},
  handler: async (ctx) => {
    // Check if Eitan's creator profile exists
    const creatorProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_youtube_channel", (q) =>
        q.eq("youtubeChannelId", EITAN_YOUTUBE_CHANNEL_ID)
      )
      .first();

    return {
      hasCreatorProfile: !!creatorProfile,
      creatorId: creatorProfile?._id || null,
    };
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Seed demo data for Eitan Bernath
 *
 * This mutation is IDEMPOTENT - it checks for existing data before creating.
 * Safe to run multiple times.
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // IMPORTANT: Always use DEMO_CREATOR_USER_ID for demo data
    // This prevents demo recipes from appearing in real user accounts
    // Previously this used identity?.subject which caused demo recipes
    // to be assigned to whoever ran the seed function
    const currentUserId = DEMO_CREATOR_USER_ID;

    const now = Date.now();
    const summary = {
      creatorProfile: false,
      products: 0,
      recipes: 0,
      engagementRecords: 0,
      revenueTransactions: 0,
      payoutRecord: false,
      alreadySeeded: false,
    };

    // Step 1: Check if creator profile already exists
    let creatorProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_youtube_channel", (q) =>
        q.eq("youtubeChannelId", EITAN_YOUTUBE_CHANNEL_ID)
      )
      .first();

    if (creatorProfile) {
      // Data already seeded, return early
      summary.alreadySeeded = true;
      return {
        success: true,
        message: "Demo data already exists. Skipping seeding.",
        summary,
        creatorId: creatorProfile._id,
      };
    }

    // Step 2: Check if YouTube channel exists in youtubeChannels table
    let youtubeChannel = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_youtube_channel_id", (q) =>
        q.eq("youtubeChannelId", EITAN_YOUTUBE_CHANNEL_ID)
      )
      .first();

    // If channel doesn't exist, create it
    if (!youtubeChannel) {
      await ctx.db.insert("youtubeChannels", {
        youtubeChannelId: EITAN_YOUTUBE_CHANNEL_ID,
        name: EITAN_PROFILE.channelName,
        avatarUrl: EITAN_PROFILE.channelAvatarUrl,
        bannerUrl: EITAN_PROFILE.channelBannerUrl,
        subscriberCount: EITAN_PROFILE.subscriberCount,
        description: EITAN_PROFILE.bio,
        videoCount: 500,
        category: "General",
        isFeatured: true,
        lastFetchedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Step 3: Create creator profile for the current user
    const creatorId = await ctx.db.insert("creatorProfiles", {
      userId: currentUserId,
      youtubeChannelId: EITAN_PROFILE.youtubeChannelId,
      channelName: EITAN_PROFILE.channelName,
      channelAvatarUrl: EITAN_PROFILE.channelAvatarUrl,
      channelBannerUrl: EITAN_PROFILE.channelBannerUrl,
      subscriberCount: EITAN_PROFILE.subscriberCount,
      tier: EITAN_PROFILE.tier,
      applicationStatus: "approved",
      appliedAt: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      approvedAt: now - 29 * 24 * 60 * 60 * 1000, // 29 days ago
      payoutEmail: EITAN_PROFILE.payoutEmail,
      bio: EITAN_PROFILE.bio,
      specialties: EITAN_PROFILE.specialties,
      socialLinks: EITAN_PROFILE.socialLinks,
      resMultiplier: EITAN_PROFILE.resMultiplier,
      totalRecipes: 8,
      totalFollowers: 1250,
      totalEarnings: 0, // Will be updated after payout processing
      createdAt: now,
      updatedAt: now,
    });
    summary.creatorProfile = true;

    // Step 4: Create products
    for (const productData of EITAN_PRODUCTS) {
      await ctx.db.insert("creatorProducts", {
        creatorId,
        name: productData.name,
        description: productData.description,
        type: productData.type,
        imageUrl: productData.imageUrl,
        additionalImages: productData.additionalImages,
        price: productData.price,
        currency: "USD",
        memberDiscount: productData.memberDiscount,
        externalUrl: productData.externalUrl,
        requiresShipping: productData.requiresShipping,
        shippingCost: productData.shippingCost,
        trackInventory: productData.trackInventory,
        isActive: true,
        isFeatured: productData.isFeatured,
        totalSales: productData.isFeatured ? 150 : 45, // Simulate some sales
        totalRevenue: productData.isFeatured ? 374850 : 224955,
        createdAt: now,
        updatedAt: now,
      });
      summary.products++;
    }

    // Step 5: Create demo recipes attributed to Eitan
    const recipeIds: Id<"recipes">[] = [];
    const demoRecipes = [
      {
        title: "15-Minute Garlic Butter Pasta",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
        youtubeVideoId: "dQw4w9WgXcQ",
      },
      {
        title: "Crispy Korean Fried Chicken",
        imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
        youtubeVideoId: "xvFZjo5PgG0",
      },
      {
        title: "Perfect Homemade Pizza Dough",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
        youtubeVideoId: "abc123demo",
      },
      {
        title: "Ultimate Chocolate Chip Cookies",
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
        youtubeVideoId: "def456demo",
      },
      {
        title: "5-Ingredient Chicken Tikka Masala",
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
        youtubeVideoId: "ghi789demo",
      },
      {
        title: "Japanese Fluffy Pancakes",
        imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
        youtubeVideoId: "jkl012demo",
      },
      {
        title: "One-Pot Mexican Rice",
        imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80",
        youtubeVideoId: "mno345demo",
      },
      {
        title: "Easy French Crepes",
        imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80",
        youtubeVideoId: "pqr678demo",
      },
    ];

    for (const recipe of demoRecipes) {
      const recipeId = await ctx.db.insert("recipes", {
        userId: currentUserId,
        title: recipe.title,
        source: "youtube",
        sourceUrl: `https://www.youtube.com/watch?v=${recipe.youtubeVideoId}`,
        youtubeVideoId: recipe.youtubeVideoId,
        imageUrl: recipe.imageUrl,
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
          { name: "Demo ingredient", quantity: 1, unit: "cup", category: "pantry" },
        ],
        instructions: ["This is a demo recipe for showcase purposes."],
        isFavorited: false,
        dietaryTags: [],
        createdAt: now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        updatedAt: now,
      });
      recipeIds.push(recipeId);

      // Create recipe attribution
      await ctx.db.insert("recipeAttribution", {
        recipeId,
        creatorId,
        youtubeChannelId: EITAN_YOUTUBE_CHANNEL_ID,
        youtubeVideoId: recipe.youtubeVideoId,
        isExclusive: false,
        attributedAt: now,
      });
      summary.recipes++;
    }

    // Step 6: Generate and insert engagement data
    const engagementData = generateEngagementData(
      recipeIds.map((id) => id.toString()),
      creatorId.toString()
    );

    for (const engagement of engagementData) {
      await ctx.db.insert("recipeEngagement", {
        recipeId: engagement.recipeId as Id<"recipes">,
        creatorId,
        date: engagement.date,
        saves: engagement.saves,
        cooks: engagement.cooks,
        shares: engagement.shares,
        ratings: engagement.ratings,
        exclusiveViews: engagement.exclusiveViews,
        engagementScore: engagement.engagementScore,
        createdAt: now,
        updatedAt: now,
      });
      summary.engagementRecords++;
    }

    // Step 7: Generate and insert revenue transactions
    const transactions = generateRevenueTransactions();

    for (const txn of transactions) {
      await ctx.db.insert("revenueTransactions", {
        userId: txn.userId,
        productId: txn.productId,
        transactionId: txn.transactionId,
        grossRevenue: txn.grossRevenue,
        appStoreFee: txn.appStoreFee,
        revenuecatFee: txn.revenuecatFee,
        netRevenue: txn.netRevenue,
        platformShare: txn.platformShare,
        creatorPoolShare: txn.creatorPoolShare,
        currency: txn.currency,
        periodStart: txn.periodStart,
        periodEnd: txn.periodEnd,
        isRenewal: txn.isRenewal,
        timestamp: txn.timestamp,
      });
      summary.revenueTransactions++;
    }

    // Step 8: Calculate total RES and create payout record
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const periodLabel = startOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Calculate Eitan's total RES for the month
    const eitanRES = engagementData.reduce((sum, e) => sum + e.engagementScore, 0);

    // Calculate platform total RES (Eitan is ~70% of platform in demo)
    const platformTotalRES = Math.floor(eitanRES / 0.7);

    // Calculate creator pool from transactions
    const creatorPoolTotal = transactions.reduce((sum, t) => sum + t.creatorPoolShare, 0);

    // Eitan's share based on RES
    const eitanResShare = eitanRES / platformTotalRES;
    const eitanSubscriptionPayout = Math.floor(creatorPoolTotal * eitanResShare);

    // Add shop commission (~$50 from demo sales)
    const shopPayout = 5000; // $50 in cents

    const totalPayout = eitanSubscriptionPayout + shopPayout;

    await ctx.db.insert("creatorPayouts", {
      creatorId,
      periodStart: startOfMonth.getTime(),
      periodEnd: endOfMonth.getTime(),
      periodLabel,
      totalRES: Math.floor(eitanRES * EITAN_PROFILE.resMultiplier),
      platformTotalRES,
      resShare: eitanResShare,
      creatorPoolAmount: creatorPoolTotal,
      subscriptionPayout: eitanSubscriptionPayout,
      shopPayout,
      totalPayout,
      status: "pending",
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    summary.payoutRecord = true;

    // Update creator's total earnings
    await ctx.db.patch(creatorId, {
      totalEarnings: totalPayout,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Demo data seeded successfully!",
      summary,
      creatorId,
      estimatedEarnings: {
        subscriptionShare: eitanSubscriptionPayout,
        shopCommission: shopPayout,
        totalPayout,
        resShare: eitanResShare,
        formattedTotal: `$${(totalPayout / 100).toFixed(2)}`,
      },
    };
  },
});

/**
 * Clear demo data (for resetting)
 *
 * WARNING: This will delete all demo data. Only use in development.
 */
export const clearDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Find Eitan's creator profile
    const creatorProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_youtube_channel", (q) =>
        q.eq("youtubeChannelId", EITAN_YOUTUBE_CHANNEL_ID)
      )
      .first();

    if (!creatorProfile) {
      return { success: true, message: "No demo data to clear." };
    }

    const creatorId = creatorProfile._id;

    // Delete recipe engagements
    const engagements = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const engagement of engagements) {
      await ctx.db.delete(engagement._id);
    }

    // Delete recipe attributions
    const attributions = await ctx.db
      .query("recipeAttribution")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const attribution of attributions) {
      // Delete the recipe too
      await ctx.db.delete(attribution.recipeId);
      await ctx.db.delete(attribution._id);
    }

    // Delete products
    const products = await ctx.db
      .query("creatorProducts")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    // Delete orders
    const orders = await ctx.db
      .query("creatorOrders")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

    // Delete payouts
    const payouts = await ctx.db
      .query("creatorPayouts")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const payout of payouts) {
      await ctx.db.delete(payout._id);
    }

    // Delete messages
    const messages = await ctx.db
      .query("creatorMessages")
      .withIndex("by_creator", (q) => q.eq("creatorId", creatorId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete demo revenue transactions
    const transactions = await ctx.db
      .query("revenueTransactions")
      .collect();

    for (const txn of transactions) {
      if (txn.transactionId.startsWith("demo_txn_")) {
        await ctx.db.delete(txn._id);
      }
    }

    // Delete creator profile
    await ctx.db.delete(creatorId);

    return {
      success: true,
      message: "Demo data cleared successfully.",
    };
  },
});
