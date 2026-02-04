"use node";

/**
 * Seed Featured Channels Action
 *
 * Fetches real channel data from YouTube API for curated featured cooking channels.
 * This action seeds channels with actual avatars, subscriber counts, and descriptions.
 */

import { v } from "convex/values";
import { action, internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * Verified YouTube channel IDs for featured cooking channels
 * These IDs have been verified to be correct as of 2026
 */
const FEATURED_CHANNEL_IDS = [
  // Joshua Weissman - Popular for "But Better" and "But Cheaper" series
  { id: "UChBEbMKI1eCcejTtmI32UEw", category: "General" as const },
  // Babish Culinary Universe - Recreates dishes from movies/TV/games
  { id: "UCJHA_jMfCvEnv-3kRjTCQXw", category: "General" as const },
  // Gordon Ramsay - Celebrity chef with professional techniques
  { id: "UCIEv3lZ_tNXHzL3ox-_uUGQ", category: "General" as const },
  // Tasty - BuzzFeed's viral recipe videos
  { id: "UCJFp8uSYCjXOMnkUyb3CQ3Q", category: "Quick Meals" as const },
  // Nick DiGiovanni - MasterChef finalist, approachable complex recipes
  { id: "UCMyOj6fhvKFMjxUCp3b_3gA", category: "General" as const },
  // Maangchi - Korean cooking "YouTube's Korean Julia Child"
  { id: "UC8gFadPgK2r1ndqLI04Xvvw", category: "Asian" as const },
  // Adam Ragusea - Food science and practical home cooking
  { id: "UC9_p50tH3WmMslWRWKnM7dQ", category: "General" as const },
  // Marion's Kitchen - Australian-Thai authentic Asian recipes
  { id: "UCN1h109PDDp_wYIFsoWmZrQ", category: "Asian" as const },
  // Bon Appetit - Test kitchen recipes and techniques
  { id: "UCbpMy0Fg74eXXkvxJrtEn3w", category: "General" as const },
  // America's Test Kitchen - Science-based tested recipes
  { id: "UCxAS_aK7sS2x_bqnlJHDSHw", category: "General" as const },
  // Chinese Cooking Demystified - Authentic Chinese regional cuisine
  { id: "UC54SLBnD5k5U3Q6N__UjbAw", category: "Asian" as const },
  // Brian Lagerstrom - Former pro chef, restaurant-quality at home
  { id: "UCn5fhcGRrCvrmFibPbT6q1A", category: "General" as const },
];

type ChannelCategory =
  | "Italian"
  | "Asian"
  | "Quick Meals"
  | "Baking"
  | "Healthy"
  | "BBQ & Grilling"
  | "General";

interface YouTubeChannelResponse {
  items?: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
      publishedAt: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
      hiddenSubscriberCount: boolean;
    };
    brandingSettings?: {
      image?: {
        bannerExternalUrl?: string;
      };
    };
  }[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Seed featured channels from YouTube API
 *
 * Fetches real channel data (avatars, subscriber counts, etc.) and saves to database.
 * This is idempotent - it will update channels that already exist.
 */
export const seedFeaturedChannelsFromYouTube = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    seeded: number;
    failed: number;
    errors: string[];
  }> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        seeded: 0,
        failed: FEATURED_CHANNEL_IDS.length,
        errors: ["YOUTUBE_API_KEY not configured in Convex environment"],
      };
    }

    let seeded = 0;
    let failed = 0;
    const errors: string[] = [];

    // Fetch all channels in batches of 50 (YouTube API limit)
    const channelIds = FEATURED_CHANNEL_IDS.map((c) => c.id);
    const categoryMap = new Map(
      FEATURED_CHANNEL_IDS.map((c) => [c.id, c.category])
    );

    try {
      // Fetch channel data from YouTube API
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("id", channelIds.join(","));
      url.searchParams.set("part", "snippet,statistics,brandingSettings");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          seeded: 0,
          failed: FEATURED_CHANNEL_IDS.length,
          errors: [`YouTube API error (${response.status}): ${errorText}`],
        };
      }

      const data: YouTubeChannelResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          seeded: 0,
          failed: FEATURED_CHANNEL_IDS.length,
          errors: ["No channels found from YouTube API"],
        };
      }

      // Process each channel
      for (const channel of data.items) {
        try {
          const category = categoryMap.get(channel.id) || "General";

          // Get the best available avatar URL
          const avatarUrl =
            channel.snippet.thumbnails.high?.url ||
            channel.snippet.thumbnails.medium?.url ||
            channel.snippet.thumbnails.default?.url ||
            "";

          // Get banner URL if available
          const bannerUrl =
            channel.brandingSettings?.image?.bannerExternalUrl || "";

          // Save to database using internal mutation
          await ctx.runMutation(internal.seedFeaturedChannelsMutation.upsertFeaturedChannel, {
            youtubeChannelId: channel.id,
            name: channel.snippet.title,
            avatarUrl,
            bannerUrl,
            subscriberCount: channel.statistics.hiddenSubscriberCount
              ? 0
              : parseInt(channel.statistics.subscriberCount || "0", 10),
            description: channel.snippet.description,
            videoCount: parseInt(channel.statistics.videoCount || "0", 10),
            category,
          });

          seeded++;
        } catch (err) {
          failed++;
          errors.push(
            `Failed to save ${channel.snippet.title}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }

      // Check if any channels weren't found
      const foundIds = new Set(data.items.map((item) => item.id));
      const notFoundIds = channelIds.filter((id) => !foundIds.has(id));
      if (notFoundIds.length > 0) {
        errors.push(`Channels not found: ${notFoundIds.join(", ")}`);
        failed += notFoundIds.length;
      }

      return {
        success: seeded > 0,
        seeded,
        failed,
        errors,
      };
    } catch (err) {
      return {
        success: false,
        seeded,
        failed: FEATURED_CHANNEL_IDS.length - seeded,
        errors: [err instanceof Error ? err.message : "Unknown error"],
      };
    }
  },
});
