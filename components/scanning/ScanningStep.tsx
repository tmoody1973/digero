/**
 * Scanning Step Component
 *
 * Camera viewfinder screen for scanning recipe pages.
 * Shows cover preview bar, camera viewfinder, and controls.
 */

import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Check } from "lucide-react-native";

import { CameraViewfinder } from "./CameraViewfinder";
import type { ScanningStepProps } from "./types";

/**
 * ScanningStep Component
 *
 * Features:
 * - Cover preview bar (if cover was captured)
 * - Camera viewfinder with frame overlay
 * - Recipe count indicator
 * - Done button to finish scanning
 */
export function ScanningStep({
  bookName,
  coverImageUrl,
  scannedRecipeCount,
  onCapture,
  onDone,
  isProcessing,
}: ScanningStepProps) {
  return (
    <View className="flex-1">
      {/* Cover Preview Bar */}
      {coverImageUrl && (
        <View className="flex-row items-center gap-3 border-b border-stone-800 bg-stone-900 px-4 py-3">
          <Image
            source={{ uri: coverImageUrl }}
            className="h-12 w-12 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-medium text-white" numberOfLines={1}>
              {bookName || "Untitled Cookbook"}
            </Text>
            <Text className="text-sm text-stone-400">
              {scannedRecipeCount} recipe{scannedRecipeCount !== 1 ? "s" : ""}{" "}
              scanned
            </Text>
          </View>
        </View>
      )}

      {/* No Cover - Simple Header */}
      {!coverImageUrl && bookName && (
        <View className="border-b border-stone-800 bg-stone-900 px-4 py-3">
          <Text className="font-medium text-white" numberOfLines={1}>
            {bookName}
          </Text>
          <Text className="text-sm text-stone-400">
            {scannedRecipeCount} recipe{scannedRecipeCount !== 1 ? "s" : ""}{" "}
            scanned
          </Text>
        </View>
      )}

      {/* Camera Viewfinder */}
      <View className="relative flex-1">
        <CameraViewfinder onCapture={onCapture} isProcessing={isProcessing} />

        {/* Done Button Overlay */}
        <View className="absolute bottom-28 left-0 right-0 flex-row justify-center">
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={onDone}
              disabled={isProcessing}
              className={`h-14 w-14 items-center justify-center rounded-full border-2 ${
                isProcessing
                  ? "border-stone-700 bg-stone-800"
                  : "border-stone-600 active:border-stone-400 active:bg-stone-800"
              }`}
            >
              <Check size={24} color={isProcessing ? "#57534e" : "#a8a29e"} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
