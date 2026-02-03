/**
 * RecipeCard Component
 *
 * Displays a recipe in either grid or list view mode.
 * Includes favorite toggle with optimistic UI update.
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Clock, Heart, ChevronRight } from "lucide-react-native";
import { useMutation } from "convex/react";
import { useColorScheme } from "nativewind";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SourceBadge } from "./SourceBadge";
import type { ViewMode } from "./ViewModeToggle";

type RecipeSource = "youtube" | "website" | "scanned" | "manual";

interface Recipe {
  _id: Id<"recipes">;
  title: string;
  source: RecipeSource;
  imageUrl: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  isFavorited: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  physicalCookbook?: {
    name: string;
  } | null;
}

interface RecipeCardProps {
  recipe: Recipe;
  viewMode: ViewMode;
  onPress: () => void;
}

export function RecipeCard({ recipe, viewMode, onPress }: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(recipe.isFavorited);
  const toggleFavorite = useMutation(api.recipes.toggleFavorite);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const totalTime = recipe.prepTime + recipe.cookTime;

  // Icon colors based on theme
  const iconColor = isDark ? "#a8a29e" : "#78716c"; // stone-400 / stone-500
  const iconColorLight = isDark ? "#e7e5e4" : "#44403c"; // stone-200 / stone-700
  const heartColor = isFavorited ? "#ef4444" : iconColor; // red-500 or muted

  const handleFavoriteToggle = useCallback(async () => {
    // Optimistic update
    setIsFavorited((prev) => !prev);

    try {
      await toggleFavorite({ id: recipe._id });
    } catch (error) {
      // Revert on error
      setIsFavorited((prev) => !prev);
      console.error("Failed to toggle favorite:", error);
    }
  }, [recipe._id, toggleFavorite]);

  if (viewMode === "list") {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 active:border-orange-300 dark:border-stone-700 dark:bg-stone-800"
      >
        {/* Thumbnail */}
        <View className="relative h-20 w-20 overflow-hidden rounded-lg">
          <Image
            source={{ uri: recipe.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-1 left-1">
            <SourceBadge source={recipe.source} compact />
          </View>
        </View>

        {/* Content */}
        <View className="min-w-0 flex-1">
          <Text
            className="font-semibold text-stone-900 dark:text-stone-100"
            numberOfLines={1}
          >
            {recipe.title}
          </Text>
          {recipe.physicalCookbook && (
            <Text
              className="text-sm text-stone-500 dark:text-stone-400"
              numberOfLines={1}
            >
              from {recipe.physicalCookbook.name}
            </Text>
          )}
          <View className="mt-1 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Clock size={14} color={iconColor} />
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {totalTime} min
              </Text>
            </View>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {recipe.servings} servings
            </Text>
          </View>
        </View>

        {/* Favorite button */}
        <Pressable
          onPress={handleFavoriteToggle}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={20}
            color={heartColor}
            fill={isFavorited ? "#ef4444" : "transparent"}
          />
        </Pressable>

        {/* Arrow */}
        <ChevronRight size={20} color={iconColor} />
      </Pressable>
    );
  }

  // Grid view
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white active:border-orange-300 dark:border-stone-700 dark:bg-stone-800"
    >
      {/* Image */}
      <View className="relative aspect-[4/3] overflow-hidden">
        <Image
          source={{ uri: recipe.imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {/* Gradient overlay */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Source badge */}
        <View className="absolute left-3 top-3">
          <SourceBadge source={recipe.source} />
        </View>

        {/* Favorite button */}
        <Pressable
          onPress={handleFavoriteToggle}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 active:bg-white dark:bg-stone-900/90"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={16}
            color={isFavorited ? "#ef4444" : iconColorLight}
            fill={isFavorited ? "#ef4444" : "transparent"}
          />
        </Pressable>

        {/* Time badge */}
        <View className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full bg-white/90 px-2 py-1 dark:bg-stone-900/90">
          <Clock size={14} color={iconColorLight} />
          <Text className="text-xs font-medium text-stone-700 dark:text-stone-200">
            {totalTime} min
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text
          className="font-semibold leading-tight text-stone-900 dark:text-stone-100"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
        {recipe.physicalCookbook && (
          <Text
            className="mt-1 text-sm text-stone-500 dark:text-stone-400"
            numberOfLines={1}
          >
            from {recipe.physicalCookbook.name}
          </Text>
        )}
        <View className="mt-2 flex-row items-center gap-2">
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            {recipe.servings} servings
          </Text>
          {recipe.nutrition && (
            <>
              <Text className="text-stone-300 dark:text-stone-600">•</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {recipe.nutrition.calories} cal
              </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}
