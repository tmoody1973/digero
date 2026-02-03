/**
 * Review Step Component
 *
 * Shows extraction summary after successful recipe scan.
 * Displays ingredient/instruction counts, edit option,
 * multi-page continue option, and next actions.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Check, Edit3, Plus, ArrowRight, BookOpen } from "lucide-react-native";

import type { ReviewStepProps } from "./types";

/**
 * ReviewStep Component
 *
 * Features:
 * - Success indicator with checkmark
 * - Recipe title from extraction
 * - Ingredient and instruction counts in styled boxes
 * - "Edit Details" button
 * - "This recipe continues" for multi-page
 * - "Scan Another Recipe" secondary CTA
 * - "Done Scanning" primary CTA
 * - Previously scanned recipes list
 */
export function ReviewStep({
  recipe,
  isMultiPage,
  pageCount,
  scannedRecipes,
  onEditDetails,
  onContinueRecipe,
  onScanAnother,
  onDoneScanning,
}: ReviewStepProps) {
  return (
    <ScrollView className="flex-1 p-6">
      {/* Success Header */}
      <View className="mb-6 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
          <Check size={24} color="#22c55e" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">Recipe Extracted!</Text>
          <Text className="text-sm text-stone-400">
            {isMultiPage ? `Page ${pageCount} scanned` : "Review the details below"}
          </Text>
        </View>
      </View>

      {/* Extracted Recipe Preview */}
      <View className="mb-6 rounded-2xl border border-stone-700 bg-stone-800 p-4">
        {/* Title */}
        <Text className="mb-4 text-xl font-semibold text-white">
          {recipe.title}
        </Text>

        {/* Stats */}
        <View className="flex-row gap-4">
          <View className="rounded-xl bg-stone-700 px-4 py-2">
            <Text className="text-2xl font-bold text-orange-500">
              {recipe.ingredients.length}
            </Text>
            <Text className="text-sm text-stone-400">Ingredients</Text>
          </View>
          <View className="rounded-xl bg-stone-700 px-4 py-2">
            <Text className="text-2xl font-bold text-orange-500">
              {recipe.instructions.length}
            </Text>
            <Text className="text-sm text-stone-400">Steps</Text>
          </View>
          {(recipe.prepTime > 0 || recipe.cookTime > 0) && (
            <View className="rounded-xl bg-stone-700 px-4 py-2">
              <Text className="text-2xl font-bold text-orange-500">
                {recipe.prepTime + recipe.cookTime}
              </Text>
              <Text className="text-sm text-stone-400">min</Text>
            </View>
          )}
        </View>

        {/* Page Number */}
        {recipe.pageNumber && (
          <View className="mt-3 flex-row items-center gap-2">
            <BookOpen size={14} color="#78716c" />
            <Text className="text-sm text-stone-500">
              Page {recipe.pageNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Edit Button */}
      <Pressable
        onPress={onEditDetails}
        className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border border-stone-700 py-3 active:bg-stone-800"
      >
        <Edit3 size={18} color="#a8a29e" />
        <Text className="font-medium text-stone-300">Edit Details</Text>
      </Pressable>

      {/* Multi-Page Continue Option */}
      <Pressable
        onPress={onContinueRecipe}
        className="mb-4 flex-row items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 active:bg-amber-500/20"
      >
        <View className="flex-row items-center gap-3">
          <ArrowRight size={18} color="#f59e0b" />
          <Text className="font-medium text-amber-500">
            This recipe continues...
          </Text>
        </View>
        <Text className="text-sm text-amber-500/70">
          Scan next page
        </Text>
      </Pressable>

      {/* Previously Scanned */}
      {scannedRecipes.length > 0 && (
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-stone-400">
            Previously scanned ({scannedRecipes.length})
          </Text>
          <View className="gap-2">
            {scannedRecipes.map((r) => (
              <View
                key={r._id}
                className="flex-row items-center gap-3 rounded-xl bg-stone-800/50 px-3 py-2"
              >
                <Check size={16} color="#22c55e" />
                <Text className="flex-1 text-stone-300" numberOfLines={1}>
                  {r.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-auto gap-3 pb-6">
        <Pressable
          onPress={onScanAnother}
          className="flex-row items-center justify-center gap-2 rounded-2xl border-2 border-orange-500 bg-orange-500/10 py-4 active:bg-orange-500/20"
        >
          <Plus size={20} color="#f97316" />
          <Text className="font-semibold text-orange-500">
            Scan Another Recipe
          </Text>
        </Pressable>

        <Pressable
          onPress={onDoneScanning}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
        >
          <Check size={20} color="#fff" />
          <Text className="font-semibold text-white">Done Scanning</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
