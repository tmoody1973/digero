/**
 * Video Player Modal
 *
 * Modal component for in-app YouTube video playback.
 * Uses react-native-youtube-iframe for embedded playback when available.
 * Falls back to a placeholder with "Watch on YouTube" option.
 *
 * To enable full video playback, install:
 * npx expo install react-native-youtube-iframe react-native-webview
 */

import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { X, Bookmark, ExternalLink, Play, Pause } from "lucide-react-native";
import * as Linking from "expo-linking";

// Conditionally import YoutubePlayer if available
let YoutubePlayer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  YoutubePlayer = require("react-native-youtube-iframe").default;
} catch {
  // react-native-youtube-iframe not installed
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_WIDTH = SCREEN_WIDTH;
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

interface VideoPlayerModalProps {
  visible: boolean;
  videoId: string;
  videoTitle?: string;
  onClose: () => void;
  onSaveRecipe: () => void;
}

/**
 * VideoPlayerModal
 *
 * Displays a YouTube video in a modal with save recipe option.
 * Uses react-native-youtube-iframe for embedded playback.
 * Falls back to opening YouTube app/browser if iframe is not available.
 */
export function VideoPlayerModal({
  visible,
  videoId,
  videoTitle,
  onClose,
  onSaveRecipe,
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);

  const handleOpenInYouTube = useCallback(() => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url);
  }, [videoId]);

  const handleSaveRecipe = useCallback(() => {
    setIsPlaying(false);
    onSaveRecipe();
  }, [onSaveRecipe]);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setIsPlaying(false);
    }
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const togglePlaying = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // YouTube Player Placeholder (fallback)
  const YouTubePlayerPlaceholder = () => (
    <View
      style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}
      className="bg-black items-center justify-center"
    >
      <View className="items-center">
        <View className="w-20 h-20 bg-red-600 rounded-full items-center justify-center mb-4">
          <View className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] border-l-white ml-1" />
        </View>
        <Text className="text-white font-semibold text-lg mb-2">
          YouTube Video
        </Text>
        <Text className="text-stone-400 text-sm text-center px-8 mb-4">
          Install react-native-youtube-iframe for in-app playback
        </Text>
        <Pressable
          onPress={handleOpenInYouTube}
          className="flex-row items-center gap-2 bg-red-600 px-6 py-3 rounded-lg active:bg-red-700"
        >
          <ExternalLink size={18} color="#fff" />
          <Text className="text-white font-semibold">Watch on YouTube</Text>
        </Pressable>
      </View>
    </View>
  );

  // YouTube iframe player (when available)
  const YouTubeIframePlayer = () => {
    if (!YoutubePlayer) {
      return <YouTubePlayerPlaceholder />;
    }

    return (
      <View style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}>
        <YoutubePlayer
          ref={playerRef}
          height={PLAYER_HEIGHT}
          width={PLAYER_WIDTH}
          videoId={videoId}
          play={isPlaying}
          onChangeState={onStateChange}
          onReady={handleReady}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType:
              Platform.OS === "android" && Platform.Version <= 22
                ? "hardware"
                : "none",
          }}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-stone-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-stone-800">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-800"
          >
            <X size={24} color="#a8a29e" />
          </Pressable>
          <Text
            className="flex-1 text-white font-semibold text-center mx-4"
            numberOfLines={1}
          >
            {videoTitle || "Playing Video"}
          </Text>
          <View className="w-10" />
        </View>

        {/* Video Player */}
        <View className="bg-black">
          {YoutubePlayer ? <YouTubeIframePlayer /> : <YouTubePlayerPlaceholder />}
        </View>

        {/* Play/Pause Button (only when iframe is available) */}
        {YoutubePlayer && isReady && (
          <Pressable
            onPress={togglePlaying}
            className="flex-row items-center justify-center gap-2 mx-4 mt-4 py-2 bg-stone-800 rounded-lg active:bg-stone-700"
          >
            {isPlaying ? (
              <>
                <Pause size={18} color="#fff" />
                <Text className="text-white font-medium">Pause</Text>
              </>
            ) : (
              <>
                <Play size={18} color="#fff" />
                <Text className="text-white font-medium">Play</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Video Info & Actions */}
        <View className="flex-1 px-4 py-6">
          {videoTitle && (
            <Text className="text-white text-xl font-bold mb-4">
              {videoTitle}
            </Text>
          )}

          {/* Save Recipe Button */}
          <Pressable
            onPress={handleSaveRecipe}
            className="flex-row items-center justify-center gap-3 bg-orange-500 py-4 rounded-xl active:bg-orange-600"
          >
            <Bookmark size={24} color="#fff" />
            <Text className="text-white text-lg font-semibold">
              Save as Recipe
            </Text>
          </Pressable>

          <Text className="text-stone-500 text-sm text-center mt-4">
            Our AI will extract the recipe from this video
          </Text>

          {/* Open in YouTube */}
          <Pressable
            onPress={handleOpenInYouTube}
            className="flex-row items-center justify-center gap-2 mt-6 py-3 active:opacity-70"
          >
            <ExternalLink size={18} color="#78716c" />
            <Text className="text-stone-500">Open in YouTube</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
