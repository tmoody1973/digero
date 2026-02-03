/**
 * Channel Card Component
 *
 * Displays a YouTube channel card with avatar, name, description,
 * subscriber count, category tag, and follow button.
 */

import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Star, Check } from "lucide-react-native";
import type { ChannelCardProps } from "./types";

/**
 * Format subscriber count for display
 */
function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
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
      return "bg-green-500/20 text-green-500";
    case "Asian":
      return "bg-red-500/20 text-red-500";
    case "Quick Meals":
      return "bg-blue-500/20 text-blue-500";
    case "Baking":
      return "bg-amber-500/20 text-amber-500";
    case "Healthy":
      return "bg-emerald-500/20 text-emerald-500";
    case "BBQ & Grilling":
      return "bg-orange-500/20 text-orange-500";
    default:
      return "bg-stone-500/20 text-stone-400";
  }
}

export function ChannelCard({
  channel,
  onPress,
  onFollow,
  onUnfollow,
}: ChannelCardProps) {
  const handleFollowPress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (channel.isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden active:border-orange-500/50"
    >
      {/* Recent Videos Thumbnails - 3 stacked */}
      <View className="h-24 bg-stone-800 flex-row">
        {channel.recentVideos?.slice(0, 3).map((video, idx) => (
          <View
            key={video.videoId}
            className="flex-1"
            style={{ opacity: 1 - idx * 0.15 }}
          >
            <Image
              source={{ uri: video.thumbnailUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {idx === 0 && video.duration && (
              <View className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded">
                <Text className="text-white text-[10px] font-medium">
                  {video.duration}
                </Text>
              </View>
            )}
          </View>
        ))}
        {(!channel.recentVideos || channel.recentVideos.length < 3) &&
          Array(3 - (channel.recentVideos?.length || 0))
            .fill(0)
            .map((_, idx) => (
              <View key={`empty-${idx}`} className="flex-1 bg-stone-700" />
            ))}

        {/* Featured Badge */}
        {channel.isFeatured && (
          <View className="absolute top-2 left-2 flex-row items-center gap-1 bg-orange-500 px-2 py-0.5 rounded-full">
            <Star size={10} color="#fff" fill="#fff" />
            <Text className="text-white text-[10px] font-bold uppercase tracking-wide">
              Featured
            </Text>
          </View>
        )}
      </View>

      {/* Channel Info */}
      <View className="p-4">
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
          {channel.avatarUrl ? (
            <Image
              source={{ uri: channel.avatarUrl }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {getInitial(channel.name)}
              </Text>
            </View>
          )}

          {/* Name and Stats */}
          <View className="flex-1">
            <Text
              className="font-bold text-white"
              numberOfLines={1}
            >
              {channel.name}
            </Text>
            <Text className="text-stone-500 text-sm">
              {formatSubscriberCount(channel.subscriberCount)} subscribers
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          className="text-stone-400 text-sm mt-3"
          numberOfLines={2}
        >
          {channel.description}
        </Text>

        {/* Category Tag and Follow Button */}
        <View className="mt-3 flex-row items-center justify-between">
          <View
            className={`px-2 py-1 rounded-full ${getCategoryColor(
              channel.category
            )}`}
          >
            <Text className="text-xs font-medium">{channel.category}</Text>
          </View>

          {/* Follow Button */}
          <Pressable
            onPress={handleFollowPress}
            className={`px-4 py-1.5 rounded-full ${
              channel.isFollowing
                ? "bg-stone-700 active:bg-stone-600"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            {channel.isFollowing ? (
              <View className="flex-row items-center gap-1">
                <Check size={14} color="#a8a29e" />
                <Text className="text-stone-300 text-sm font-semibold">
                  Following
                </Text>
              </View>
            ) : (
              <Text className="text-white text-sm font-semibold">Follow</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
