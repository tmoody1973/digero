/**
 * Cover Step Component
 *
 * Initial screen for cookbook scanning session.
 * Shows book icon, optional name input, and capture/skip options.
 * Matches the visual design from scan-session.png mockup.
 */

import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { BookOpen, Camera, ChevronRight } from "lucide-react-native";

import type { CoverStepProps } from "./types";

/**
 * CoverStep Component
 *
 * Features:
 * - Large book icon in amber container
 * - "Start with the Cover" heading
 * - Optional cookbook name input
 * - "Capture Cover Photo" primary button
 * - "Skip" option to proceed without cover
 */
export function CoverStep({
  bookName,
  onBookNameChange,
  onCaptureCover,
  onSkip,
}: CoverStepProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Book Icon */}
      <View className="mb-8 h-32 w-32 items-center justify-center rounded-3xl bg-amber-500/20">
        <BookOpen size={64} color="#f59e0b" />
      </View>

      {/* Heading */}
      <Text className="mb-2 text-2xl font-bold text-white">
        Start with the Cover
      </Text>
      <Text className="mb-8 max-w-sm text-center text-stone-400">
        Take a photo of your cookbook cover. This will help organize all recipes
        you scan from this book.
      </Text>

      {/* Cookbook Name Input */}
      <TextInput
        value={bookName}
        onChangeText={onBookNameChange}
        placeholder="Cookbook name (optional)"
        placeholderTextColor="#78716c"
        className="mb-6 w-full max-w-sm rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-white focus:border-orange-500"
      />

      {/* Capture Cover Photo Button */}
      <Pressable
        onPress={onCaptureCover}
        className="mb-4 flex-row items-center gap-3 rounded-2xl bg-orange-500 px-8 py-4 active:scale-95 active:bg-orange-600"
      >
        <Camera size={24} color="#fff" />
        <Text className="font-semibold text-white">Capture Cover Photo</Text>
      </Pressable>

      {/* Skip Option */}
      <Pressable
        onPress={onSkip}
        className="flex-row items-center gap-2 rounded-xl px-4 py-3 active:bg-stone-800"
      >
        <Text className="text-stone-400">Skip and start scanning</Text>
        <ChevronRight size={18} color="#a8a29e" />
      </Pressable>
    </View>
  );
}
