/**
 * Fetch YouTube Video Metadata Action
 *
 * Fetches video metadata from YouTube Data API v3.
 * Includes title, description, thumbnails, duration, view count, and publish date.
 */

import { v } from "convex/values";
import { action } from "../../_generated/server";
import {
  isValidVideoId,
  parseISO8601Duration,
  formatDuration,
} from "../../lib/youtubeUrlParser";
import type { YouTubeVideoMetadata } from "../../lib/youtubeTypes";

/**
 * YouTube API response types
 */
interface YouTubeVideoResponse {
  items?: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
        standard?: { url: string };
        maxres?: { url: string };
      };
      publishedAt: string;
      channelId: string;
      channelTitle: string;
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Get the highest quality thumbnail URL available
 */
function getBestThumbnailUrl(thumbnails: YouTubeVideoResponse["items"][0]["snippet"]["thumbnails"]): string {
  // Prefer highest quality in order: maxres > standard > high > medium > default
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}

/**
 * Fetch video metadata from YouTube Data API
 *
 * @param videoId - YouTube video ID (11 characters)
 * @returns Video metadata or error
 */
export const fetchVideoMetadata = action({
  args: {
    videoId: v.string(),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    data: YouTubeVideoMetadata | null;
    error: { type: string; message: string } | null;
  }> => {
    const { videoId } = args;

    // Validate video ID format
    if (!isValidVideoId(videoId)) {
      return {
        success: false,
        data: null,
        error: {
          type: "INVALID_VIDEO_ID",
          message: "Invalid YouTube video ID format",
        },
      };
    }

    // Get API key from environment
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
      // Build API URL
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("id", videoId);
      url.searchParams.set("part", "snippet,contentDetails,statistics");
      url.searchParams.set("key", apiKey);

      // Fetch with timeout
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
        const errorText = await response.text();
        console.error("YouTube API error:", response.status, errorText);

        // Check for quota exceeded
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

      const data: YouTubeVideoResponse = await response.json();

      // Check for API-level errors
      if (data.error) {
        return {
          success: false,
          data: null,
          error: {
            type: "FETCH_FAILED",
            message: data.error.message,
          },
        };
      }

      // Check if video was found
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          data: null,
          error: {
            type: "INVALID_VIDEO_ID",
            message: "Video not found. It may be private, deleted, or the ID is incorrect.",
          },
        };
      }

      const video = data.items[0];
      const durationSeconds = parseISO8601Duration(video.contentDetails.duration);

      const metadata: YouTubeVideoMetadata = {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: getBestThumbnailUrl(video.snippet.thumbnails),
        duration: formatDuration(durationSeconds),
        durationSeconds,
        viewCount: parseInt(video.statistics.viewCount || "0", 10),
        publishedAt: video.snippet.publishedAt,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
      };

      return {
        success: true,
        data: metadata,
        error: null,
      };
    } catch (error) {
      // Handle timeout
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

      console.error("Error fetching video metadata:", error);
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
