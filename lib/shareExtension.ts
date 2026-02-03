/**
 * Share Extension Handler
 *
 * Handles deep links and share extension launches for recipe URL import.
 * Provides utilities to detect share context and extract shared URLs.
 */

import * as Linking from "expo-linking";

/**
 * Share context data extracted from deep link or share extension
 */
export interface ShareContext {
  /** Whether the app was launched from a share action */
  isFromShare: boolean;
  /** The shared URL if available */
  sharedUrl: string | null;
  /** Raw deep link URL */
  deepLinkUrl: string | null;
}

/**
 * Parse a Digero deep link URL
 *
 * Handles URL formats like:
 * - digero://import?url=https://example.com/recipe
 * - digero://recipe/import?url=https://example.com/recipe
 *
 * @param url - The deep link URL to parse
 * @returns Parsed share context
 */
export function parseDeepLink(url: string | null): ShareContext {
  if (!url) {
    return {
      isFromShare: false,
      sharedUrl: null,
      deepLinkUrl: null,
    };
  }

  try {
    const parsed = Linking.parse(url);

    // Check if this is an import action
    if (parsed.path === "import" || parsed.path === "recipe/import") {
      const sharedUrl = parsed.queryParams?.url;

      return {
        isFromShare: Boolean(sharedUrl),
        sharedUrl: typeof sharedUrl === "string" ? decodeURIComponent(sharedUrl) : null,
        deepLinkUrl: url,
      };
    }

    // Check for URL in query params without specific path
    if (parsed.queryParams?.url) {
      const sharedUrl = parsed.queryParams.url;

      return {
        isFromShare: true,
        sharedUrl: typeof sharedUrl === "string" ? decodeURIComponent(sharedUrl) : null,
        deepLinkUrl: url,
      };
    }

    return {
      isFromShare: false,
      sharedUrl: null,
      deepLinkUrl: url,
    };
  } catch {
    return {
      isFromShare: false,
      sharedUrl: null,
      deepLinkUrl: url,
    };
  }
}

/**
 * Create a deep link URL for importing a recipe
 *
 * @param recipeUrl - The recipe URL to import
 * @returns Digero deep link URL
 */
export function createImportDeepLink(recipeUrl: string): string {
  const encodedUrl = encodeURIComponent(recipeUrl);
  return `digero://import?url=${encodedUrl}`;
}

/**
 * Validate that a URL looks like a recipe page
 *
 * Basic heuristics to filter out non-recipe URLs.
 *
 * @param url - The URL to validate
 * @returns Whether the URL might be a recipe
 */
export function mightBeRecipeUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    // Must be HTTP/HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // Known recipe site domains (partial list)
    const recipeSites = [
      "allrecipes.com",
      "foodnetwork.com",
      "epicurious.com",
      "bonappetit.com",
      "seriouseats.com",
      "food52.com",
      "tasty.co",
      "delish.com",
      "simplyrecipes.com",
      "minimalistbaker.com",
      "budgetbytes.com",
      "pinchofyum.com",
      "halfbakedharvest.com",
      "cookieandkate.com",
    ];

    const hostname = parsed.hostname.toLowerCase().replace("www.", "");

    // Check if it's a known recipe site
    if (recipeSites.some((site) => hostname.includes(site))) {
      return true;
    }

    // Check for recipe-related keywords in the path
    const path = parsed.pathname.toLowerCase();
    const recipeKeywords = [
      "/recipe",
      "/recipes",
      "/food",
      "/cooking",
      "/dish",
      "/meal",
    ];

    if (recipeKeywords.some((keyword) => path.includes(keyword))) {
      return true;
    }

    // Otherwise, accept any valid HTTP URL (user knows best)
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the initial URL when the app launches
 *
 * Wraps Linking.getInitialURL with error handling.
 *
 * @returns The initial URL or null
 */
export async function getInitialShareUrl(): Promise<string | null> {
  try {
    const url = await Linking.getInitialURL();
    return url;
  } catch {
    return null;
  }
}

/**
 * Subscribe to incoming deep links
 *
 * @param callback - Called when a deep link is received
 * @returns Cleanup function
 */
export function subscribeToShareLinks(
  callback: (context: ShareContext) => void
): () => void {
  const subscription = Linking.addEventListener("url", (event) => {
    const context = parseDeepLink(event.url);
    callback(context);
  });

  return () => {
    subscription.remove();
  };
}
