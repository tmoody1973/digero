/**
 * Channel Detail Screen
 *
 * Displays a YouTube channel's profile with header, stats, and latest videos.
 * Includes follow/unfollow functionality and video extraction.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  Star,
  Check,
  Plus,
  Play,
  Store,
  ShoppingBag,
  Award,
  Sparkles,
  Lock,
  ChefHat,
  Youtube,
  ExternalLink,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Id } from "@/convex/_generated/dataModel";

import {
  VideoPlayerModal,
  YouTubeRecipePreviewModal,
  useYouTubeExtraction,
  type ChannelCategory,
} from "@/components/discover";

/**
 * Video data from channel
 */
interface ChannelVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

/**
 * Format subscriber count for display
 */
function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M subscribers`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K subscribers`;
  }
  return `${count} subscribers`;
}

/**
 * Format view count for display
 */
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

/**
 * Format time ago from ISO date string
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get first letter for avatar fallback
 */
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Get category badge color
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case "Italian":
      return "bg-green-500";
    case "Asian":
      return "bg-red-500";
    case "Quick Meals":
      return "bg-blue-500";
    case "Baking":
      return "bg-amber-500";
    case "Healthy":
      return "bg-emerald-500";
    case "BBQ & Grilling":
      return "bg-orange-600";
    default:
      return "bg-stone-500";
  }
}

/**
 * Channel data structure for both DB and API channels
 */
interface ChannelDisplayData {
  _id?: Id<"youtubeChannels">;
  youtubeChannelId: string;
  name: string;
  avatarUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  description: string;
  videoCount: number;
  category: string;
  isFeatured: boolean;
  isFollowing: boolean;
}

/**
 * Product type for shop display
 */
interface CreatorProduct {
  _id: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
  price: number;
  memberDiscount: number;
  isFeatured: boolean;
}

/**
 * Tab type for channel content
 */
type ChannelTab = "videos" | "exclusive" | "shop";

export default function ChannelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Tab state
  const [activeTab, setActiveTab] = useState<ChannelTab>("videos");

  // State
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // State for channels fetched from YouTube API (not in database)
  const [apiChannel, setApiChannel] = useState<ChannelDisplayData | null>(null);
  const [isLoadingApiChannel, setIsLoadingApiChannel] = useState(false);
  const [apiChannelError, setApiChannelError] = useState<string | null>(null);

  // Video player state
  const [playerVisible, setPlayerVisible] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");

  // Extraction state
  const {
    state: extractionState,
    extractFromVideoId,
    reset: resetExtraction,
  } = useYouTubeExtraction();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Determine if ID is a Convex ID or YouTube channel ID
  // Convex IDs are longer and contain specific patterns
  const isConvexId = id && id.length > 20 && !id.startsWith("UC");

  // Convex queries and mutations - use appropriate query based on ID type
  const channelByConvexId = useQuery(
    api.channels.getChannelById,
    isConvexId ? { channelId: id as Id<"youtubeChannels"> } : "skip"
  );
  const channelByYoutubeId = useQuery(
    api.channels.getChannelByYoutubeId,
    !isConvexId ? { youtubeChannelId: id } : "skip"
  );

  // Use whichever query returned data
  const dbChannel = isConvexId ? channelByConvexId : channelByYoutubeId;
  const followChannel = useMutation(api.channels.followChannel);
  const unfollowChannel = useMutation(api.channels.unfollowChannel);
  const saveFromYouTube = useMutation(api.recipes.saveFromYouTube);

  // Query creator profile to check partnership status
  const youtubeChannelId = dbChannel?.youtubeChannelId || (!isConvexId ? id : undefined);
  const creatorProfile = useQuery(
    api.creator.getCreatorByChannel,
    youtubeChannelId ? { youtubeChannelId } : "skip"
  );

  // Query creator's products if they're an approved creator
  const creatorProducts = useQuery(
    api.creatorShop.getProducts,
    creatorProfile?._id ? { creatorId: creatorProfile._id } : "skip"
  );

  // Check if creator is a partner (tier === "partner" and approved)
  const isPartner = creatorProfile?.tier === "partner" && creatorProfile?.applicationStatus === "approved";
  const isApprovedCreator = creatorProfile?.applicationStatus === "approved";
  const hasShop = isApprovedCreator && creatorProducts && creatorProducts.length > 0;

  // Debug logging for creator profile (remove in production)
  console.log("[Channel] Creator Profile Query:", {
    youtubeChannelId,
    creatorProfile: creatorProfile ? {
      tier: creatorProfile.tier,
      status: creatorProfile.applicationStatus,
      channelName: creatorProfile.channelName,
    } : null,
    isPartner,
    hasShop,
    productsCount: creatorProducts?.length || 0,
  });

  // Action to fetch channel from YouTube API
  const fetchChannelData = useAction(
    api.actions.youtube.fetchChannelData.fetchChannelData
  );

  // Convex actions
  const getChannelVideos = useAction(
    api.actions.youtube.fetchChannelData.getChannelVideos
  );

  // Determine the channel to display (from DB or API)
  const channel: ChannelDisplayData | null | undefined = dbChannel ?? apiChannel;

  // Fetch channel from YouTube API if not in database
  useEffect(() => {
    // Only fetch from API if:
    // 1. It's a YouTube channel ID (starts with UC)
    // 2. DB query has completed (not undefined)
    // 3. Channel not found in DB (null)
    // 4. We haven't already fetched or aren't loading
    if (
      !isConvexId &&
      id?.startsWith("UC") &&
      dbChannel === null &&
      !apiChannel &&
      !isLoadingApiChannel &&
      !apiChannelError
    ) {
      setIsLoadingApiChannel(true);
      fetchChannelData({ channelId: id })
        .then((result) => {
          if (result.success && result.data) {
            setApiChannel({
              youtubeChannelId: result.data.channelId,
              name: result.data.name,
              avatarUrl: result.data.avatarUrl,
              subscriberCount: result.data.subscriberCount,
              description: result.data.description,
              videoCount: result.data.videoCount,
              category: "General",
              isFeatured: false,
              isFollowing: false,
            });
          } else {
            setApiChannelError(result.error?.message || "Channel not found");
          }
        })
        .catch((err) => {
          console.error("Error fetching channel from API:", err);
          setApiChannelError("Failed to load channel");
        })
        .finally(() => {
          setIsLoadingApiChannel(false);
        });
    }
  }, [id, isConvexId, dbChannel, apiChannel, isLoadingApiChannel, apiChannelError, fetchChannelData]);

  // Fetch videos when channel data is available
  useEffect(() => {
    if (channel?.youtubeChannelId) {
      fetchVideos();
    }
  }, [channel?.youtubeChannelId]);

  const fetchVideos = useCallback(async () => {
    if (!channel?.youtubeChannelId) return;

    setIsLoadingVideos(true);
    setVideoError(null);

    try {
      const result = await getChannelVideos({
        channelId: channel.youtubeChannelId,
        maxResults: 20,
      });

      if (result.success && result.data) {
        setVideos(result.data);
      } else {
        setVideoError(result.error?.message || "Failed to load videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideoError("YouTube API error. Check if API key is configured.");
    } finally {
      setIsLoadingVideos(false);
    }
  }, [channel?.youtubeChannelId, getChannelVideos]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFollow = useCallback(async () => {
    if (!channel) return;

    try {
      await followChannel({
        youtubeChannelId: channel.youtubeChannelId,
        name: channel.name,
        avatarUrl: channel.avatarUrl,
        subscriberCount: channel.subscriberCount,
        description: channel.description,
        videoCount: channel.videoCount,
        category: channel.category as ChannelCategory,
      });
    } catch (error) {
      console.error("Follow error:", error);
    }
  }, [channel, followChannel]);

  const handleUnfollow = useCallback(async () => {
    if (!channel || !channel._id) return;

    try {
      await unfollowChannel({
        channelId: channel._id,
      });
    } catch (error) {
      console.error("Unfollow error:", error);
    }
  }, [channel, unfollowChannel]);

  const handleVideoPress = useCallback((video: ChannelVideo) => {
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
    await fetchVideos();
    setIsRefreshing(false);
  }, [fetchVideos]);

  /**
   * Open YouTube channel with subscription confirmation
   * Uses deep linking to open YouTube app if installed, otherwise opens in browser
   */
  const handleSubscribeOnYouTube = useCallback(async () => {
    if (!channel?.youtubeChannelId) return;

    // YouTube subscribe URL with confirmation prompt
    const youtubeUrl = `https://www.youtube.com/channel/${channel.youtubeChannelId}?sub_confirmation=1`;

    try {
      // Try to open in YouTube app first, falls back to browser
      const canOpen = await Linking.canOpenURL(youtubeUrl);
      if (canOpen) {
        await Linking.openURL(youtubeUrl);
      }
    } catch (error) {
      console.error("Error opening YouTube:", error);
    }
  }, [channel?.youtubeChannelId]);

  // Loading state - wait for DB query and potentially API fetch
  const isLoading =
    (isConvexId && channelByConvexId === undefined) ||
    (!isConvexId && channelByYoutubeId === undefined) ||
    isLoadingApiChannel;

  if (isLoading) {
    return (
      <View className="flex-1 bg-stone-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-stone-400 mt-4">Loading channel...</Text>
      </View>
    );
  }

  // Not found state - only show if DB query returned null AND API fetch failed/returned null
  const notFound =
    channel === null ||
    (channel === undefined && apiChannelError);

  if (notFound) {
    return (
      <SafeAreaView className="flex-1 bg-stone-950" edges={["top"]}>
        <View className="flex-row items-center px-4 py-3 border-b border-stone-800">
          <Pressable onPress={handleBack} className="p-2 -m-2">
            <ArrowLeft size={24} color="#fff" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-white text-lg font-semibold mb-2">
            Channel Not Found
          </Text>
          <Text className="text-stone-400 text-center mb-6">
            {apiChannelError || "This channel may have been removed or is no longer available."}
          </Text>
          <Pressable
            onPress={handleBack}
            className="px-6 py-3 bg-orange-500 rounded-xl active:bg-orange-600"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Safety check - should not reach here if channel is null/undefined
  if (!channel) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-950" edges={["top"]}>
      {/* Header Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-stone-800">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-stone-800 -ml-2"
        >
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-white ml-2" numberOfLines={1}>
          {channel.name}
        </Text>
      </View>

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
        {/* Banner Image */}
        {channel.bannerUrl && (
          <View className="w-full aspect-[6/1] overflow-hidden">
            <Image
              source={{ uri: channel.bannerUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Channel Info Card */}
        <View className="m-4 bg-stone-900 rounded-2xl p-6 border border-stone-800">
          <View className="flex-row items-start gap-4">
            {/* Avatar */}
            {channel.avatarUrl && !channel.avatarUrl.includes("ui-avatars") ? (
              <Image
                source={{ uri: channel.avatarUrl }}
                className="w-20 h-20 rounded-2xl"
              />
            ) : (
              <View className="w-20 h-20 rounded-2xl bg-orange-500 items-center justify-center">
                <Text className="text-white font-bold text-3xl">
                  {getInitial(channel.name)}
                </Text>
              </View>
            )}

            {/* Info */}
            <View className="flex-1">
              {/* Name and Badges */}
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-xl font-bold text-white">
                  {channel.name}
                </Text>
                {isPartner && (
                  <View className="flex-row items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    <Award size={12} color="#a855f7" />
                    <Text className="text-purple-400 text-xs font-bold">
                      Partner
                    </Text>
                  </View>
                )}
                {channel.isFeatured && (
                  <View className="flex-row items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded-full">
                    <Star size={12} color="#f97316" fill="#f97316" />
                    <Text className="text-orange-500 text-xs font-bold">
                      Featured
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View className="flex-row items-center gap-4 mt-2">
                <Text className="text-stone-400 text-sm">
                  {formatSubscriberCount(channel.subscriberCount)}
                </Text>
                <Text className="text-stone-600">|</Text>
                <Text className="text-stone-400 text-sm">
                  {channel.videoCount} videos
                </Text>
              </View>

              {/* Category */}
              <View
                className={`self-start mt-2 px-2 py-0.5 rounded-full ${getCategoryColor(channel.category)}`}
              >
                <Text className="text-white text-xs font-medium">
                  {channel.category}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text className="text-stone-400 mt-4" numberOfLines={3}>
            {channel.description}
          </Text>

          {/* Action Buttons */}
          <View className="mt-4 flex-row gap-3">
            {/* Follow Button */}
            <Pressable
              onPress={channel.isFollowing ? handleUnfollow : handleFollow}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
                channel.isFollowing
                  ? "bg-stone-800 active:bg-stone-700"
                  : "bg-orange-500 active:bg-orange-600"
              }`}
            >
              {channel.isFollowing ? (
                <>
                  <Check size={20} color="#a8a29e" />
                  <Text className="text-stone-300 font-semibold">
                    Following
                  </Text>
                </>
              ) : (
                <>
                  <Plus size={20} color="#fff" />
                  <Text className="text-white font-semibold">Follow</Text>
                </>
              )}
            </Pressable>

            {/* YouTube Subscribe Button */}
            <Pressable
              onPress={handleSubscribeOnYouTube}
              className="flex-row items-center justify-center gap-2 px-4 py-3 bg-red-600 rounded-xl active:bg-red-700"
            >
              <Youtube size={20} color="#fff" />
              <Text className="text-white font-semibold">Subscribe</Text>
              <ExternalLink size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Tab Bar - Show if creator is approved (has exclusive content or shop) */}
        {isApprovedCreator && (
          <View className="flex-row mx-4 mb-4 bg-stone-800 rounded-xl p-1">
            <Pressable
              onPress={() => setActiveTab("videos")}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${
                activeTab === "videos" ? "bg-stone-700" : ""
              }`}
            >
              <Play size={14} color={activeTab === "videos" ? "#f97316" : "#a8a29e"} />
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "videos" ? "text-orange-500" : "text-stone-400"
                }`}
              >
                Videos
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("exclusive")}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${
                activeTab === "exclusive" ? "bg-stone-700" : ""
              }`}
            >
              <Sparkles size={14} color={activeTab === "exclusive" ? "#f97316" : "#a8a29e"} />
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "exclusive" ? "text-orange-500" : "text-stone-400"
                }`}
              >
                Exclusive
              </Text>
            </Pressable>
            {hasShop && (
              <Pressable
                onPress={() => setActiveTab("shop")}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${
                  activeTab === "shop" ? "bg-stone-700" : ""
                }`}
              >
                <Store size={14} color={activeTab === "shop" ? "#f97316" : "#a8a29e"} />
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === "shop" ? "text-orange-500" : "text-stone-400"
                  }`}
                >
                  Shop
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Videos Section */}
        {(!isApprovedCreator || activeTab === "videos") && (
        <View className="px-4 pb-6">
          <Text className="text-lg font-bold text-white mb-4">
            Latest Videos
          </Text>

          {isLoadingVideos ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-stone-400 mt-2">Loading videos...</Text>
            </View>
          ) : videoError ? (
            <View className="items-center py-12 px-4">
              <Text className="text-stone-400 text-center">{videoError}</Text>
              <Text className="text-stone-500 text-sm text-center mt-2">
                Channel ID: {channel.youtubeChannelId}
              </Text>
              <Pressable
                onPress={fetchVideos}
                className="mt-4 px-4 py-2 bg-stone-800 rounded-lg"
              >
                <Text className="text-stone-300">Retry</Text>
              </Pressable>
            </View>
          ) : videos.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-stone-400">No videos yet</Text>
              <Text className="text-stone-500 text-sm mt-1">
                Videos will appear once YouTube API is configured
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap -mx-2">
              {videos.map((video) => (
                <View key={video.videoId} className="w-1/2 p-2">
                  <Pressable
                    onPress={() => handleVideoPress(video)}
                    className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800 active:border-orange-500/50"
                  >
                    {/* Thumbnail */}
                    <View className="relative aspect-video">
                      <Image
                        source={{ uri: video.thumbnailUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {/* Duration Badge */}
                      <View className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded">
                        <Text className="text-white text-[10px] font-medium">
                          {video.duration}
                        </Text>
                      </View>
                      {/* Play Overlay */}
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-10 h-10 bg-white/90 rounded-full items-center justify-center opacity-0 active:opacity-80">
                          <Play size={16} color="#1c1917" />
                        </View>
                      </View>
                      {/* Save Recipe Button */}
                      <Pressable
                        onPress={() => handleSaveRecipe(video.videoId)}
                        className="absolute top-1 right-1 w-7 h-7 bg-orange-500 rounded-full items-center justify-center active:bg-orange-600"
                      >
                        <Plus size={14} color="#fff" />
                      </Pressable>
                    </View>

                    {/* Video Info */}
                    <View className="p-2">
                      <Text
                        className="text-white text-sm font-medium"
                        numberOfLines={2}
                      >
                        {video.title}
                      </Text>
                      <Text className="text-stone-500 text-xs mt-1">
                        {formatViewCount(video.viewCount)} views -{" "}
                        {formatTimeAgo(video.publishedAt)}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
        )}

        {/* Exclusive Recipes Section */}
        {isApprovedCreator && activeTab === "exclusive" && (
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#f97316" />
                <Text className="text-lg font-bold text-white">
                  Exclusive Recipes
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full">
                <Lock size={12} color="#a855f7" />
                <Text className="text-purple-400 text-xs font-medium">
                  Plus Members
                </Text>
              </View>
            </View>

            {/* Exclusive Recipe Cards - Placeholder for now */}
            <View className="gap-3">
              {/* Sample exclusive recipe cards */}
              {[
                {
                  id: "1",
                  title: "Secret Family Schnitzel",
                  description: "My grandmother's authentic recipe with a modern twist",
                  prepTime: 25,
                  cookTime: 15,
                  isLocked: true,
                },
                {
                  id: "2",
                  title: "Perfect Israeli Salad",
                  description: "The technique that makes all the difference",
                  prepTime: 15,
                  cookTime: 0,
                  isLocked: true,
                },
                {
                  id: "3",
                  title: "Chocolate Babka Masterclass",
                  description: "Step-by-step guide to the perfect swirl",
                  prepTime: 45,
                  cookTime: 35,
                  isLocked: true,
                },
              ].map((recipe) => (
                <Pressable
                  key={recipe.id}
                  className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800 active:border-orange-500/50"
                >
                  <View className="flex-row">
                    {/* Recipe Image Placeholder */}
                    <View className="w-28 h-28 bg-gradient-to-br from-orange-500/20 to-purple-500/20 items-center justify-center">
                      <ChefHat size={32} color="#a855f7" />
                      {recipe.isLocked && (
                        <View className="absolute top-2 right-2 bg-purple-500 p-1 rounded-full">
                          <Lock size={10} color="#fff" />
                        </View>
                      )}
                    </View>

                    {/* Recipe Info */}
                    <View className="flex-1 p-3 justify-between">
                      <View>
                        <Text className="text-white font-semibold" numberOfLines={1}>
                          {recipe.title}
                        </Text>
                        <Text className="text-stone-400 text-xs mt-0.5" numberOfLines={2}>
                          {recipe.description}
                        </Text>
                      </View>

                      {/* Time info */}
                      <View className="flex-row items-center gap-3 mt-2">
                        {recipe.prepTime > 0 && (
                          <Text className="text-stone-500 text-xs">
                            Prep: {recipe.prepTime}m
                          </Text>
                        )}
                        {recipe.cookTime > 0 && (
                          <Text className="text-stone-500 text-xs">
                            Cook: {recipe.cookTime}m
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Upgrade CTA */}
            <View className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-xl border border-purple-500/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={16} color="#a855f7" />
                <Text className="text-purple-400 font-semibold">
                  Unlock Exclusive Content
                </Text>
              </View>
              <Text className="text-stone-400 text-sm mb-3">
                Subscribe to Digero Plus to access {channel.name}'s exclusive recipes, cooking tips, and behind-the-scenes content.
              </Text>
              <Pressable className="bg-purple-500 py-2.5 rounded-lg items-center active:bg-purple-600">
                <Text className="text-white font-semibold">
                  Upgrade to Plus - $4.99/mo
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Shop Section */}
        {hasShop && activeTab === "shop" && (
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-white">
                {channel.name}'s Shop
              </Text>
              {isPartner && (
                <View className="flex-row items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                  <ShoppingBag size={12} color="#22c55e" />
                  <Text className="text-green-400 text-xs font-medium">
                    Member Discounts
                  </Text>
                </View>
              )}
            </View>

            {creatorProducts && creatorProducts.length > 0 ? (
              <View className="gap-3">
                {creatorProducts.map((product: CreatorProduct) => (
                  <Pressable
                    key={product._id}
                    onPress={() => router.push(`/(app)/discover/product/${product._id}`)}
                    className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800 active:border-orange-500/50"
                  >
                    <View className="flex-row">
                      {/* Product Image */}
                      <Image
                        source={{ uri: product.imageUrl }}
                        className="w-28 h-28"
                        resizeMode="cover"
                      />

                      {/* Product Info */}
                      <View className="flex-1 p-3 justify-between">
                        <View>
                          {/* Type Badge */}
                          <View className="flex-row items-center gap-2 mb-1">
                            <View className="bg-stone-800 px-2 py-0.5 rounded">
                              <Text className="text-stone-400 text-[10px] uppercase font-semibold">
                                {product.type}
                              </Text>
                            </View>
                            {product.isFeatured && (
                              <View className="bg-orange-500/20 px-2 py-0.5 rounded">
                                <Text className="text-orange-400 text-[10px] font-semibold">
                                  Featured
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Name */}
                          <Text
                            className="text-white font-semibold"
                            numberOfLines={2}
                          >
                            {product.name}
                          </Text>

                          {/* Description */}
                          <Text
                            className="text-stone-400 text-xs mt-0.5"
                            numberOfLines={1}
                          >
                            {product.description}
                          </Text>
                        </View>

                        {/* Pricing */}
                        <View className="flex-row items-center gap-2 mt-2">
                          <Text className="text-white font-bold">
                            ${((product.price * (100 - product.memberDiscount)) / 10000).toFixed(2)}
                          </Text>
                          {product.memberDiscount > 0 && (
                            <>
                              <Text className="text-stone-500 text-sm line-through">
                                ${(product.price / 100).toFixed(2)}
                              </Text>
                              <View className="bg-green-500/20 px-1.5 py-0.5 rounded">
                                <Text className="text-green-400 text-xs font-semibold">
                                  {product.memberDiscount}% off
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="items-center py-12">
                <Store size={48} color="#57534e" />
                <Text className="text-stone-400 mt-4">No products available</Text>
                <Text className="text-stone-500 text-sm mt-1">
                  Check back later for exclusive items
                </Text>
              </View>
            )}

            {/* Member Benefits Note */}
            <View className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-xl border border-purple-500/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Award size={16} color="#a855f7" />
                <Text className="text-purple-400 font-semibold">
                  Member Benefits
                </Text>
              </View>
              <Text className="text-stone-400 text-sm">
                Subscribe to Digero Plus or Creator tier to unlock exclusive discounts on all partner shops.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

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
    </SafeAreaView>
  );
}
