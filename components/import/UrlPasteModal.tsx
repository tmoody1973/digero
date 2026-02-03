/**
 * URL Paste Modal Component
 *
 * Full-screen modal for entering a recipe URL and triggering extraction.
 * Features URL validation, loading state, error handling, and YouTube URL detection.
 *
 * When a YouTube URL is detected, routes to YouTube-specific extraction flow.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  X,
  Link,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Youtube,
} from "lucide-react-native";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  isYouTubeUrl,
  extractVideoId,
} from "@/convex/lib/youtubeUrlParser";
import type {
  UrlPasteModalProps,
  ReviewRecipeData,
  ExtractionResult,
  ParsedIngredient,
  YouTubeRecipeData,
} from "./types";

/**
 * Validate URL format (HTTP/HTTPS)
 */
function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: { type: string; message: string }): string {
  switch (error.type) {
    case "INVALID_URL":
      return "Please enter a valid URL starting with http:// or https://";
    case "FETCH_FAILED":
      return "Could not access this website. Please check the URL and try again.";
    case "TIMEOUT":
      return "The website took too long to respond. Please try again.";
    case "PAYWALL_DETECTED":
      return "This recipe appears to be behind a paywall or login wall.";
    case "EXTRACTION_FAILED":
      return "Could not extract recipe data from this page.";
    case "NO_RECIPE_FOUND":
      return "No recipe was found on this page.";
    case "YOUTUBE_NO_RECIPE":
      return "This video does not appear to contain a recipe. You can enter it manually.";
    case "YOUTUBE_API_ERROR":
      return "Could not fetch video data from YouTube. Please try again.";
    default:
      return error.message || "An unexpected error occurred.";
  }
}

/**
 * Convert extracted data to review format with default values
 */
function toReviewData(
  data: NonNullable<ExtractionResult["data"]>,
  sourceUrl: string
): ReviewRecipeData {
  // Convert ingredients to parsed format
  const ingredients: ParsedIngredient[] = data.ingredients.map((ing) => {
    if (ing.parsed) {
      return ing.parsed;
    }
    // Parse raw ingredient string (basic parsing)
    const match = ing.raw.match(/^([\d/.]+)?\s*(\w+)?\s*(.+)$/);
    if (match) {
      return {
        name: match[3]?.trim() || ing.raw,
        quantity: match[1] ? parseFloat(match[1]) : 1,
        unit: match[2] || "item",
        category: "other" as const,
      };
    }
    return {
      name: ing.raw,
      quantity: 1,
      unit: "item",
      category: "other" as const,
    };
  });

  return {
    title: data.title || "Untitled Recipe",
    imageUrl: data.imageUrl || "",
    ingredients,
    instructions: data.instructions,
    servings: data.servings || 4,
    prepTime: data.prepTime || 0,
    cookTime: data.cookTime || 0,
    confidence: data.confidence,
    sourceUrl,
  };
}

/**
 * YouTube extraction state type
 */
type YouTubeExtractionState = {
  status: "idle" | "fetching" | "extracting" | "success" | "error";
  videoTitle?: string;
  thumbnailUrl?: string;
  error?: { type: string; message: string };
};

/**
 * UrlPasteModal
 *
 * Full-screen modal with dark theme for entering recipe URLs.
 * Features:
 * - URL format validation with inline error
 * - YouTube URL detection and specialized extraction
 * - Loading state with Sparkles icon
 * - Error handling with retry option
 * - Create manually fallback
 */
export function UrlPasteModal({
  visible,
  onClose,
  onSuccess,
  onYouTubeSuccess,
  initialUrl = "",
  autoExtract = false,
}: UrlPasteModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ type: string; message: string } | null>(
    null
  );
  const [touched, setTouched] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeState, setYoutubeState] = useState<YouTubeExtractionState>({
    status: "idle",
  });

  // Convex actions
  const extractRecipe = useAction(
    api.actions.extractRecipeFromUrl.extractRecipeFromUrl
  );
  const fetchVideoMetadata = useAction(
    api.actions.youtube.fetchVideoMetadata.fetchVideoMetadata
  );
  const fetchCaptions = useAction(
    api.actions.youtube.fetchCaptions.fetchCaptions
  );
  const extractYouTubeRecipe = useAction(
    api.actions.youtube.extractRecipeFromYouTube.extractRecipeFromYouTube
  );

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setUrl(initialUrl);
      setError(null);
      setTouched(false);
      setIsLoading(false);
      setIsYouTube(false);
      setYoutubeState({ status: "idle" });
    }
  }, [visible, initialUrl]);

  // Detect YouTube URL on change
  useEffect(() => {
    const urlIsYouTube = isYouTubeUrl(url);
    setIsYouTube(urlIsYouTube);
  }, [url]);

  // Auto-extract if initialUrl provided and autoExtract is true
  useEffect(() => {
    if (visible && autoExtract && initialUrl && isValidUrl(initialUrl)) {
      handleExtract();
    }
  }, [visible, autoExtract, initialUrl]);

  const isUrlValid = isValidUrl(url);
  const showError = touched && !isUrlValid && url.length > 0;

  /**
   * Handle YouTube-specific extraction
   */
  const handleYouTubeExtract = useCallback(async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError({
        type: "INVALID_URL",
        message: "Could not extract video ID from YouTube URL",
      });
      return;
    }

    setYoutubeState({ status: "fetching" });
    setIsLoading(true);
    setError(null);

    try {
      // Fetch video metadata
      const metadataResult = await fetchVideoMetadata({ videoId });

      if (!metadataResult.success || !metadataResult.data) {
        setYoutubeState({
          status: "error",
          error: metadataResult.error || {
            type: "YOUTUBE_API_ERROR",
            message: "Failed to fetch video metadata",
          },
        });
        setError(metadataResult.error || {
          type: "YOUTUBE_API_ERROR",
          message: "Failed to fetch video metadata",
        });
        setIsLoading(false);
        return;
      }

      const metadata = metadataResult.data;

      // Update state with metadata, start extraction
      setYoutubeState({
        status: "extracting",
        videoTitle: metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
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
      const extractionResult = await extractYouTubeRecipe({
        videoTitle: metadata.title,
        description: metadata.description,
        captionsText: captionsText || undefined,
      });

      if (!extractionResult.success) {
        setYoutubeState({
          status: "error",
          videoTitle: metadata.title,
          thumbnailUrl: metadata.thumbnailUrl,
          error: extractionResult.error || {
            type: "EXTRACTION_FAILED",
            message: "Failed to extract recipe",
          },
        });
        setError(extractionResult.error || {
          type: "EXTRACTION_FAILED",
          message: "Failed to extract recipe",
        });
        setIsLoading(false);
        return;
      }

      if (!extractionResult.isRecipe || !extractionResult.recipe) {
        setYoutubeState({
          status: "error",
          videoTitle: metadata.title,
          thumbnailUrl: metadata.thumbnailUrl,
          error: {
            type: "YOUTUBE_NO_RECIPE",
            message:
              "This video does not appear to contain a recipe. You can enter it manually.",
          },
        });
        setError({
          type: "YOUTUBE_NO_RECIPE",
          message:
            "This video does not appear to contain a recipe. You can enter it manually.",
        });
        setIsLoading(false);
        return;
      }

      // Build recipe data
      const youtubeRecipeData: YouTubeRecipeData = {
        videoId,
        videoTitle: metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: extractionResult.recipe.title,
        ingredients: extractionResult.recipe.ingredients as ParsedIngredient[],
        instructions: extractionResult.recipe.instructions,
        prepTime: extractionResult.recipe.prepTime,
        cookTime: extractionResult.recipe.cookTime,
        servings: extractionResult.recipe.servings,
        confidence: extractionResult.recipe.confidence as
          | "high"
          | "medium"
          | "low",
        extractionNotes: extractionResult.recipe.extractionNotes,
      };

      setYoutubeState({ status: "success" });
      setIsLoading(false);

      // Call YouTube-specific success handler if provided, otherwise convert to standard format
      if (onYouTubeSuccess) {
        onYouTubeSuccess(youtubeRecipeData);
      } else {
        // Convert to standard ReviewRecipeData format
        const reviewData: ReviewRecipeData = {
          title: youtubeRecipeData.title,
          imageUrl: youtubeRecipeData.thumbnailUrl,
          ingredients: youtubeRecipeData.ingredients,
          instructions: youtubeRecipeData.instructions,
          servings: youtubeRecipeData.servings,
          prepTime: youtubeRecipeData.prepTime,
          cookTime: youtubeRecipeData.cookTime,
          confidence: {
            title: youtubeRecipeData.confidence,
            ingredients: youtubeRecipeData.confidence,
            instructions: youtubeRecipeData.confidence,
          },
          sourceUrl: youtubeRecipeData.sourceUrl,
        };
        onSuccess(reviewData);
      }
    } catch (err) {
      console.error("Error during YouTube extraction:", err);
      setYoutubeState({
        status: "error",
        error: {
          type: "EXTRACTION_FAILED",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred",
        },
      });
      setError({
        type: "EXTRACTION_FAILED",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
      setIsLoading(false);
    }
  }, [
    url,
    fetchVideoMetadata,
    fetchCaptions,
    extractYouTubeRecipe,
    onYouTubeSuccess,
    onSuccess,
  ]);

  /**
   * Handle standard web extraction
   */
  const handleWebExtract = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await extractRecipe({ url: url.trim() });

      if (result.success && result.data) {
        const reviewData = toReviewData(result.data, result.sourceUrl);
        onSuccess(reviewData);
      } else if (result.error) {
        setError(result.error);
      } else {
        setError({
          type: "EXTRACTION_FAILED",
          message: "Failed to extract recipe",
        });
      }
    } catch (err) {
      setError({
        type: "EXTRACTION_FAILED",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, extractRecipe, onSuccess]);

  /**
   * Main extract handler - routes to appropriate extraction method
   */
  const handleExtract = useCallback(async () => {
    if (!isUrlValid) {
      setTouched(true);
      return;
    }

    // Route to YouTube extraction if YouTube URL detected
    if (isYouTube) {
      await handleYouTubeExtract();
    } else {
      await handleWebExtract();
    }
  }, [isUrlValid, isYouTube, handleYouTubeExtract, handleWebExtract]);

  const handleRetry = () => {
    setError(null);
    setYoutubeState({ status: "idle" });
    handleExtract();
  };

  const handleCreateManually = () => {
    // Close modal and trigger manual creation with URL
    onClose();
    // Note: Parent component should handle navigation to manual create with sourceUrl
  };

  // Determine loading message based on extraction type
  const getLoadingMessage = () => {
    if (isYouTube) {
      if (youtubeState.status === "fetching") {
        return "Fetching video data...";
      }
      if (youtubeState.status === "extracting") {
        return "Extracting recipe from video...";
      }
    }
    return "Importing Recipe...";
  };

  const getLoadingSubtext = () => {
    if (isYouTube) {
      if (youtubeState.status === "fetching") {
        return "Getting video information from YouTube";
      }
      if (youtubeState.status === "extracting") {
        return "AI is analyzing the video description";
      }
    }
    return "Extracting recipe data from the webpage";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-stone-950"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-800 px-4 py-4">
          <Pressable
            onPress={onClose}
            disabled={isLoading}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-800"
          >
            <X size={24} color={isLoading ? "#57534e" : "#a8a29e"} />
          </Pressable>
          <Text className="text-lg font-semibold text-white">Import Recipe</Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-8">
          {/* Icon */}
          <View className="mb-8 items-center">
            <View
              className={`mb-4 h-24 w-24 items-center justify-center rounded-3xl ${
                isYouTube ? "bg-red-500/20" : "bg-blue-500/20"
              }`}
            >
              {isLoading ? (
                <Sparkles
                  size={48}
                  color={isYouTube ? "#ef4444" : "#3b82f6"}
                  className="animate-pulse"
                />
              ) : isYouTube ? (
                <Youtube size={48} color="#ef4444" />
              ) : (
                <Link size={48} color="#3b82f6" />
              )}
            </View>
            <Text className="mb-2 text-2xl font-bold text-white">
              {isLoading ? getLoadingMessage() : "Paste Recipe URL"}
            </Text>
            <Text className="text-center text-stone-400">
              {isLoading
                ? getLoadingSubtext()
                : isYouTube
                  ? "YouTube video detected - will extract recipe using AI"
                  : "Enter the URL of a recipe from any website"}
            </Text>
          </View>

          {/* YouTube Video Preview during loading */}
          {isLoading && isYouTube && youtubeState.thumbnailUrl && (
            <View className="mb-6 items-center">
              <View className="w-full aspect-video rounded-xl overflow-hidden mb-2">
                <Image
                  source={{ uri: youtubeState.thumbnailUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-black/80 px-2 py-1 rounded">
                  <Youtube size={14} color="#ef4444" />
                  <Text className="text-white text-xs font-medium">YouTube</Text>
                </View>
              </View>
              {youtubeState.videoTitle && (
                <Text
                  className="text-white text-center font-medium"
                  numberOfLines={2}
                >
                  {youtubeState.videoTitle}
                </Text>
              )}
            </View>
          )}

          {/* URL Input */}
          {!isLoading && (
            <View className="mb-6">
              <TextInput
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setError(null);
                }}
                onBlur={() => setTouched(true)}
                placeholder="https://example.com/recipe"
                placeholderTextColor="#78716c"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleExtract}
                editable={!isLoading}
                className={`rounded-xl border ${
                  showError || error
                    ? "border-red-500 bg-red-500/10"
                    : isYouTube
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-stone-700 bg-stone-800"
                } px-4 py-4 text-base text-white`}
              />

              {/* YouTube URL detected indicator */}
              {isYouTube && !showError && !error && (
                <View className="mt-2 flex-row items-center gap-2">
                  <Youtube size={16} color="#ef4444" />
                  <Text className="text-sm text-red-400">
                    YouTube video detected
                  </Text>
                </View>
              )}

              {/* Validation Error */}
              {showError && (
                <Text className="mt-2 text-sm text-red-400">
                  Please enter a valid URL (http:// or https://)
                </Text>
              )}
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="mt-4 text-stone-400">
                This may take a few moments...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <AlertCircle size={20} color="#ef4444" />
                <Text className="font-semibold text-red-400">
                  Import Failed
                </Text>
              </View>
              <Text className="mb-4 text-red-300">{getErrorMessage(error)}</Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleRetry}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-red-500/20 py-3 active:bg-red-500/30"
                >
                  <RefreshCw size={18} color="#ef4444" />
                  <Text className="font-semibold text-red-400">Try Again</Text>
                </Pressable>
              </View>

              {/* Create Manually Option */}
              <Pressable
                onPress={handleCreateManually}
                className="mt-3 py-2"
              >
                <Text className="text-center text-sm text-stone-400 underline">
                  Create manually with this URL
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Bottom Action */}
        {!isLoading && !error && (
          <View className="border-t border-stone-800 p-6">
            <Pressable
              onPress={handleExtract}
              disabled={!isUrlValid || isLoading}
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
                isUrlValid
                  ? isYouTube
                    ? "bg-red-500 active:bg-red-600"
                    : "bg-orange-500 active:bg-orange-600"
                  : "bg-stone-700"
              }`}
            >
              {isYouTube ? (
                <Youtube size={20} color={isUrlValid ? "#fff" : "#78716c"} />
              ) : (
                <Sparkles size={20} color={isUrlValid ? "#fff" : "#78716c"} />
              )}
              <Text
                className={`text-lg font-semibold ${
                  isUrlValid ? "text-white" : "text-stone-500"
                }`}
              >
                {isYouTube ? "Extract from YouTube" : "Import Recipe"}
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
