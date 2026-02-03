/**
 * YouTubeEmbed Component
 *
 * Embeds a YouTube video using react-native-youtube-iframe.
 */

import { useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { Play } from "lucide-react-native";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // For now, we'll use a simple WebView approach
  // In production, use react-native-youtube-iframe
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (hasError) {
    return (
      <View className="mt-6">
        <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
          Watch the Video
        </Text>
        <View className="aspect-video items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800">
          <Text className="text-stone-500 dark:text-stone-400">
            Unable to load video
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Watch the Video
      </Text>
      <Pressable
        className="aspect-video overflow-hidden rounded-2xl bg-stone-900"
        onPress={() => {
          // In a full implementation, this would open the video player
          // or expand to full-screen playback
        }}
      >
        {/* Thumbnail with play button overlay */}
        <View className="relative h-full w-full">
          {/* We would use Image component with the thumbnail */}
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <Play className="h-8 w-8 text-white" fill="white" />
            </View>
          </View>
        </View>
      </Pressable>
      {title && (
        <Text className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {title}
        </Text>
      )}
    </View>
  );
}
