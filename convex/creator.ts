/**
 * Creator Backend Functions
 *
 * Convex queries and mutations for creator dashboard,
 * earnings tracking, and partnership management.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// =============================================================================
// Creator Profile Queries
// =============================================================================

/**
 * Get creator profile by user ID
 */
export const getCreatorProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get creator profile by ID
 */
export const getCreator = query({
  args: { creatorId: v.id("creatorProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.creatorId);
  },
});

/**
 * Get creator by YouTube channel ID
 */
export const getCreatorByChannel = query({
  args: { youtubeChannelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorProfiles")
      .withIndex("by_youtube_channel", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();
  },
});

// =============================================================================
// Creator Dashboard Queries
// =============================================================================

/**
 * Get creator stats for dashboard
 */
export const getCreatorStats = query({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creatorProfiles")
      .filter((q) => q.eq(q.field("_id"), args.creatorId))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get current month engagement
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Format dates for index queries
    const currentMonthStart = startOfMonth.toISOString().split("T")[0];
    const lastMonthStart = startOfLastMonth.toISOString().split("T")[0];
    const lastMonthEnd = endOfLastMonth.toISOString().split("T")[0];

    // Get current month engagement
    const currentEngagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_creator_date", (q) =>
        q.eq("creatorId", args.creatorId as Id<"creatorProfiles">).gte("date", currentMonthStart)
      )
      .collect();

    // Get last month engagement for comparison
    const lastEngagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_creator_date", (q) =>
        q
          .eq("creatorId", args.creatorId as Id<"creatorProfiles">)
          .gte("date", lastMonthStart)
          .lte("date", lastMonthEnd)
      )
      .collect();

    // Aggregate current month stats
    const currentStats = currentEngagement.reduce(
      (acc, e) => ({
        saves: acc.saves + e.saves,
        cooks: acc.cooks + e.cooks,
        shares: acc.shares + e.shares,
        ratings: acc.ratings + e.ratings,
        exclusiveViews: acc.exclusiveViews + e.exclusiveViews,
        totalRES: acc.totalRES + e.engagementScore,
      }),
      { saves: 0, cooks: 0, shares: 0, ratings: 0, exclusiveViews: 0, totalRES: 0 }
    );

    // Aggregate last month stats for comparison
    const lastStats = lastEngagement.reduce(
      (acc, e) => ({
        saves: acc.saves + e.saves,
        cooks: acc.cooks + e.cooks,
        shares: acc.shares + e.shares,
      }),
      { saves: 0, cooks: 0, shares: 0 }
    );

    // Calculate percentage changes
    const calcChange = (current: number, last: number) =>
      last === 0 ? 0 : ((current - last) / last) * 100;

    return {
      channelName: creator.channelName,
      tier: creator.tier,
      resMultiplier: creator.resMultiplier,
      totalRecipes: creator.totalRecipes,
      totalFollowers: creator.totalFollowers,
      totalSaves: currentStats.saves,
      totalCooks: currentStats.cooks,
      totalShares: currentStats.shares,
      totalRatings: currentStats.ratings,
      exclusiveViews: currentStats.exclusiveViews,
      totalRES: currentStats.totalRES,
      savesChange: calcChange(currentStats.saves, lastStats.saves),
      cooksChange: calcChange(currentStats.cooks, lastStats.cooks),
      sharesChange: calcChange(currentStats.shares, lastStats.shares),
    };
  },
});

/**
 * Get creator earnings for dashboard
 */
export const getCreatorEarnings = query({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get current month's engagement for this creator
    const currentMonthStart = startOfMonth.toISOString().split("T")[0];

    const creatorEngagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_creator_date", (q) =>
        q.eq("creatorId", args.creatorId as Id<"creatorProfiles">).gte("date", currentMonthStart)
      )
      .collect();

    // Get platform-wide engagement for the same period
    const platformEngagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_date", (q) => q.gte("date", currentMonthStart))
      .collect();

    const creatorRES = creatorEngagement.reduce((sum, e) => sum + e.engagementScore, 0);
    const platformRES = platformEngagement.reduce((sum, e) => sum + e.engagementScore, 0);

    // Get current month revenue transactions
    const transactions = await ctx.db
      .query("revenueTransactions")
      .withIndex("by_period", (q) => q.gte("periodStart", startOfMonth.getTime()))
      .collect();

    const creatorPoolTotal = transactions.reduce((sum, t) => sum + t.creatorPoolShare, 0);

    // Calculate creator's share
    const resShare = platformRES > 0 ? creatorRES / platformRES : 0;
    const subscriptionShare = Math.floor(creatorPoolTotal * resShare);

    // Get shop commission
    const orders = await ctx.db
      .query("creatorOrders")
      .withIndex("by_creator_status", (q) =>
        q.eq("creatorId", args.creatorId as Id<"creatorProfiles">).eq("status", "paid")
      )
      .collect();

    const shopCommission = orders
      .filter((o) => o.paidAt && o.paidAt >= startOfMonth.getTime())
      .reduce((sum, o) => sum + o.creatorCommission, 0);

    // Get last 7 days data for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayEngagement = creatorEngagement
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.engagementScore, 0);

      const dayPlatformRES = platformEngagement
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.engagementScore, 0);

      // Estimate daily earnings based on RES share
      const dailyRevenue = transactions
        .filter((t) => {
          const tDate = new Date(t.timestamp).toISOString().split("T")[0];
          return tDate === dateStr;
        })
        .reduce((sum, t) => sum + t.creatorPoolShare, 0);

      const dayShare = dayPlatformRES > 0 ? dayEngagement / dayPlatformRES : 0;
      const dayAmount = Math.floor(dailyRevenue * dayShare);

      last7Days.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        amount: dayAmount,
      });
    }

    // Get last month's earnings for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastPayout = await ctx.db
      .query("creatorPayouts")
      .withIndex("by_creator_period", (q) =>
        q
          .eq("creatorId", args.creatorId as Id<"creatorProfiles">)
          .eq("periodStart", lastMonthStart.getTime())
      )
      .first();

    const lastMonthEarnings = lastPayout?.totalPayout || 0;
    const currentEstimate = subscriptionShare + shopCommission;
    const percentChange =
      lastMonthEarnings > 0
        ? ((currentEstimate - lastMonthEarnings) / lastMonthEarnings) * 100
        : 0;

    return {
      estimatedPayout: currentEstimate,
      subscriptionShare,
      shopCommission,
      resShare,
      percentChange,
      last7Days,
    };
  },
});

/**
 * Get top performing recipes for creator
 */
export const getTopRecipes = query({
  args: {
    creatorId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    // Get all recipe attributions for this creator
    const attributions = await ctx.db
      .query("recipeAttribution")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId as Id<"creatorProfiles">))
      .collect();

    // Get engagement for each recipe
    const recipeStats = await Promise.all(
      attributions.map(async (attr) => {
        const recipe = await ctx.db.get(attr.recipeId);
        if (!recipe) return null;

        const engagement = await ctx.db
          .query("recipeEngagement")
          .withIndex("by_recipe", (q) => q.eq("recipeId", attr.recipeId))
          .collect();

        const totals = engagement.reduce(
          (acc, e) => ({
            saves: acc.saves + e.saves,
            cooks: acc.cooks + e.cooks,
            engagementScore: acc.engagementScore + e.engagementScore,
          }),
          { saves: 0, cooks: 0, engagementScore: 0 }
        );

        return {
          _id: recipe._id,
          title: recipe.title,
          imageUrl: recipe.imageUrl,
          ...totals,
        };
      })
    );

    // Filter nulls and sort by engagement score
    return recipeStats
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  },
});

// =============================================================================
// Creator Application
// =============================================================================

/**
 * Apply to become a creator partner
 */
export const applyForCreatorPartnership = mutation({
  args: {
    userId: v.string(),
    youtubeChannelId: v.string(),
    channelName: v.string(),
    channelAvatarUrl: v.string(),
    channelBannerUrl: v.optional(v.string()),
    subscriberCount: v.number(),
    bio: v.optional(v.string()),
    specialties: v.array(v.string()),
    payoutEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already applied
    const existing = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_youtube_channel", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();

    if (existing) {
      throw new Error("Application already exists for this channel");
    }

    // Determine tier based on subscriber count
    let tier: "emerging" | "established" | "partner" = "emerging";
    let resMultiplier = 1.0;

    if (args.subscriberCount >= 500000) {
      tier = "partner";
      resMultiplier = 1.5;
    } else if (args.subscriberCount >= 100000) {
      tier = "established";
      resMultiplier = 1.2;
    }

    const now = Date.now();

    const creatorId = await ctx.db.insert("creatorProfiles", {
      userId: args.userId,
      youtubeChannelId: args.youtubeChannelId,
      channelName: args.channelName,
      channelAvatarUrl: args.channelAvatarUrl,
      channelBannerUrl: args.channelBannerUrl,
      subscriberCount: args.subscriberCount,
      tier,
      applicationStatus: "pending",
      appliedAt: now,
      payoutEmail: args.payoutEmail,
      bio: args.bio,
      specialties: args.specialties,
      resMultiplier,
      totalRecipes: 0,
      totalFollowers: 0,
      totalEarnings: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { creatorId, tier };
  },
});

/**
 * Approve creator application (admin only)
 */
export const approveCreatorApplication = mutation({
  args: {
    creatorId: v.id("creatorProfiles"),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    await ctx.db.patch(args.creatorId, {
      applicationStatus: "approved",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// Engagement Tracking
// =============================================================================

/**
 * Record recipe engagement event
 */
export const recordEngagement = mutation({
  args: {
    recipeId: v.id("recipes"),
    type: v.union(
      v.literal("save"),
      v.literal("cook"),
      v.literal("share"),
      v.literal("rating"),
      v.literal("exclusive_view")
    ),
  },
  handler: async (ctx, args) => {
    // Get recipe attribution
    const attribution = await ctx.db
      .query("recipeAttribution")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .first();

    if (!attribution) {
      // Recipe not attributed to a creator
      return { tracked: false };
    }

    const today = new Date().toISOString().split("T")[0];

    // Find or create today's engagement record
    let engagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_recipe_date", (q) =>
        q.eq("recipeId", args.recipeId).eq("date", today)
      )
      .first();

    const incrementField = {
      save: "saves",
      cook: "cooks",
      share: "shares",
      rating: "ratings",
      exclusive_view: "exclusiveViews",
    }[args.type] as keyof typeof engagement;

    if (engagement) {
      // Update existing record
      const currentValue = (engagement[incrementField] as number) || 0;
      const updates: any = {
        [incrementField]: currentValue + 1,
        updatedAt: Date.now(),
      };

      // Recalculate RES
      const newStats = {
        saves: engagement.saves,
        cooks: engagement.cooks,
        shares: engagement.shares,
        ratings: engagement.ratings,
        exclusiveViews: engagement.exclusiveViews,
        ...updates,
      };

      updates.engagementScore = calculateRES(newStats);

      await ctx.db.patch(engagement._id, updates);
    } else {
      // Create new record
      const stats = {
        saves: args.type === "save" ? 1 : 0,
        cooks: args.type === "cook" ? 1 : 0,
        shares: args.type === "share" ? 1 : 0,
        ratings: args.type === "rating" ? 1 : 0,
        exclusiveViews: args.type === "exclusive_view" ? 1 : 0,
      };

      await ctx.db.insert("recipeEngagement", {
        recipeId: args.recipeId,
        creatorId: attribution.creatorId,
        date: today,
        ...stats,
        engagementScore: calculateRES(stats),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { tracked: true };
  },
});

/**
 * Calculate Recipe Engagement Score
 */
function calculateRES(stats: {
  saves: number;
  cooks: number;
  shares: number;
  ratings: number;
  exclusiveViews: number;
}): number {
  return (
    stats.saves * 1 +
    stats.cooks * 5 +
    stats.shares * 3 +
    stats.ratings * 2 +
    stats.exclusiveViews * 2
  );
}

// =============================================================================
// Payout Processing
// =============================================================================

/**
 * Calculate and create monthly payouts (called by cron)
 */
export const processMonthlyPayouts = internalMutation({
  args: {
    periodStart: v.number(),
    periodEnd: v.number(),
    periodLabel: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all approved creators
    const creators = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_status", (q) => q.eq("applicationStatus", "approved"))
      .collect();

    // Get total revenue for the period
    const transactions = await ctx.db
      .query("revenueTransactions")
      .withIndex("by_period", (q) =>
        q.gte("periodStart", args.periodStart).lte("periodEnd", args.periodEnd)
      )
      .collect();

    const creatorPoolTotal = transactions.reduce((sum, t) => sum + t.creatorPoolShare, 0);

    // Get all engagement for the period
    const startDate = new Date(args.periodStart).toISOString().split("T")[0];
    const endDate = new Date(args.periodEnd).toISOString().split("T")[0];

    const allEngagement = await ctx.db
      .query("recipeEngagement")
      .withIndex("by_date", (q) => q.gte("date", startDate).lte("date", endDate))
      .collect();

    const platformTotalRES = allEngagement.reduce((sum, e) => sum + e.engagementScore, 0);

    // Calculate and create payouts for each creator
    for (const creator of creators) {
      const creatorEngagement = allEngagement.filter(
        (e) => e.creatorId === creator._id
      );

      const creatorRES = creatorEngagement.reduce(
        (sum, e) => sum + e.engagementScore * creator.resMultiplier,
        0
      );

      const resShare = platformTotalRES > 0 ? creatorRES / platformTotalRES : 0;
      const subscriptionPayout = Math.floor(creatorPoolTotal * resShare);

      // Get shop commission for the period
      const orders = await ctx.db
        .query("creatorOrders")
        .withIndex("by_creator_status", (q) =>
          q.eq("creatorId", creator._id).eq("status", "paid")
        )
        .collect();

      const shopPayout = orders
        .filter(
          (o) =>
            o.paidAt &&
            o.paidAt >= args.periodStart &&
            o.paidAt <= args.periodEnd
        )
        .reduce((sum, o) => sum + o.creatorCommission, 0);

      const totalPayout = subscriptionPayout + shopPayout;

      // Only create payout if there's something to pay
      if (totalPayout > 0) {
        await ctx.db.insert("creatorPayouts", {
          creatorId: creator._id,
          periodStart: args.periodStart,
          periodEnd: args.periodEnd,
          periodLabel: args.periodLabel,
          totalRES: creatorRES,
          platformTotalRES,
          resShare,
          creatorPoolAmount: creatorPoolTotal,
          subscriptionPayout,
          shopPayout,
          totalPayout,
          status: "pending",
          retryCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Update creator's total earnings
        await ctx.db.patch(creator._id, {
          totalEarnings: creator.totalEarnings + totalPayout,
          updatedAt: Date.now(),
        });
      }
    }

    return { processed: creators.length };
  },
});

/**
 * Update creator profile YouTube channel ID (admin use only)
 */
export const updateCreatorChannel = mutation({
  args: {
    creatorId: v.id("creatorProfiles"),
    youtubeChannelId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.creatorId, {
      youtubeChannelId: args.youtubeChannelId,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
