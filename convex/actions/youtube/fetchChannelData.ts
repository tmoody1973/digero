/**
 * Fetch YouTube Channel Data Action
 *
 * Fetches channel metadata from YouTube Data API v3.
 * Includes channel name, avatar, subscriber count, description, and video count.
 */

import { v } from "convex/values";
import { action } from "../../_generated/server";
import type { YouTubeChannelData } from "../../lib/youtubeTypes";

/**
 * YouTube API channel response
 */
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
  }[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Fetch channel data from YouTube Data API by channel ID
 *
 * @param channelId - YouTube channel ID
 * @returns Channel data or error
 */
export const fetchChannelData = action({
  args: {
    channelId: v.string(),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    data: YouTubeChannelData | null;
    error: { type: string; message: string } | null;
  }> => {
    const { channelId } = args;

    if (!channelId || channelId.trim().length === 0) {
      return {
        success: false,
        data: null,
        error: {
          type: "INVALID_CHANNEL_ID",
          message: "Channel ID is required",
        },
      };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("YOUTUBE_API_KEY not configured");
      return {
        success: false,
        data: null,
        error: {
          type: "CONFIGURATION_ERROR",
          message: "YouTube API is not configured",
        },
      };
    }

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("id", channelId);
      url.searchParams.set("part", "snippet,statistics");
      url.searchParams.set("key", apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 403) {
          return {
            success: false,
            data: null,
            error: {
              type: "QUOTA_EXCEEDED",
              message: "YouTube API quota exceeded. Please try again later.",
            },
          };
        }

        return {
          success: false,
          data: null,
          error: {
            type: "FETCH_FAILED",
            message: `YouTube API request failed: ${response.status}`,
          },
        };
      }

      const data: YouTubeChannelResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          data: null,
          error: {
            type: "CHANNEL_NOT_FOUND",
            message: "Channel not found",
          },
        };
      }

      const channel = data.items[0];

      const channelData: YouTubeChannelData = {
        channelId: channel.id,
        name: channel.snippet.title,
        avatarUrl:
          channel.snippet.thumbnails.high?.url ||
          channel.snippet.thumbnails.medium?.url ||
          channel.snippet.thumbnails.default?.url ||
          "",
        subscriberCount: channel.statistics.hiddenSubscriberCount
          ? 0
          : parseInt(channel.statistics.subscriberCount || "0", 10),
        description: channel.snippet.description,
        videoCount: parseInt(channel.statistics.videoCount || "0", 10),
      };

      return {
        success: true,
        data: channelData,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          data: null,
          error: {
            type: "TIMEOUT",
            message: "Request timed out. Please try again.",
          },
        };
      }

      console.error("Error fetching channel data:", error);
      return {
        success: false,
        data: null,
        error: {
          type: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  },
});

/**
 * Search for cooking channels on YouTube
 *
 * @param query - Search query
 * @param maxResults - Maximum number of results (default 10, max 20)
 * @returns List of channel data or error
 */
export const searchChannels = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    data: YouTubeChannelData[];
    error: { type: string; message: string } | null;
  }> => {
    const { query, maxResults = 10 } = args;

    if (!query || query.trim().length === 0) {
      return {
        success: false,
        data: [],
        error: {
          type: "INVALID_QUERY",
          message: "Search query is required",
        },
      };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        data: [],
        error: {
          type: "CONFIGURATION_ERROR",
          message: "YouTube API is not configured",
        },
      };
    }

    try {
      // First, search for channels
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("q", `${query} cooking recipes`);
      searchUrl.searchParams.set("type", "channel");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("maxResults", String(Math.min(maxResults, 20)));
      searchUrl.searchParams.set("key", apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const searchResponse = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
          return {
            success: false,
            data: [],
            error: {
              type: "QUOTA_EXCEEDED",
              message: "YouTube API quota exceeded",
            },
          };
        }
        return {
          success: false,
          data: [],
          error: {
            type: "FETCH_FAILED",
            message: `Search failed: ${searchResponse.status}`,
          },
        };
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return {
          success: true,
          data: [],
          error: null,
        };
      }

      // Get channel IDs from search results
      const channelIds = searchData.items.map(
        (item: { snippet: { channelId: string } }) => item.snippet.channelId
      );

      // Fetch full channel details
      const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelsUrl.searchParams.set("id", channelIds.join(","));
      channelsUrl.searchParams.set("part", "snippet,statistics");
      channelsUrl.searchParams.set("key", apiKey);

      const channelsResponse = await fetch(channelsUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!channelsResponse.ok) {
        return {
          success: false,
          data: [],
          error: {
            type: "FETCH_FAILED",
            message: `Channel fetch failed: ${channelsResponse.status}`,
          },
        };
      }

      const channelsData: YouTubeChannelResponse = await channelsResponse.json();

      const channels: YouTubeChannelData[] = (channelsData.items || []).map((channel) => ({
        channelId: channel.id,
        name: channel.snippet.title,
        avatarUrl:
          channel.snippet.thumbnails.high?.url ||
          channel.snippet.thumbnails.medium?.url ||
          channel.snippet.thumbnails.default?.url ||
          "",
        subscriberCount: channel.statistics.hiddenSubscriberCount
          ? 0
          : parseInt(channel.statistics.subscriberCount || "0", 10),
        description: channel.snippet.description,
        videoCount: parseInt(channel.statistics.videoCount || "0", 10),
      }));

      return {
        success: true,
        data: channels,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          data: [],
          error: {
            type: "TIMEOUT",
            message: "Request timed out",
          },
        };
      }

      return {
        success: false,
        data: [],
        error: {
          type: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
});

/**
 * Get recent videos from a channel
 *
 * @param channelId - YouTube channel ID
 * @param maxResults - Maximum videos to fetch (default 20)
 * @returns List of videos or error
 */
export const getChannelVideos = action({
  args: {
    channelId: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    data: {
      videoId: string;
      title: string;
      thumbnailUrl: string;
      duration: string;
      viewCount: number;
      publishedAt: string;
    }[];
    error: { type: string; message: string } | null;
  }> => {
    const { channelId, maxResults = 20 } = args;

    if (!channelId) {
      return {
        success: false,
        data: [],
        error: {
          type: "INVALID_CHANNEL_ID",
          message: "Channel ID is required",
        },
      };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        data: [],
        error: {
          type: "CONFIGURATION_ERROR",
          message: "YouTube API is not configured",
        },
      };
    }

    try {
      // Search for videos from this channel
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("channelId", channelId);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("order", "date");
      searchUrl.searchParams.set("maxResults", String(Math.min(maxResults, 50)));
      searchUrl.searchParams.set("key", apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const searchResponse = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
          return {
            success: false,
            data: [],
            error: {
              type: "QUOTA_EXCEEDED",
              message: "YouTube API quota exceeded",
            },
          };
        }
        return {
          success: false,
          data: [],
          error: {
            type: "FETCH_FAILED",
            message: `Search failed: ${searchResponse.status}`,
          },
        };
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return {
          success: true,
          data: [],
          error: null,
        };
      }

      // Get video IDs
      const videoIds = searchData.items.map(
        (item: { id: { videoId: string } }) => item.id.videoId
      );

      // Fetch video details for duration and view count
      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videosUrl.searchParams.set("id", videoIds.join(","));
      videosUrl.searchParams.set("part", "contentDetails,statistics");
      videosUrl.searchParams.set("key", apiKey);

      const videosResponse = await fetch(videosUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      let videoDetails: Record<string, { duration: string; viewCount: number }> = {};

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        for (const video of videosData.items || []) {
          const durationMatch = video.contentDetails.duration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
          );
          const hours = parseInt(durationMatch?.[1] || "0", 10);
          const minutes = parseInt(durationMatch?.[2] || "0", 10);
          const seconds = parseInt(durationMatch?.[3] || "0", 10);

          let duration: string;
          if (hours > 0) {
            duration = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          } else {
            duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
          }

          videoDetails[video.id] = {
            duration,
            viewCount: parseInt(video.statistics.viewCount || "0", 10),
          };
        }
      }

      // Map results
      const videos = searchData.items.map(
        (item: {
          id: { videoId: string };
          snippet: {
            title: string;
            thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
            publishedAt: string;
          };
        }) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnailUrl:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url ||
            "",
          duration: videoDetails[item.id.videoId]?.duration || "0:00",
          viewCount: videoDetails[item.id.videoId]?.viewCount || 0,
          publishedAt: item.snippet.publishedAt,
        })
      );

      return {
        success: true,
        data: videos,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          data: [],
          error: {
            type: "TIMEOUT",
            message: "Request timed out",
          },
        };
      }

      return {
        success: false,
        data: [],
        error: {
          type: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
});
