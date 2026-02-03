/**
 * Fetch Recipe URL Action
 *
 * Convex action to fetch HTML content from a recipe URL.
 * Handles URL validation, timeout, and proper error handling.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * Error types for URL fetching
 */
export type FetchErrorType =
  | "INVALID_URL"
  | "FETCH_FAILED"
  | "TIMEOUT"
  | "PAYWALL_DETECTED";

/**
 * Result of fetching a URL
 */
export interface FetchResult {
  success: boolean;
  html: string | null;
  error: {
    type: FetchErrorType;
    message: string;
  } | null;
}

/**
 * Validate URL format (HTTP/HTTPS only)
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Detect if the response indicates a paywall
 */
function detectPaywall(html: string): boolean {
  const paywallIndicators = [
    "subscription required",
    "subscribe to continue",
    "premium content",
    "paywall",
    "sign in to read",
    "members only",
    "login to view",
    "subscriber-only",
    "create an account to",
  ];

  const lowerHtml = html.toLowerCase();
  return paywallIndicators.some((indicator) => lowerHtml.includes(indicator));
}

/**
 * Fetch recipe URL action
 *
 * Fetches HTML content from a URL with:
 * - URL format validation (HTTP/HTTPS)
 * - 30-second timeout
 * - Proper User-Agent to avoid bot blocking
 * - Paywall detection
 *
 * @param url - The URL to fetch
 * @returns FetchResult with HTML content or error details
 */
export const fetchRecipeUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (_, args): Promise<FetchResult> => {
    const { url } = args;

    // Validate URL format
    if (!isValidUrl(url)) {
      return {
        success: false,
        html: null,
        error: {
          type: "INVALID_URL",
          message: "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
        },
      };
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          // Use a browser-like User-Agent to avoid bot blocking
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      // Check for HTTP errors
      if (!response.ok) {
        return {
          success: false,
          html: null,
          error: {
            type: "FETCH_FAILED",
            message: `Failed to fetch URL: HTTP ${response.status} ${response.statusText}`,
          },
        };
      }

      // Read HTML content
      const html = await response.text();

      // Check for paywall
      if (detectPaywall(html)) {
        return {
          success: false,
          html: null,
          error: {
            type: "PAYWALL_DETECTED",
            message:
              "This recipe appears to be behind a paywall. Please try a different URL.",
          },
        };
      }

      return {
        success: true,
        html,
        error: null,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          html: null,
          error: {
            type: "TIMEOUT",
            message:
              "Request timed out. The website took too long to respond. Please try again.",
          },
        };
      }

      // Handle other fetch errors
      return {
        success: false,
        html: null,
        error: {
          type: "FETCH_FAILED",
          message: `Failed to fetch URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      };
    }
  },
});
