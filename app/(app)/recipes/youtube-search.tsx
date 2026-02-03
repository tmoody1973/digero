/**
 * YouTube Video Search Screen
 *
 * Search for recipe videos on YouTube and import them.
 */

import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Search, Clock, Eye, ChefHat } from "lucide-react-native";
import {
  YouTubeRecipePreviewModal,
  useYouTubeExtraction,
} from "@/components/discover";

interface VideoResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  channelAvatarUrl: string;
}

export default function YouTubeSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extraction state
  const {
    state: extractionState,
    extractFromVideoId,
    reset: resetExtraction,
  } = useYouTubeExtraction();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const searchVideosAction = useAction(
    api.actions.youtube.fetchChannelData.searchVideos
  );
  const saveFromYouTube = useMutation(api.recipes.saveFromYouTube);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const result = await searchVideosAction({
        query: searchQuery,
        maxResults: 20,
      });

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error?.message || "Search failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchVideosAction]);

  // Debounced search on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle video selection - extract recipe
  const handleVideoSelect = useCallback(
    async (video: VideoResult) => {
      setPreviewModalVisible(true);
      await extractFromVideoId(video.videoId);
    },
    [extractFromVideoId]
  );

  // Handle save recipe
  const handleSaveRecipe = useCallback(
    async (preview: any) => {
      try {
        await saveFromYouTube({
          title: preview.title,
          ingredients: preview.ingredients,
          instructions: preview.instructions,
          servings: preview.servings,
          prepTime: preview.prepTime,
          cookTime: preview.cookTime,
          youtubeVideoId: preview.videoId,
          sourceUrl: preview.sourceUrl,
          imageUrl: preview.thumbnailUrl,
        });

        setPreviewModalVisible(false);
        resetExtraction();
        router.push("/(app)");
      } catch (error) {
        console.error("Save error:", error);
      }
    },
    [saveFromYouTube, resetExtraction, router]
  );

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Render video item
  const renderVideoItem = ({ item }: { item: VideoResult }) => (
    <Pressable
      onPress={() => handleVideoSelect(item)}
      className="mb-4 overflow-hidden rounded-xl bg-white dark:bg-stone-800"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: item.thumbnailUrl }}
          className="h-48 w-full"
          resizeMode="cover"
        />
        {/* Duration badge */}
        <View className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5">
          <Text className="text-xs font-medium text-white">{item.duration}</Text>
        </View>
      </View>

      {/* Info */}
      <View className="p-3">
        <Text
          className="mb-2 text-base font-semibold text-stone-900 dark:text-white"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Channel info */}
        <View className="mb-2 flex-row items-center gap-2">
          {item.channelAvatarUrl ? (
            <Image
              source={{ uri: item.channelAvatarUrl }}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
              <ChefHat size={14} color="#78716c" />
            </View>
          )}
          <Text className="flex-1 text-sm text-stone-600 dark:text-stone-400" numberOfLines={1}>
            {item.channelTitle}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Eye size={14} color="#78716c" />
            <Text className="text-xs text-stone-500 dark:text-stone-400">
              {formatViewCount(item.viewCount)} views
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
        {/* Back and Title */}
        <View className="mb-4 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700 dark:text-stone-200" />
          </Pressable>
          <Text className="text-xl font-bold text-stone-900 dark:text-white">
            Search YouTube Recipes
          </Text>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
            <Search size={20} color="#78716c" />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for recipes (e.g., crab fried rice)"
            placeholderTextColor="#78716c"
            className="w-full rounded-xl bg-stone-100 py-3 pl-10 pr-4 text-stone-900 dark:bg-stone-800 dark:text-white"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {isSearching && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      {error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-2 text-center text-lg font-medium text-stone-900 dark:text-white">
            Something went wrong
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            {error}
          </Text>
        </View>
      ) : searchResults.length === 0 && !isSearching ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800">
            <Search size={40} color="#78716c" />
          </View>
          <Text className="mb-2 text-center text-lg font-medium text-stone-900 dark:text-white">
            Search for recipe videos
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Type a dish name like "pasta carbonara" or "thai green curry" to find
            recipe videos
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.videoId}
          contentContainerClassName="p-4"
          ListEmptyComponent={
            isSearching ? null : (
              <View className="items-center py-12">
                <Text className="text-stone-500 dark:text-stone-400">
                  No videos found
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Recipe Preview Modal */}
      <YouTubeRecipePreviewModal
        visible={previewModalVisible}
        preview={extractionState.recipePreview}
        isLoading={
          extractionState.status === "fetching" ||
          extractionState.status === "extracting"
        }
        onClose={() => {
          setPreviewModalVisible(false);
          resetExtraction();
        }}
        onSave={handleSaveRecipe}
      />
    </View>
  );
}
