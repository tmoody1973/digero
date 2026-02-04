/**
 * Seed Featured Channels Internal Mutation
 *
 * Internal mutation for upserting featured channel data from YouTube API.
 */

import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

/**
 * Channel category type
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
 * Upsert a featured channel
 *
 * Creates or updates a channel with data from YouTube API.
 * Internal mutation called by the seedFeaturedChannelsFromYouTube action.
 */
export const upsertFeaturedChannel = internalMutation({
  args: {
    youtubeChannelId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    bannerUrl: v.optional(v.string()),
    subscriberCount: v.number(),
    description: v.string(),
    videoCount: v.number(),
    category: channelCategory,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if channel already exists
    const existing = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_youtube_channel_id", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();

    if (existing) {
      // Update existing channel
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        bannerUrl: args.bannerUrl,
        subscriberCount: args.subscriberCount,
        description: args.description,
        videoCount: args.videoCount,
        category: args.category,
        isFeatured: true,
        lastFetchedAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new channel
    const channelId = await ctx.db.insert("youtubeChannels", {
      youtubeChannelId: args.youtubeChannelId,
      name: args.name,
      avatarUrl: args.avatarUrl,
      bannerUrl: args.bannerUrl,
      subscriberCount: args.subscriberCount,
      description: args.description,
      videoCount: args.videoCount,
      category: args.category,
      isFeatured: true,
      lastFetchedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return channelId;
  },
});

/**
 * Clear all featured channels
 *
 * Removes the featured flag from all channels.
 * Useful for resetting before reseeding.
 */
export const clearFeaturedChannels = mutation({
  args: {},
  handler: async (ctx) => {
    const featuredChannels = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    for (const channel of featuredChannels) {
      await ctx.db.patch(channel._id, {
        isFeatured: false,
        updatedAt: Date.now(),
      });
    }

    return {
      cleared: featuredChannels.length,
    };
  },
});

/**
 * Delete all YouTube channels
 *
 * Completely removes all channels from the database.
 * Use with caution - this will also remove all follow relationships.
 */
export const deleteAllChannels = mutation({
  args: {},
  handler: async (ctx) => {
    // First delete all follow relationships
    const follows = await ctx.db.query("userFollowedChannels").collect();
    for (const follow of follows) {
      await ctx.db.delete(follow._id);
    }

    // Then delete all channels
    const channels = await ctx.db.query("youtubeChannels").collect();
    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }

    return {
      deletedFollows: follows.length,
      deletedChannels: channels.length,
    };
  },
});
