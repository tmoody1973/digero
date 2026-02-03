/**
 * Video Card Component
 *
 * Displays a YouTube video in the feed with thumbnail, duration,
 * channel info, view count, and save recipe button.
 */

import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Play, Plus } from "lucide-react-native";
import type { VideoCardProps } from "./types";

/**
 * Format view count for display
 */
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K views`;
  }
  return `${count} views`;
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

export function VideoCard({ video, onPress, onSaveRecipe }: VideoCardProps) {
  const handleSavePress = () => {
    onSaveRecipe?.();
  };

  return (
    <View className="mb-6">
      {/* Thumbnail Container */}
      <Pressable
        onPress={onPress}
        className="relative aspect-video rounded-xl overflow-hidden mb-3"
      >
        <Image
          source={{ uri: video.thumbnailUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Duration Badge */}
        <View className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">
            {video.duration}
          </Text>
        </View>

        {/* Play Button Overlay */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-14 h-14 bg-white/90 rounded-full items-center justify-center opacity-80">
            <View className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-stone-900 ml-1" />
          </View>
        </View>

        {/* Save Recipe Button */}
        <Pressable
          onPress={handleSavePress}
          className="absolute top-2 right-2 w-9 h-9 bg-orange-500 rounded-full items-center justify-center active:bg-orange-600 shadow-lg"
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </Pressable>

      {/* Video Info */}
      <View className="flex-row gap-3">
        {/* Channel Avatar */}
        {video.channelAvatarUrl ? (
          <Image
            source={{ uri: video.channelAvatarUrl }}
            className="w-9 h-9 rounded-full"
          />
        ) : (
          <View className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center">
            <Text className="text-white font-semibold text-sm">
              {getInitial(video.channelName)}
            </Text>
          </View>
        )}

        {/* Title and Meta */}
        <View className="flex-1">
          <Text
            className="font-semibold text-white text-sm leading-tight"
            numberOfLines={2}
          >
            {video.title}
          </Text>
          <Text className="text-stone-500 text-xs mt-1">
            {video.channelName}
          </Text>
          <Text className="text-stone-600 text-xs">
            {formatViewCount(video.viewCount)} - {formatTimeAgo(video.publishedAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}
