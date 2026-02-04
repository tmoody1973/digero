/**
 * Video Player Modal
 *
 * Modal component for in-app YouTube video playback.
 * Uses react-native-youtube-iframe for embedded playback.
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
import YoutubePlayer from "react-native-youtube-iframe";

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
    setIsReady(false);
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

        {/* Play/Pause Button */}
        {isReady && (
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
