/**
 * YouTube Recipe Import Screen
 *
 * Import recipes from YouTube video URLs.
 * Extracts recipe data from video captions/description using AI.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Youtube,
  Link,
  Sparkles,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react-native";

import { parseYouTubeUrl } from "@/convex/lib/youtubeUrlParser";

type ImportStep = "url" | "extracting" | "preview";

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: "meat" | "produce" | "dairy" | "pantry" | "spices" | "condiments" | "bread" | "other";
}

interface RecipePreview {
  title: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  videoId: string;
  thumbnailUrl: string;
  channelName: string;
  description: string;
}

export default function YouTubeImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string; videoId?: string }>();

  const [url, setUrl] = useState("");
  const [step, setStep] = useState<ImportStep>("url");
  const [preview, setPreview] = useState<RecipePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAutoExtracted, setHasAutoExtracted] = useState(false);

  // Convex actions
  const fetchVideoMetadata = useAction(api.actions.youtube.fetchVideoMetadata.fetchVideoMetadata);
  const fetchCaptions = useAction(api.actions.youtube.fetchCaptions.fetchCaptions);
  const extractRecipe = useAction(api.actions.youtube.extractRecipeFromYouTube.extractRecipeFromYouTube);
  const saveFromYouTube = useMutation(api.recipes.saveFromYouTube);

  // Handle URL shared from other apps
  useEffect(() => {
    if (params.url && !hasAutoExtracted) {
      setUrl(params.url);
      setHasAutoExtracted(true);
      // Auto-extract after a short delay to allow UI to render
      setTimeout(() => {
        // Will trigger extraction on next render when url state is set
      }, 100);
    }
  }, [params.url, hasAutoExtracted]);

  const handleExtract = useCallback(async () => {
    setError(null);

    // Parse and validate URL
    const parsed = parseYouTubeUrl(url.trim());
    if (!parsed.isValid || !parsed.videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsExtracting(true);
    setStep("extracting");

    try {
      // Step 1: Fetch video metadata
      const metadataResult = await fetchVideoMetadata({ videoId: parsed.videoId });

      if (!metadataResult.success || !metadataResult.data) {
        setError(metadataResult.error?.message || "Failed to fetch video data");
        setStep("url");
        setIsExtracting(false);
        return;
      }

      const metadata = metadataResult.data;

      // Step 2: Try to fetch captions (optional)
      let captionsText: string | undefined;
      try {
        const captionsResult = await fetchCaptions({ videoId: parsed.videoId });
        if (captionsResult.success && captionsResult.captionsText) {
          captionsText = captionsResult.captionsText;
        }
      } catch {
        // Captions are optional, continue without them
      }

      // Step 3: Extract recipe using Gemini
      const extractionResult = await extractRecipe({
        videoTitle: metadata.title,
        description: metadata.description,
        captionsText,
      });

      if (!extractionResult.success) {
        setError(extractionResult.error?.message || "Failed to extract recipe");
        setStep("url");
        setIsExtracting(false);
        return;
      }

      if (!extractionResult.isRecipe || !extractionResult.recipe) {
        setError("This video doesn't appear to contain a recipe. Try a cooking video with ingredients listed.");
        setStep("url");
        setIsExtracting(false);
        return;
      }

      // Build preview with proper ingredient format
      setPreview({
        title: extractionResult.recipe.title,
        ingredients: extractionResult.recipe.ingredients as ParsedIngredient[],
        instructions: extractionResult.recipe.instructions,
        servings: extractionResult.recipe.servings || 4,
        prepTime: extractionResult.recipe.prepTime || 0,
        cookTime: extractionResult.recipe.cookTime || 0,
        videoId: parsed.videoId,
        thumbnailUrl: metadata.thumbnailUrl || `https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg`,
        channelName: metadata.channelTitle || "Unknown Channel",
        description: metadata.description,
      });
      setStep("preview");
    } catch (err) {
      console.error("Extraction error:", err);
      setError("Failed to extract recipe. Please try again.");
      setStep("url");
    } finally {
      setIsExtracting(false);
    }
  }, [url, fetchVideoMetadata, fetchCaptions, extractRecipe]);

  const handleSave = useCallback(async () => {
    if (!preview || isSaving) return;

    setIsSaving(true);
    try {
      const recipeId = await saveFromYouTube({
        title: preview.title,
        ingredients: preview.ingredients,
        instructions: preview.instructions,
        servings: preview.servings,
        prepTime: preview.prepTime,
        cookTime: preview.cookTime,
        youtubeVideoId: preview.videoId,
        sourceUrl: `https://www.youtube.com/watch?v=${preview.videoId}`,
        imageUrl: preview.thumbnailUrl,
        // Creator attribution - YouTube channel name
        sourceName: preview.channelName,
        notes: preview.description.substring(0, 500), // Store description as notes
      });

      router.replace(`/(app)/recipes/${recipeId}`);
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
      setIsSaving(false);
    }
  }, [preview, isSaving, saveFromYouTube, router]);

  const handleBack = useCallback(() => {
    if (step === "preview") {
      setStep("url");
      setPreview(null);
    } else {
      router.back();
    }
  }, [step, router]);

  // Format ingredient for display
  const formatIngredient = (ing: ParsedIngredient): string => {
    const qty = ing.quantity !== 1 ? `${ing.quantity} ` : "";
    const unit = ing.unit && ing.unit !== "item" ? `${ing.unit} ` : "";
    return `${qty}${unit}${ing.name}`.trim();
  };

  // URL Input Step
  if (step === "url" || step === "extracting") {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center gap-4 px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <Pressable onPress={handleBack} className="p-2 -m-2">
              <ArrowLeft size={24} color="#78716c" />
            </Pressable>
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">
              Import from YouTube
            </Text>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4">
                <Youtube size={40} color="#ef4444" />
              </View>
              <Text className="text-lg font-semibold text-stone-900 dark:text-white text-center">
                Paste a YouTube URL
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400 text-center mt-1">
                We'll extract the recipe from the video
              </Text>
            </View>

            {/* URL Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                YouTube URL
              </Text>
              <View className="flex-row items-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                <View className="p-3">
                  <Link size={20} color="#78716c" />
                </View>
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor="#a8a29e"
                  className="flex-1 py-3 pr-4 text-stone-900 dark:text-white"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!isExtracting}
                />
              </View>
            </View>

            {/* Error */}
            {error && (
              <View className="flex-row items-center gap-2 mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertCircle size={20} color="#ef4444" />
                <Text className="flex-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </Text>
              </View>
            )}

            {/* Extract Button */}
            <Pressable
              onPress={handleExtract}
              disabled={!url.trim() || isExtracting}
              className={`flex-row items-center justify-center gap-2 py-4 rounded-xl ${
                url.trim() && !isExtracting
                  ? "bg-red-500 active:bg-red-600"
                  : "bg-stone-300 dark:bg-stone-700"
              }`}
            >
              {isExtracting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold">Extracting Recipe...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text className="text-white font-semibold">Extract Recipe</Text>
                </>
              )}
            </Pressable>

            {/* Supported formats */}
            <View className="mt-8">
              <Text className="text-xs text-stone-400 dark:text-stone-500 text-center">
                Supported formats: youtube.com, youtu.be, YouTube Shorts
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Preview Step
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-4 px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <Pressable onPress={handleBack} className="p-2 -m-2">
          <ArrowLeft size={24} color="#78716c" />
        </Pressable>
        <Text className="text-lg font-semibold text-stone-900 dark:text-white">
          Review Recipe
        </Text>
      </View>

      <ScrollView className="flex-1">
        {preview && (
          <>
            {/* Video Thumbnail */}
            <View className="relative aspect-video">
              <Image
                source={{ uri: preview.thumbnailUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded">
                <Text className="text-white text-xs">{preview.channelName}</Text>
              </View>
            </View>

            <View className="p-4">
              {/* Title */}
              <Text className="text-xl font-bold text-stone-900 dark:text-white mb-3">
                {preview.title}
              </Text>

              {/* Meta */}
              <View className="flex-row gap-4 mb-6">
                {preview.servings > 0 && (
                  <View className="flex-row items-center gap-1">
                    <Users size={16} color="#78716c" />
                    <Text className="text-sm text-stone-500 dark:text-stone-400">
                      {preview.servings} servings
                    </Text>
                  </View>
                )}
                {(preview.prepTime > 0 || preview.cookTime > 0) && (
                  <View className="flex-row items-center gap-1">
                    <Clock size={16} color="#78716c" />
                    <Text className="text-sm text-stone-500 dark:text-stone-400">
                      {preview.prepTime + preview.cookTime} min total
                    </Text>
                  </View>
                )}
              </View>

              {/* Ingredients */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-stone-900 dark:text-white mb-3">
                  Ingredients ({preview.ingredients.length})
                </Text>
                <View className="bg-white dark:bg-stone-800 rounded-xl p-4">
                  {preview.ingredients.map((ing, i) => (
                    <Text
                      key={i}
                      className="text-stone-700 dark:text-stone-300 py-1"
                    >
                      • {formatIngredient(ing)}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Instructions */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-stone-900 dark:text-white mb-3">
                  Instructions ({preview.instructions.length} steps)
                </Text>
                <View className="bg-white dark:bg-stone-800 rounded-xl p-4">
                  {preview.instructions.map((inst, i) => (
                    <View key={i} className="flex-row mb-3">
                      <Text className="text-orange-500 font-semibold mr-3">
                        {i + 1}.
                      </Text>
                      <Text className="flex-1 text-stone-700 dark:text-stone-300">
                        {inst}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <View className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className={`py-4 rounded-xl items-center ${
            isSaving ? "bg-stone-400" : "bg-orange-500 active:bg-orange-600"
          }`}
        >
          {isSaving ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold">Saving...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold">Save Recipe</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
