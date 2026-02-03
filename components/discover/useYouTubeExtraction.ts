/**
 * YouTube Extraction Hook
 *
 * Custom hook for handling YouTube URL detection and recipe extraction.
 * Manages the extraction state machine and API calls.
 */

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  isYouTubeUrl,
  extractVideoId,
  buildYouTubeUrl,
} from "@/convex/lib/youtubeUrlParser";
import type {
  ExtractionState,
  YouTubeRecipePreview,
  ParsedIngredient,
} from "./types";

/**
 * Initial extraction state
 */
const initialState: ExtractionState = {
  status: "idle",
  videoMetadata: null,
  recipePreview: null,
  error: null,
};

/**
 * Hook return type
 */
interface UseYouTubeExtractionReturn {
  state: ExtractionState;
  isYouTubeUrl: (url: string) => boolean;
  extractFromUrl: (url: string) => Promise<void>;
  extractFromVideoId: (videoId: string) => Promise<void>;
  reset: () => void;
  updateRecipePreview: (updates: Partial<YouTubeRecipePreview>) => void;
}

/**
 * Custom hook for YouTube recipe extraction
 */
export function useYouTubeExtraction(): UseYouTubeExtractionReturn {
  const [state, setState] = useState<ExtractionState>(initialState);

  // Convex actions
  const fetchVideoMetadata = useAction(
    api.actions.youtube.fetchVideoMetadata.fetchVideoMetadata
  );
  const fetchCaptions = useAction(
    api.actions.youtube.fetchCaptions.fetchCaptions
  );
  const extractRecipe = useAction(
    api.actions.youtube.extractRecipeFromYouTube.extractRecipeFromYouTube
  );

  /**
   * Check if URL is a YouTube URL
   */
  const checkIsYouTubeUrl = useCallback((url: string): boolean => {
    return isYouTubeUrl(url);
  }, []);

  /**
   * Extract recipe from a YouTube URL
   */
  const extractFromUrl = useCallback(
    async (url: string): Promise<void> => {
      const videoId = extractVideoId(url);
      if (!videoId) {
        setState({
          status: "error",
          videoMetadata: null,
          recipePreview: null,
          error: {
            type: "INVALID_URL",
            message: "Could not extract video ID from URL",
          },
        });
        return;
      }

      await extractFromVideoId(videoId);
    },
    []
  );

  /**
   * Extract recipe from a video ID
   */
  const extractFromVideoId = useCallback(
    async (videoId: string): Promise<void> => {
      // Start fetching
      setState({
        status: "fetching",
        videoMetadata: null,
        recipePreview: null,
        error: null,
      });

      try {
        // Fetch video metadata
        const metadataResult = await fetchVideoMetadata({ videoId });

        if (!metadataResult.success || !metadataResult.data) {
          setState({
            status: "error",
            videoMetadata: null,
            recipePreview: null,
            error: metadataResult.error || {
              type: "FETCH_FAILED",
              message: "Failed to fetch video metadata",
            },
          });
          return;
        }

        const metadata = metadataResult.data;

        // Update state with metadata, start extraction
        setState({
          status: "extracting",
          videoMetadata: metadata,
          recipePreview: null,
          error: null,
        });

        // Try to fetch captions (optional, don't fail if unavailable)
        let captionsText: string | null = null;
        try {
          const captionsResult = await fetchCaptions({ videoId });
          if (captionsResult.success) {
            captionsText = captionsResult.captionsText;
          }
        } catch (e) {
          // Captions are optional, continue without them
          console.warn("Could not fetch captions:", e);
        }

        // Extract recipe using Gemini
        const extractionResult = await extractRecipe({
          videoTitle: metadata.title,
          description: metadata.description,
          captionsText: captionsText || undefined,
        });

        if (!extractionResult.success) {
          setState({
            status: "error",
            videoMetadata: metadata,
            recipePreview: null,
            error: extractionResult.error || {
              type: "EXTRACTION_FAILED",
              message: "Failed to extract recipe",
            },
          });
          return;
        }

        if (!extractionResult.isRecipe || !extractionResult.recipe) {
          setState({
            status: "error",
            videoMetadata: metadata,
            recipePreview: null,
            error: {
              type: "NO_RECIPE_FOUND",
              message:
                "This video does not appear to contain a recipe. You can enter it manually.",
            },
          });
          return;
        }

        // Build recipe preview
        const recipePreview: YouTubeRecipePreview = {
          videoId,
          videoTitle: metadata.title,
          thumbnailUrl: metadata.thumbnailUrl,
          sourceUrl: buildYouTubeUrl(videoId),
          title: extractionResult.recipe.title,
          ingredients: extractionResult.recipe.ingredients as ParsedIngredient[],
          instructions: extractionResult.recipe.instructions,
          prepTime: extractionResult.recipe.prepTime,
          cookTime: extractionResult.recipe.cookTime,
          servings: extractionResult.recipe.servings,
          confidence: extractionResult.recipe.confidence,
          extractionNotes: extractionResult.recipe.extractionNotes,
        };

        setState({
          status: "success",
          videoMetadata: metadata,
          recipePreview,
          error: null,
        });
      } catch (error) {
        console.error("Error during YouTube extraction:", error);
        setState({
          status: "error",
          videoMetadata: state.videoMetadata,
          recipePreview: null,
          error: {
            type: "EXTRACTION_FAILED",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          },
        });
      }
    },
    [fetchVideoMetadata, fetchCaptions, extractRecipe]
  );

  /**
   * Reset extraction state
   */
  const reset = useCallback((): void => {
    setState(initialState);
  }, []);

  /**
   * Update recipe preview with edits
   */
  const updateRecipePreview = useCallback(
    (updates: Partial<YouTubeRecipePreview>): void => {
      setState((prev) => {
        if (!prev.recipePreview) return prev;
        return {
          ...prev,
          recipePreview: {
            ...prev.recipePreview,
            ...updates,
          },
        };
      });
    },
    []
  );

  return {
    state,
    isYouTubeUrl: checkIsYouTubeUrl,
    extractFromUrl,
    extractFromVideoId,
    reset,
    updateRecipePreview,
  };
}
