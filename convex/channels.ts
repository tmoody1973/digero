/**
 * YouTube Channel Mutations and Queries
 *
 * CRUD operations for managing YouTube channels and user follows.
 * Provides queries for channel discovery, following status, and video feed.
 * Includes OneSignal tag sync support for followed creators.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Channel category validator
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

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Follow a YouTube channel
 *
 * Creates or finds the channel in the database and adds a follow relationship.
 * If the channel doesn't exist, it's created with the provided data.
 *
 * Returns the channel ID, following status, and list of all followed channel IDs
 * for OneSignal tag sync.
 */
export const followChannel = mutation({
  args: {
    youtubeChannelId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    bannerUrl: v.optional(v.string()),
    subscriberCount: v.number(),
    description: v.string(),
    videoCount: v.number(),
    category: v.optional(channelCategory),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Check if channel already exists in database
    let channel = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_youtube_channel_id", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();

    // Create channel if it doesn't exist
    if (!channel) {
      const channelId = await ctx.db.insert("youtubeChannels", {
        youtubeChannelId: args.youtubeChannelId,
        name: args.name,
        avatarUrl: args.avatarUrl,
        bannerUrl: args.bannerUrl,
        subscriberCount: args.subscriberCount,
        description: args.description,
        videoCount: args.videoCount,
        category: args.category || "General",
        isFeatured: false,
        lastFetchedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      channel = await ctx.db.get(channelId);
    } else if (args.bannerUrl && !channel.bannerUrl) {
      // Update existing channel with banner if it doesn't have one
      await ctx.db.patch(channel._id, { bannerUrl: args.bannerUrl });
    }

    if (!channel) {
      throw new Error("Failed to create or find channel");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user_channel", (q) =>
        q.eq("userId", userId).eq("channelId", channel._id)
      )
      .first();

    if (!existingFollow) {
      // Create follow relationship
      await ctx.db.insert("userFollowedChannels", {
        userId,
        channelId: channel._id,
        followedAt: now,
      });
    }

    // Get all followed channel IDs for OneSignal tag sync
    const followedChannelIds = await getFollowedChannelYoutubeIds(ctx, userId);

    return {
      channelId: channel._id,
      isFollowing: true,
      followedChannelIds, // For OneSignal tag sync
    };
  },
});

/**
 * Unfollow a YouTube channel
 *
 * Removes the follow relationship between user and channel.
 * Returns the updated list of followed channel IDs for OneSignal tag sync.
 */
export const unfollowChannel = mutation({
  args: {
    channelId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Find the follow relationship
    const follow = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user_channel", (q) =>
        q.eq("userId", userId).eq("channelId", args.channelId)
      )
      .first();

    if (follow) {
      await ctx.db.delete(follow._id);
    }

    // Get all followed channel IDs for OneSignal tag sync
    const followedChannelIds = await getFollowedChannelYoutubeIds(ctx, userId);

    return {
      channelId: args.channelId,
      isFollowing: false,
      followedChannelIds, // For OneSignal tag sync
    };
  },
});

/**
 * Helper function to get all YouTube channel IDs the user follows
 *
 * Used for OneSignal followed_creators tag sync.
 */
async function getFollowedChannelYoutubeIds(
  ctx: { db: any },
  userId: string
): Promise<string[]> {
  const follows = await ctx.db
    .query("userFollowedChannels")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const channelIds: string[] = [];
  for (const follow of follows) {
    const channel = await ctx.db.get(follow.channelId);
    if (channel?.youtubeChannelId) {
      channelIds.push(channel.youtubeChannelId);
    }
  }

  return channelIds;
}

/**
 * Update a channel's banner URL
 *
 * Used to add banner images to channels that don't have them.
 */
export const updateChannelBanner = mutation({
  args: {
    youtubeChannelId: v.string(),
    bannerUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the channel
    const channel = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_youtube_channel_id", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Update the banner URL
    await ctx.db.patch(channel._id, {
      bannerUrl: args.bannerUrl,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cache videos for a channel
 *
 * Stores video metadata in the cache table for fast feed retrieval.
 * Called by the fetchAndCacheChannelVideos action.
 */
export const cacheChannelVideos = mutation({
  args: {
    videos: v.array(
      v.object({
        videoId: v.string(),
        title: v.string(),
        description: v.string(),
        thumbnailUrl: v.string(),
        duration: v.string(),
        durationSeconds: v.number(),
        viewCount: v.number(),
        publishedAt: v.string(),
        channelId: v.string(),
        channelTitle: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    let cached = 0;
    for (const video of args.videos) {
      // Check if video already cached
      const existing = await ctx.db
        .query("youtubeVideoCache")
        .withIndex("by_video_id", (q) => q.eq("videoId", video.videoId))
        .first();

      if (existing) {
        // Update existing cache entry
        await ctx.db.patch(existing._id, {
          ...video,
          cachedAt: now,
          expiresAt,
        });
      } else {
        // Create new cache entry
        await ctx.db.insert("youtubeVideoCache", {
          ...video,
          cachedAt: now,
          expiresAt,
        });
        cached++;
      }
    }

    return { cached, total: args.videos.length };
  },
});

/**
 * Update channel data from YouTube API
 *
 * Updates cached channel information. Called periodically to refresh data.
 */
export const updateChannelData = mutation({
  args: {
    channelId: v.id("youtubeChannels"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    subscriberCount: v.optional(v.number()),
    description: v.optional(v.string()),
    videoCount: v.optional(v.number()),
    category: v.optional(channelCategory),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { channelId, ...updates } = args;

    const channel = await ctx.db.get(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const updateData: Record<string, unknown> = {
      ...updates,
      lastFetchedAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await ctx.db.patch(channelId, updateData);

    return channelId;
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's followed channels
 *
 * Returns all channels the authenticated user follows with channel details.
 */
export const getFollowedChannels = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Get follow relationships
    const follows = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch channel details for each follow
    const channels = await Promise.all(
      follows.map(async (follow) => {
        const channel = await ctx.db.get(follow.channelId);
        if (!channel) return null;
        return {
          ...channel,
          isFollowing: true,
          followedAt: follow.followedAt,
        };
      })
    );

    return channels.filter((c): c is NonNullable<typeof c> => c !== null);
  },
});

/**
 * Get followed channel YouTube IDs
 *
 * Returns only the YouTube channel IDs for all followed channels.
 * Used for OneSignal followed_creators tag sync.
 */
export const getFollowedChannelIds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    // Get follow relationships
    const follows = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch YouTube channel IDs
    const channelIds: string[] = [];
    for (const follow of follows) {
      const channel = await ctx.db.get(follow.channelId);
      if (channel?.youtubeChannelId) {
        channelIds.push(channel.youtubeChannelId);
      }
    }

    return channelIds;
  },
});

/**
 * Check featured channels (public, no auth required)
 *
 * Returns list of featured channel names for debugging.
 */
export const checkFeaturedChannels = query({
  args: {},
  handler: async (ctx) => {
    const channels = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    return channels.map((c) => ({
      name: c.name,
      youtubeChannelId: c.youtubeChannelId,
      isFeatured: c.isFeatured,
    }));
  },
});

/**
 * Get featured channels
 *
 * Returns curated featured channels for discovery.
 */
export const getFeaturedChannels = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit || 10;

    // Get featured channels
    const channels = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .take(limit);

    // Check follow status for each channel
    const channelsWithStatus = await Promise.all(
      channels.map(async (channel) => {
        const follow = await ctx.db
          .query("userFollowedChannels")
          .withIndex("by_user_channel", (q) =>
            q.eq("userId", userId).eq("channelId", channel._id)
          )
          .first();

        return {
          ...channel,
          isFollowing: !!follow,
        };
      })
    );

    return channelsWithStatus;
  },
});

/**
 * Get channels by category
 *
 * Returns channels filtered by category.
 */
export const getChannelsByCategory = query({
  args: {
    category: channelCategory,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit || 20;

    // Get channels by category
    const channels = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .take(limit);

    // Check follow status
    const channelsWithStatus = await Promise.all(
      channels.map(async (channel) => {
        const follow = await ctx.db
          .query("userFollowedChannels")
          .withIndex("by_user_channel", (q) =>
            q.eq("userId", userId).eq("channelId", channel._id)
          )
          .first();

        return {
          ...channel,
          isFollowing: !!follow,
        };
      })
    );

    return channelsWithStatus;
  },
});

/**
 * Get all discoverable channels
 *
 * Returns all channels with follow status for the discovery page.
 */
export const getAllChannels = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit || 50;

    // Get all channels
    const channels = await ctx.db.query("youtubeChannels").take(limit);

    // Check follow status
    const channelsWithStatus = await Promise.all(
      channels.map(async (channel) => {
        const follow = await ctx.db
          .query("userFollowedChannels")
          .withIndex("by_user_channel", (q) =>
            q.eq("userId", userId).eq("channelId", channel._id)
          )
          .first();

        return {
          ...channel,
          isFollowing: !!follow,
        };
      })
    );

    return channelsWithStatus;
  },
});

/**
 * Get channel by ID with follow status
 */
export const getChannelById = query({
  args: {
    channelId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      return null;
    }

    // Check follow status
    const follow = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user_channel", (q) =>
        q.eq("userId", userId).eq("channelId", channel._id)
      )
      .first();

    return {
      ...channel,
      isFollowing: !!follow,
    };
  },
});

/**
 * Get channel by YouTube channel ID with follow status
 */
export const getChannelByYoutubeId = query({
  args: {
    youtubeChannelId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const channel = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_youtube_channel_id", (q) =>
        q.eq("youtubeChannelId", args.youtubeChannelId)
      )
      .first();

    if (!channel) {
      return null;
    }

    // Check follow status
    const follow = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user_channel", (q) =>
        q.eq("userId", userId).eq("channelId", channel._id)
      )
      .first();

    return {
      ...channel,
      isFollowing: !!follow,
    };
  },
});

/**
 * Get followed channel count
 */
export const getFollowedChannelCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const follows = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return follows.length;
  },
});

/**
 * Check if user follows a channel
 */
export const isFollowingChannel = query({
  args: {
    channelId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;

    const follow = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user_channel", (q) =>
        q.eq("userId", userId).eq("channelId", args.channelId)
      )
      .first();

    return !!follow;
  },
});

/**
 * Get video feed from followed channels
 *
 * Returns cached videos from all followed channels, sorted by publish date.
 * Uses the youtubeVideoCache table for performance.
 */
export const getVideoFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const limit = args.limit || 20;

    // Get user's followed channels
    const follows = await ctx.db
      .query("userFollowedChannels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (follows.length === 0) {
      return {
        videos: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    // Get channel IDs
    const channelIds = await Promise.all(
      follows.map(async (follow) => {
        const channel = await ctx.db.get(follow.channelId);
        return channel?.youtubeChannelId;
      })
    );

    const validChannelIds = channelIds.filter(
      (id): id is string => id !== undefined
    );

    if (validChannelIds.length === 0) {
      return {
        videos: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    // Get cached videos for these channels
    const allVideos = await ctx.db.query("youtubeVideoCache").collect();

    // Filter to only videos from followed channels
    const followedChannelVideos = allVideos.filter((video) =>
      validChannelIds.includes(video.channelId)
    );

    // Sort by publishedAt (newest first)
    followedChannelVideos.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const startIndex = args.cursor ? parseInt(args.cursor, 10) : 0;
    const paginatedVideos = followedChannelVideos.slice(
      startIndex,
      startIndex + limit
    );
    const hasMore = startIndex + limit < followedChannelVideos.length;

    // Get channel avatars for feed videos
    const videosWithChannelInfo = await Promise.all(
      paginatedVideos.map(async (video) => {
        const channel = await ctx.db
          .query("youtubeChannels")
          .withIndex("by_youtube_channel_id", (q) =>
            q.eq("youtubeChannelId", video.channelId)
          )
          .first();

        return {
          videoId: video.videoId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          viewCount: video.viewCount,
          publishedAt: video.publishedAt,
          channelId: video.channelId,
          channelName: video.channelTitle,
          channelAvatarUrl: channel?.avatarUrl || "",
        };
      })
    );

    return {
      videos: videosWithChannelInfo,
      nextCursor: hasMore ? String(startIndex + limit) : null,
      hasMore,
    };
  },
});

/**
 * List all channels (admin use only, no auth required)
 *
 * Used to find and clean up duplicate channels.
 */
export const listAllChannelsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const channels = await ctx.db.query("youtubeChannels").collect();
    return channels.map((c) => ({
      _id: c._id,
      name: c.name,
      youtubeChannelId: c.youtubeChannelId,
      subscriberCount: c.subscriberCount,
      avatarUrl: c.avatarUrl,
    }));
  },
});

/**
 * Delete a channel by ID (admin use only)
 *
 * Used to clean up duplicate channels.
 */
export const deleteChannel = mutation({
  args: {
    channelId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    // Delete the channel
    await ctx.db.delete(args.channelId);
    return { success: true };
  },
});

/**
 * Add a channel (admin use only, no auth required)
 *
 * Used to add channels for seeding/admin purposes.
 */
export const addChannel = mutation({
  args: {
    youtubeChannelId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    bannerUrl: v.optional(v.string()),
    subscriberCount: v.number(),
    description: v.string(),
    videoCount: v.number(),
    category: v.optional(channelCategory),
    isFeatured: v.optional(v.boolean()),
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
      return { success: false, error: "Channel already exists", channelId: existing._id };
    }

    const channelId = await ctx.db.insert("youtubeChannels", {
      youtubeChannelId: args.youtubeChannelId,
      name: args.name,
      avatarUrl: args.avatarUrl,
      bannerUrl: args.bannerUrl || "",
      subscriberCount: args.subscriberCount,
      description: args.description,
      videoCount: args.videoCount,
      category: args.category || "General",
      isFeatured: args.isFeatured || false,
      lastFetchedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, channelId };
  },
});
