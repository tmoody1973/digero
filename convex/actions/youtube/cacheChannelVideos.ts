"use node";

/**
 * Cache Channel Videos Action
 *
 * Fetches recent videos from a YouTube channel and caches them
 * in the database for the video feed.
 */

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { QUOTA_COSTS } from "../../youtubeQuota";

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration for display
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Fetch and cache videos for a single channel
 */
export const fetchAndCacheChannelVideos = action({
  args: {
    youtubeChannelId: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    cached: number;
    error?: string;
  }> => {
    const { youtubeChannelId, maxResults = 10 } = args;

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        cached: 0,
        error: "YouTube API key not configured",
      };
    }

    try {
      // Step 1: Search for videos from this channel
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("channelId", youtubeChannelId);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("order", "date");
      searchUrl.searchParams.set("maxResults", String(Math.min(maxResults, 50)));
      searchUrl.searchParams.set("key", apiKey);

      const searchResponse = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
          return {
            success: false,
            cached: 0,
            error: "YouTube API quota exceeded",
          };
        }
        return {
          success: false,
          cached: 0,
          error: `Search failed: ${searchResponse.status}`,
        };
      }

      const searchData = await searchResponse.json();

      // Track quota usage (search.list = 100 units)
      await ctx.runMutation(api.youtubeQuota.recordQuotaUsage, {
        units: QUOTA_COSTS.SEARCH,
        operation: "search.list (cache videos)",
      });

      if (!searchData.items || searchData.items.length === 0) {
        return { success: true, cached: 0 };
      }

      // Get video IDs
      const videoIds = searchData.items.map(
        (item: { id: { videoId: string } }) => item.id.videoId
      );

      // Step 2: Fetch video details (duration, view count)
      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videosUrl.searchParams.set("id", videoIds.join(","));
      videosUrl.searchParams.set("part", "contentDetails,statistics,snippet");
      videosUrl.searchParams.set("key", apiKey);

      const videosResponse = await fetch(videosUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!videosResponse.ok) {
        return {
          success: false,
          cached: 0,
          error: `Video details fetch failed: ${videosResponse.status}`,
        };
      }

      const videosData = await videosResponse.json();

      // Track quota usage (videos.list = 1 unit)
      await ctx.runMutation(api.youtubeQuota.recordQuotaUsage, {
        units: QUOTA_COSTS.VIDEOS_LIST,
        operation: "videos.list (cache)",
      });

      // Build video objects for caching
      const videos = (videosData.items || []).map(
        (video: {
          id: string;
          snippet: {
            title: string;
            description: string;
            thumbnails: {
              high?: { url: string };
              medium?: { url: string };
              default?: { url: string };
            };
            publishedAt: string;
            channelId: string;
            channelTitle: string;
          };
          contentDetails: { duration: string };
          statistics: { viewCount: string };
        }) => ({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description.slice(0, 500), // Limit description length
          thumbnailUrl:
            video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium?.url ||
            video.snippet.thumbnails.default?.url ||
            "",
          duration: formatDuration(video.contentDetails.duration),
          durationSeconds: parseDurationToSeconds(video.contentDetails.duration),
          viewCount: parseInt(video.statistics.viewCount || "0", 10),
          publishedAt: video.snippet.publishedAt,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
        })
      );

      // Step 3: Cache videos in database
      const result = await ctx.runMutation(api.channels.cacheChannelVideos, {
        videos,
      });

      return {
        success: true,
        cached: result.cached,
      };
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      return {
        success: false,
        cached: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Refresh videos for all followed channels
 *
 * Call this to populate or refresh the video feed cache.
 */
export const refreshFollowedChannelVideos = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    channelsProcessed: number;
    totalCached: number;
    errors: string[];
  }> => {
    // Get followed channels from the query
    const followedChannels = await ctx.runQuery(api.channels.getFollowedChannels);

    if (!followedChannels || followedChannels.length === 0) {
      return {
        success: true,
        channelsProcessed: 0,
        totalCached: 0,
        errors: [],
      };
    }

    const errors: string[] = [];
    let totalCached = 0;

    // Fetch videos for each followed channel
    for (const channel of followedChannels) {
      const result = await ctx.runAction(
        api.actions.youtube.cacheChannelVideos.fetchAndCacheChannelVideos,
        {
          youtubeChannelId: channel.youtubeChannelId,
          maxResults: 10,
        }
      );

      if (result.success) {
        totalCached += result.cached;
      } else if (result.error) {
        errors.push(`${channel.name}: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      channelsProcessed: followedChannels.length,
      totalCached,
      errors,
    };
  },
});
