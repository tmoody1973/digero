/**
 * Discover Screen
 *
 * Main discovery interface for browsing YouTube cooking channels and video feed.
 * Includes view toggle (Feed/Channels), search, category filters, and channel sections.
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Search,
  Video,
  Users,
  Star,
  ChefHat,
  LayoutGrid,
  List,
  Settings,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";

import {
  ChannelCard,
  VideoCard,
  SpotlightCard,
  CategoryChip,
  VideoPlayerModal,
  YouTubeRecipePreviewModal,
  useYouTubeExtraction,
  type ChannelData,
  type FeedVideoData,
  type Category,
  type ViewMode,
  type FeedViewMode,
  type ChannelFilter,
  type ChannelCategory,
} from "@/components/discover";
import { TabBar } from "@/components/navigation";
import { DigeroLogo } from "@/components/brand";

/**
 * Available categories for filtering
 */
const CATEGORIES: Category[] = [
  { id: "italian", name: "Italian", icon: "pizza" },
  { id: "asian", name: "Asian", icon: "soup" },
  { id: "quick", name: "Quick Meals", icon: "timer" },
  { id: "baking", name: "Baking", icon: "cake" },
  { id: "healthy", name: "Healthy", icon: "salad" },
  { id: "bbq", name: "BBQ & Grilling", icon: "flame" },
];

/**
 * Map category filter to channel category type
 */
function mapCategoryIdToName(id: string): ChannelCategory | null {
  const mapping: Record<string, ChannelCategory> = {
    italian: "Italian",
    asian: "Asian",
    quick: "Quick Meals",
    baking: "Baking",
    healthy: "Healthy",
    bbq: "BBQ & Grilling",
  };
  return mapping[id] || null;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("channels");
  const [feedViewMode, setFeedViewMode] = useState<FeedViewMode>("list");
  const [channelViewMode, setChannelViewMode] = useState<FeedViewMode>("list");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChannelData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Feed pagination state
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Video player state
  const [playerVisible, setPlayerVisible] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");

  // Extraction state
  const {
    state: extractionState,
    extractFromVideoId,
    reset: resetExtraction,
  } = useYouTubeExtraction();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Convex queries
  const followedChannels = useQuery(api.channels.getFollowedChannels);
  const featuredChannels = useQuery(api.channels.getFeaturedChannels, {
    limit: 20,
  });
  const allChannels = useQuery(api.channels.getAllChannels, { limit: 50 });
  const followedCount = useQuery(api.channels.getFollowedChannelCount);
  const videoFeed = useQuery(api.channels.getVideoFeed, {
    limit: 20,
    cursor: feedCursor ?? undefined,
  });

  // Convex mutations
  const followChannel = useMutation(api.channels.followChannel);
  const unfollowChannel = useMutation(api.channels.unfollowChannel);
  const saveFromYouTube = useMutation(api.recipes.saveFromYouTube);

  // Convex actions
  const searchChannelsAction = useAction(
    api.actions.youtube.fetchChannelData.searchChannels
  );
  const refreshVideosAction = useAction(
    api.actions.youtube.cacheChannelVideos.refreshFollowedChannelVideos
  );
  const refreshChannelBannerAction = useAction(
    api.actions.youtube.refreshChannelBanner.refreshChannelBanner
  );

  // State for video refresh
  const [isRefreshingVideos, setIsRefreshingVideos] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Feed videos data
  const feedVideos = useMemo((): FeedVideoData[] => {
    if (!videoFeed?.videos) return [];

    return videoFeed.videos.map((video) => ({
      videoId: video.videoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      viewCount: video.viewCount,
      publishedAt: video.publishedAt,
      channelId: video.channelId,
      channelTitle: video.channelName,
      channelName: video.channelName,
      channelAvatarUrl: video.channelAvatarUrl,
    }));
  }, [videoFeed]);

  // Derived data
  const channels = useMemo(() => {
    if (!allChannels) return [];

    return allChannels.map((channel) => ({
      id: channel._id,
      youtubeChannelId: channel.youtubeChannelId,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
      bannerUrl: channel.bannerUrl,
      subscriberCount: channel.subscriberCount,
      description: channel.description,
      videoCount: channel.videoCount,
      category: channel.category as ChannelCategory,
      isFeatured: channel.isFeatured,
      isFollowing: channel.isFollowing,
      recentVideos: [],
    }));
  }, [allChannels]);

  const featuredChannelsList = useMemo(() => {
    if (!featuredChannels) return [];

    return featuredChannels.map((channel) => ({
      id: channel._id,
      youtubeChannelId: channel.youtubeChannelId,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
      bannerUrl: channel.bannerUrl,
      subscriberCount: channel.subscriberCount,
      description: channel.description,
      videoCount: channel.videoCount,
      category: channel.category as ChannelCategory,
      isFeatured: channel.isFeatured,
      isFollowing: channel.isFollowing,
      recentVideos: [],
    }));
  }, [featuredChannels]);

  const followedChannelsList = useMemo(() => {
    if (!followedChannels) return [];

    return followedChannels.map((channel) => ({
      id: channel._id,
      youtubeChannelId: channel.youtubeChannelId,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
      bannerUrl: channel.bannerUrl,
      subscriberCount: channel.subscriberCount,
      description: channel.description,
      videoCount: channel.videoCount,
      category: channel.category as ChannelCategory,
      isFeatured: channel.isFeatured,
      isFollowing: true,
      recentVideos: [],
    }));
  }, [followedChannels]);

  // Filter channels based on search, category, and filter
  const filteredChannels = useMemo(() => {
    // If searching, use search results
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults;
    }

    let result = channels;

    // Apply channel filter
    if (channelFilter === "following") {
      result = followedChannelsList;
    } else if (channelFilter === "featured") {
      result = featuredChannelsList;
    }

    // Apply category filter
    if (selectedCategory) {
      const categoryName = mapCategoryIdToName(selectedCategory);
      if (categoryName) {
        result = result.filter((channel) => channel.category === categoryName);
      }
    }

    return result;
  }, [
    channels,
    followedChannelsList,
    featuredChannelsList,
    channelFilter,
    selectedCategory,
    searchQuery,
    searchResults,
  ]);

  // Suggested channels (non-followed)
  const suggestedChannels = useMemo(() => {
    return channels.filter((channel) => !channel.isFollowing).slice(0, 10);
  }, [channels]);

  // Spotlight channel - Eitan Bernath (check in followed channels first, then all)
  const spotlightChannel = useMemo(() => {
    const searchName = "eitan bernath";
    // First check followed channels
    const fromFollowed = followedChannelsList.find(
      (channel) => channel.name.toLowerCase().includes(searchName)
    );
    if (fromFollowed) return fromFollowed;
    // Then check all channels
    return channels.find(
      (channel) => channel.name.toLowerCase().includes(searchName)
    );
  }, [followedChannelsList, channels]);

  // Query creator profile for spotlight channel to check partnership status
  const spotlightCreatorProfile = useQuery(
    api.creator.getCreatorByChannel,
    spotlightChannel?.youtubeChannelId
      ? { youtubeChannelId: spotlightChannel.youtubeChannelId }
      : "skip"
  );

  // Query creator's products for spotlight channel
  const spotlightCreatorProducts = useQuery(
    api.creatorShop.getProducts,
    spotlightCreatorProfile?._id ? { creatorId: spotlightCreatorProfile._id } : "skip"
  );

  // Check if spotlight creator is a partner with a shop
  const spotlightIsPartner =
    spotlightCreatorProfile?.tier === "partner" &&
    spotlightCreatorProfile?.applicationStatus === "approved";
  const spotlightHasShop =
    spotlightCreatorProfile?.applicationStatus === "approved" &&
    spotlightCreatorProducts &&
    spotlightCreatorProducts.length > 0;

  // Auto-refresh spotlight channel banner if missing
  useEffect(() => {
    if (spotlightChannel && !spotlightChannel.bannerUrl) {
      refreshChannelBannerAction({
        youtubeChannelId: spotlightChannel.youtubeChannelId,
      }).catch((error) => {
        console.error("Failed to refresh spotlight banner:", error);
      });
    }
  }, [spotlightChannel?.youtubeChannelId, spotlightChannel?.bannerUrl, refreshChannelBannerAction]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchChannelsAction({
          query: searchQuery,
          maxResults: 10,
        });

        if (result.success && result.data) {
          const mappedResults: ChannelData[] = result.data.map((channel) => ({
            id: channel.channelId,
            youtubeChannelId: channel.channelId,
            name: channel.name,
            avatarUrl: channel.avatarUrl,
            bannerUrl: channel.bannerUrl,
            subscriberCount: channel.subscriberCount,
            description: channel.description,
            videoCount: channel.videoCount,
            category: "General" as ChannelCategory,
            isFeatured: false,
            isFollowing: false,
            recentVideos: [],
          }));
          setSearchResults(mappedResults);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchChannelsAction]);

  // Auto-refresh videos when feed is empty but user has followed channels
  useEffect(() => {
    // Only attempt refresh if:
    // 1. User has followed channels loaded
    // 2. Feed is loaded but empty
    // 3. Haven't already attempted refresh
    // 4. Not currently refreshing
    if (
      followedChannels &&
      followedChannels.length > 0 &&
      videoFeed !== undefined &&
      videoFeed.videos.length === 0 &&
      !hasAttemptedRefresh &&
      !isRefreshingVideos
    ) {
      setIsRefreshingVideos(true);
      setHasAttemptedRefresh(true);

      // Pass channel data to the action
      const channelsData = followedChannels.map((ch) => ({
        youtubeChannelId: ch.youtubeChannelId,
        name: ch.name,
      }));

      refreshVideosAction({ channels: channelsData })
        .then((result) => {
          console.log("Video refresh result:", result);
        })
        .catch((error) => {
          console.error("Video refresh error:", error);
        })
        .finally(() => {
          setIsRefreshingVideos(false);
        });
    }
  }, [followedChannels, videoFeed, hasAttemptedRefresh, isRefreshingVideos, refreshVideosAction]);

  // Handler to manually refresh videos
  const handleRefreshVideos = useCallback(async () => {
    if (!followedChannels || followedChannels.length === 0) {
      return;
    }

    setIsRefreshingVideos(true);
    try {
      const channelsData = followedChannels.map((ch) => ({
        youtubeChannelId: ch.youtubeChannelId,
        name: ch.name,
      }));
      await refreshVideosAction({ channels: channelsData });
    } catch (error) {
      console.error("Video refresh error:", error);
    } finally {
      setIsRefreshingVideos(false);
    }
  }, [followedChannels, refreshVideosAction]);

  // Handlers
  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory((prev) =>
      prev === category.id ? null : category.id
    );
  }, []);

  const handleChannelPress = useCallback(
    (channelId: string) => {
      router.push(`/(app)/discover/channel/${channelId}`);
    },
    [router]
  );

  const handleFollow = useCallback(
    async (channel: ChannelData) => {
      try {
        await followChannel({
          youtubeChannelId: channel.youtubeChannelId,
          name: channel.name,
          avatarUrl: channel.avatarUrl,
          bannerUrl: channel.bannerUrl,
          subscriberCount: channel.subscriberCount,
          description: channel.description,
          videoCount: channel.videoCount,
          category: channel.category,
        });
      } catch (error) {
        console.error("Follow error:", error);
      }
    },
    [followChannel]
  );

  const handleUnfollow = useCallback(
    async (channelId: string) => {
      try {
        await unfollowChannel({
          channelId: channelId as any,
        });
      } catch (error) {
        console.error("Unfollow error:", error);
      }
    },
    [unfollowChannel]
  );

  const handleVideoPress = useCallback((video: FeedVideoData) => {
    setSelectedVideoId(video.videoId);
    setSelectedVideoTitle(video.title);
    setPlayerVisible(true);
  }, []);

  const handleSaveRecipe = useCallback(
    async (videoId: string) => {
      setPlayerVisible(false);
      setPreviewModalVisible(true);
      await extractFromVideoId(videoId);
    },
    [extractFromVideoId]
  );

  const handleSavePreview = useCallback(
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setFeedCursor(null);
    // Queries will auto-refetch
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (videoFeed?.hasMore && videoFeed?.nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      setFeedCursor(videoFeed.nextCursor);
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  }, [videoFeed, isLoadingMore]);

  // Loading state
  const isLoading = allChannels === undefined;
  const isFeedLoading = videoFeed === undefined;

  // Render video card
  const renderVideoCard = useCallback(
    ({ item }: { item: FeedVideoData }) => (
      <VideoCard
        video={item}
        viewMode={feedViewMode}
        onPress={() => handleVideoPress(item)}
        onSaveRecipe={() => handleSaveRecipe(item.videoId)}
      />
    ),
    [handleVideoPress, handleSaveRecipe, feedViewMode]
  );

  // Empty feed state
  const renderEmptyFeedState = () => {
    // If refreshing videos, show loading
    if (isRefreshingVideos) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-stone-500 dark:text-stone-400 mt-4">Loading videos from your channels...</Text>
        </View>
      );
    }

    // If user has followed channels but no videos, offer to refresh
    if (followedCount && followedCount > 0) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <View className="w-20 h-20 bg-stone-200 dark:bg-stone-800 rounded-full items-center justify-center mb-4">
            <Video size={40} color="#78716c" />
          </View>
          <Text className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Loading videos...
          </Text>
          <Text className="text-stone-500 dark:text-stone-400 text-center px-8 mb-6">
            Fetching latest videos from your {followedCount} followed channel{followedCount > 1 ? "s" : ""}
          </Text>
          <Pressable
            onPress={handleRefreshVideos}
            className="px-6 py-3 bg-orange-500 rounded-xl active:bg-orange-600"
          >
            <Text className="text-white font-semibold">Refresh Videos</Text>
          </Pressable>
        </View>
      );
    }

    // Default: no followed channels
    return (
      <View className="flex-1 items-center justify-center py-20">
        <View className="w-20 h-20 bg-stone-200 dark:bg-stone-800 rounded-full items-center justify-center mb-4">
          <Video size={40} color="#78716c" />
        </View>
        <Text className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
          No videos yet
        </Text>
        <Text className="text-stone-500 dark:text-stone-400 text-center px-8 mb-6">
          Follow some channels to see their latest videos here
        </Text>
        <Pressable
          onPress={() => setViewMode("channels")}
          className="px-6 py-3 bg-orange-500 rounded-xl active:bg-orange-600"
        >
          <Text className="text-white font-semibold">Browse Channels</Text>
        </Pressable>
      </View>
    );
  };

  // Footer for pagination
  const renderFeedFooter = useCallback(() => {
    if (!videoFeed?.hasMore) return null;

    return (
      <View className="py-4 items-center">
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#f97316" />
        ) : (
          <Pressable
            onPress={handleLoadMore}
            className="px-6 py-2 bg-stone-200 dark:bg-stone-800 rounded-lg active:bg-stone-300 dark:active:bg-stone-700"
          >
            <Text className="text-stone-600 dark:text-stone-400">Load More</Text>
          </Pressable>
        )}
      </View>
    );
  }, [videoFeed, isLoadingMore, handleLoadMore]);

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pb-4 pt-12">
        {/* Title Row */}
        <View className="flex-row items-center justify-between mb-4">
          <DigeroLogo width={100} height={44} />
          <View className="flex-row items-center gap-3">
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {followedCount ?? 0} following
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/settings")}
              className="rounded-full p-2 active:bg-stone-100 dark:active:bg-stone-800"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Settings size={24} color={isDark ? "#a8a29e" : "#57534e"} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search size={20} color="#78716c" />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search channels..."
            placeholderTextColor="#78716c"
            className="w-full pl-10 pr-4 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-900 dark:text-white"
          />
          {isSearching && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              <ActivityIndicator size="small" color="#f97316" />
            </View>
          )}
        </View>

        {/* View Toggle */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setViewMode("feed")}
            className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg ${
              viewMode === "feed"
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700"
            }`}
          >
            <Video
              size={18}
              color={viewMode === "feed" ? "#fff" : "#a8a29e"}
            />
            <Text
              className={`font-semibold ${
                viewMode === "feed" ? "text-white" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              Video Feed
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("channels")}
            className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg ${
              viewMode === "channels"
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700"
            }`}
          >
            <Users
              size={18}
              color={viewMode === "channels" ? "#fff" : "#a8a29e"}
            />
            <Text
              className={`font-semibold ${
                viewMode === "channels" ? "text-white" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              Channels
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {viewMode === "feed" ? (
        /* Video Feed View */
        isFeedLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <FlatList
            data={feedVideos}
            renderItem={renderVideoCard}
            keyExtractor={(item) => item.videoId}
            contentContainerClassName="p-4"
            ListHeaderComponent={
              feedVideos.length > 0 ? (
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-stone-500 dark:text-stone-400">
                    {feedVideos.length} video{feedVideos.length !== 1 ? "s" : ""}
                  </Text>
                  <View className="flex-row items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1">
                    <Pressable
                      onPress={() => setFeedViewMode("grid")}
                      className={`rounded-md p-2 ${
                        feedViewMode === "grid" ? "bg-orange-500" : ""
                      }`}
                    >
                      <LayoutGrid
                        size={16}
                        color={feedViewMode === "grid" ? "#fff" : "#a8a29e"}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setFeedViewMode("list")}
                      className={`rounded-md p-2 ${
                        feedViewMode === "list" ? "bg-orange-500" : ""
                      }`}
                    >
                      <List
                        size={16}
                        color={feedViewMode === "list" ? "#fff" : "#a8a29e"}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={renderEmptyFeedState}
            ListFooterComponent={renderFeedFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#f97316"
              />
            }
          />
        )
      ) : (
        /* Channels View */
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
            />
          }
        >
          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
            contentContainerClassName="gap-2"
          >
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={() => handleCategorySelect(category)}
              />
            ))}
          </ScrollView>

          {/* Channel Filter Tabs and View Toggle */}
          <View className="flex-row mx-4 mb-4 items-center gap-2">
            <View className="flex-row flex-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
              {[
                { id: "all" as const, label: "All" },
                {
                  id: "following" as const,
                  label: `Following (${followedCount ?? 0})`,
                },
                { id: "featured" as const, label: "Featured" },
              ].map((filter) => (
                <Pressable
                  key={filter.id}
                  onPress={() => setChannelFilter(filter.id)}
                  className={`flex-1 py-2 rounded-md ${
                    channelFilter === filter.id
                      ? "bg-white dark:bg-stone-700"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      channelFilter === filter.id
                        ? "text-stone-900 dark:text-white"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {/* View Mode Toggle */}
            <View className="flex-row items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1">
              <Pressable
                onPress={() => setChannelViewMode("grid")}
                className={`rounded-md p-2 ${
                  channelViewMode === "grid" ? "bg-orange-500" : ""
                }`}
              >
                <LayoutGrid
                  size={16}
                  color={channelViewMode === "grid" ? "#fff" : "#a8a29e"}
                />
              </Pressable>
              <Pressable
                onPress={() => setChannelViewMode("list")}
                className={`rounded-md p-2 ${
                  channelViewMode === "list" ? "bg-orange-500" : ""
                }`}
              >
                <List
                  size={16}
                  color={channelViewMode === "list" ? "#fff" : "#a8a29e"}
                />
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : searchQuery.trim() ? (
            /* Search Results */
            <View className="px-4 pb-6">
              <Text className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                {filteredChannels.length} Channel
                {filteredChannels.length !== 1 ? "s" : ""} Found
              </Text>
              {filteredChannels.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-stone-500 dark:text-stone-400">No channels found</Text>
                </View>
              ) : channelViewMode === "list" ? (
                <View>
                  {filteredChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      viewMode="list"
                      onPress={() => handleChannelPress(channel.id)}
                      onFollow={() => handleFollow(channel)}
                      onUnfollow={() => handleUnfollow(channel.id)}
                    />
                  ))}
                </View>
              ) : (
                <View className="flex-row flex-wrap -mx-2">
                  {filteredChannels.map((channel) => (
                    <View key={channel.id} className="w-1/2 p-2">
                      <ChannelCard
                        channel={channel}
                        viewMode="grid"
                        onPress={() => handleChannelPress(channel.id)}
                        onFollow={() => handleFollow(channel)}
                        onUnfollow={() => handleUnfollow(channel.id)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : channelFilter !== "all" || selectedCategory ? (
            /* Filtered Results */
            <View className="px-4 pb-6">
              <Text className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                {filteredChannels.length} Channel
                {filteredChannels.length !== 1 ? "s" : ""}
                {selectedCategory &&
                  ` in ${mapCategoryIdToName(selectedCategory)}`}
              </Text>
              {filteredChannels.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-stone-500 dark:text-stone-400">No channels found</Text>
                </View>
              ) : channelViewMode === "list" ? (
                <View>
                  {filteredChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      viewMode="list"
                      onPress={() => handleChannelPress(channel.id)}
                      onFollow={() => handleFollow(channel)}
                      onUnfollow={() => handleUnfollow(channel.id)}
                    />
                  ))}
                </View>
              ) : (
                <View className="flex-row flex-wrap -mx-2">
                  {filteredChannels.map((channel) => (
                    <View key={channel.id} className="w-1/2 p-2">
                      <ChannelCard
                        channel={channel}
                        viewMode="grid"
                        onPress={() => handleChannelPress(channel.id)}
                        onFollow={() => handleFollow(channel)}
                        onUnfollow={() => handleUnfollow(channel.id)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            /* Default View with Sections */
            <>
              {/* Spotlight Section */}
              {spotlightChannel && (
                <View className="pt-4">
                  <View className="flex-row items-center gap-2 px-4 mb-3">
                    <View className="w-1 h-5 bg-orange-500 rounded-full" />
                    <Text className="text-lg font-bold text-stone-900 dark:text-white">
                      Creator Spotlight
                    </Text>
                  </View>
                  <SpotlightCard
                    channel={spotlightChannel}
                    isPartner={spotlightIsPartner}
                    hasShop={spotlightHasShop}
                    onPress={() => handleChannelPress(spotlightChannel.id)}
                    onFollow={() => handleFollow(spotlightChannel)}
                    onUnfollow={() => handleUnfollow(spotlightChannel.id)}
                  />
                </View>
              )}

              {/* Featured Creators Section */}
              {featuredChannelsList.length > 0 && (
                <View className="px-4 mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Star size={20} color="#f97316" fill="#f97316" />
                    <Text className="text-lg font-bold text-stone-900 dark:text-white">
                      Featured Creators
                    </Text>
                  </View>
                  {channelViewMode === "list" ? (
                    <View>
                      {featuredChannelsList.map((channel) => (
                        <ChannelCard
                          key={channel.id}
                          channel={channel}
                          viewMode="list"
                          onPress={() => handleChannelPress(channel.id)}
                          onFollow={() => handleFollow(channel)}
                          onUnfollow={() => handleUnfollow(channel.id)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap -mx-2">
                      {featuredChannelsList.map((channel) => (
                        <View key={channel.id} className="w-1/2 p-2">
                          <ChannelCard
                            channel={channel}
                            viewMode="grid"
                            onPress={() => handleChannelPress(channel.id)}
                            onFollow={() => handleFollow(channel)}
                            onUnfollow={() => handleUnfollow(channel.id)}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Suggested for You Section */}
              <View className="px-4 pb-6">
                <View className="flex-row items-center gap-2 mb-4">
                  <ChefHat size={20} color="#a8a29e" />
                  <Text className="text-lg font-bold text-stone-900 dark:text-white">
                    Suggested for You
                  </Text>
                </View>
                {suggestedChannels.length === 0 ? (
                  <View className="items-center py-12">
                    <Text className="text-stone-500 dark:text-stone-400">
                      No suggestions available
                    </Text>
                  </View>
                ) : channelViewMode === "list" ? (
                  <View>
                    {suggestedChannels.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        viewMode="list"
                        onPress={() => handleChannelPress(channel.id)}
                        onFollow={() => handleFollow(channel)}
                        onUnfollow={() => handleUnfollow(channel.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="flex-row flex-wrap -mx-2">
                    {suggestedChannels.map((channel) => (
                      <View key={channel.id} className="w-1/2 p-2">
                        <ChannelCard
                          channel={channel}
                          viewMode="grid"
                          onPress={() => handleChannelPress(channel.id)}
                          onFollow={() => handleFollow(channel)}
                          onUnfollow={() => handleUnfollow(channel.id)}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Video Player Modal */}
      {selectedVideoId && (
        <VideoPlayerModal
          visible={playerVisible}
          videoId={selectedVideoId}
          videoTitle={selectedVideoTitle}
          onClose={() => {
            setPlayerVisible(false);
            setSelectedVideoId(null);
          }}
          onSaveRecipe={() => {
            if (selectedVideoId) {
              handleSaveRecipe(selectedVideoId);
            }
          }}
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
        onSave={handleSavePreview}
      />

      {/* Bottom Tab Bar */}
      <TabBar />
    </View>
  );
}
