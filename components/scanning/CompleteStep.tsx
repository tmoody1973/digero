/**
 * Complete Step Component
 *
 * Session summary screen shown when scanning is complete.
 * Displays success indicator, cookbook cover, and list of scanned recipes.
 */

import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { Check, ChevronRight, RotateCcw } from "lucide-react-native";

import type { CompleteStepProps } from "./types";

/**
 * CompleteStep Component
 *
 * Features:
 * - Large green checkmark
 * - "Scanning Complete!" heading
 * - Recipe count summary
 * - Cover image with gradient overlay
 * - List of scanned recipes
 * - "Scan More from This Book" secondary action
 * - "Done" primary CTA
 */
export function CompleteStep({
  bookName,
  coverImageUrl,
  scannedRecipes,
  onScanMore,
  onDone,
}: CompleteStepProps) {
  return (
    <ScrollView className="flex-1 p-6">
      {/* Success Header */}
      <View className="mb-8 items-center text-center">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <Check size={40} color="#22c55e" />
        </View>
        <Text className="mb-2 text-2xl font-bold text-white">
          Scanning Complete!
        </Text>
        <Text className="text-stone-400">
          {scannedRecipes.length} recipe
          {scannedRecipes.length !== 1 ? "s" : ""} added from{" "}
          <Text className="font-medium text-white">
            {bookName || "your cookbook"}
          </Text>
        </Text>
      </View>

      {/* Cover and Recipes Summary */}
      <View className="mb-6 overflow-hidden rounded-2xl border border-stone-700 bg-stone-800">
        {/* Cover Image */}
        {coverImageUrl && (
          <View className="relative aspect-[3/1] overflow-hidden">
            <Image
              source={{ uri: coverImageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
            {/* Gradient Overlay */}
            <View className="absolute inset-0 bg-gradient-to-t from-stone-800 to-transparent" />
            {/* Cookbook Name */}
            <View className="absolute bottom-3 left-4">
              <Text className="font-semibold text-white">
                {bookName || "Untitled Cookbook"}
              </Text>
            </View>
          </View>
        )}

        {/* No Cover Header */}
        {!coverImageUrl && bookName && (
          <View className="border-b border-stone-700 px-4 py-3">
            <Text className="font-semibold text-white">{bookName}</Text>
          </View>
        )}

        {/* Scanned Recipes List */}
        <View className="divide-y divide-stone-700">
          {scannedRecipes.map((recipe) => (
            <View
              key={recipe._id}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-1 flex-row items-center gap-3">
                <Check size={16} color="#22c55e" />
                <Text className="flex-1 text-white" numberOfLines={1}>
                  {recipe.title}
                </Text>
              </View>
              <Text className="text-sm text-stone-500">
                {recipe.ingredientCount} ing.
              </Text>
            </View>
          ))}

          {/* Empty State */}
          {scannedRecipes.length === 0 && (
            <View className="px-4 py-6">
              <Text className="text-center text-stone-500">
                No recipes scanned in this session
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mt-auto gap-3 pb-6">
        <Pressable
          onPress={onScanMore}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-stone-700 py-4 active:bg-stone-800"
        >
          <RotateCcw size={20} color="#d6d3d1" />
          <Text className="font-semibold text-stone-300">
            Scan More from This Book
          </Text>
        </Pressable>

        <Pressable
          onPress={onDone}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
        >
          <Text className="font-semibold text-white">Done</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
