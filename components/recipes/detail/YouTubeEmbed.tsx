/**
 * YouTubeEmbed Component
 *
 * Shows a YouTube video thumbnail that opens the video when tapped.
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Play } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = imageError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePress = useCallback(async () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    await WebBrowser.openBrowserAsync(youtubeUrl);
  }, [videoId]);

  return (
    <View className="mt-6">
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Watch the Video
      </Text>
      <Pressable
        className="aspect-video overflow-hidden rounded-2xl bg-stone-900"
        onPress={handlePress}
      >
        <View className="relative h-full w-full">
          <Image
            source={{ uri: thumbnailUrl }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
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
