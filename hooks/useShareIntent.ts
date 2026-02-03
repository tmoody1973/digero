/**
 * Share Intent Hook
 *
 * Handles URLs and text shared to the app from other apps
 * (YouTube, Safari, Chrome, etc.) via the Share Sheet.
 */

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useShareIntent } from "expo-share-intent";

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("youtube-nocookie.com")
  );
}

/**
 * Check if URL looks like a recipe website
 */
function isRecipeUrl(url: string): boolean {
  // Common recipe site patterns
  const recipePatterns = [
    /recipe/i,
    /cooking/i,
    /food/i,
    /allrecipes/i,
    /foodnetwork/i,
    /epicurious/i,
    /seriouseats/i,
    /bonappetit/i,
    /tasty/i,
    /delish/i,
    /simplyrecipes/i,
    /budgetbytes/i,
    /skinnytaste/i,
    /minimalistbaker/i,
    /halfbakedharvest/i,
    /pinchofyum/i,
    /smittenkitchen/i,
    /thewoksoflife/i,
    /justonecookbook/i,
    /cookieandkate/i,
  ];

  return recipePatterns.some((pattern) => pattern.test(url));
}

/**
 * Hook to handle share intent from other apps
 *
 * When a URL is shared to the app, this hook:
 * 1. Detects if it's a YouTube video → routes to YouTube import
 * 2. Detects if it's a recipe website → routes to web import
 * 3. Otherwise shows an error or allows manual entry
 */
export function useShareIntentHandler() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      handleShareIntent(shareIntent);
    }
  }, [hasShareIntent, shareIntent]);

  const handleShareIntent = async (intent: {
    text?: string;
    webUrl?: string;
    files?: any[];
  }) => {
    // Get the shared URL (could be in webUrl or text)
    const sharedUrl = intent.webUrl || intent.text || "";

    if (!sharedUrl) {
      resetShareIntent();
      return;
    }

    // Check if it's a YouTube URL
    if (isYouTubeUrl(sharedUrl)) {
      const videoId = extractYouTubeVideoId(sharedUrl);
      if (videoId) {
        // Navigate to YouTube import with the video ID
        router.push({
          pathname: "/(app)/recipes/youtube-import",
          params: { videoId, url: sharedUrl },
        });
        resetShareIntent();
        return;
      }
    }

    // Check if it's a web URL (likely a recipe)
    if (sharedUrl.startsWith("http://") || sharedUrl.startsWith("https://")) {
      // Navigate to web import with the URL and auto-extract
      router.push({
        pathname: "/(app)/recipes/import",
        params: { url: sharedUrl, autoExtract: "true" },
      });
      resetShareIntent();
      return;
    }

    // Reset if we couldn't handle it
    resetShareIntent();
  };

  return {
    hasShareIntent,
    shareIntent,
    resetShareIntent,
  };
}
