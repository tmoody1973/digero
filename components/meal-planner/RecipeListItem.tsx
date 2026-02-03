/**
 * RecipeListItem Component
 *
 * Single recipe item for the recipe picker.
 * Displays thumbnail, name, and prep time.
 * Designed to be draggable for drag-and-drop assignment.
 */

import { View, Text, Pressable, Image } from "react-native";
import { Clock, Plus } from "lucide-react-native";
import type { RecipeListItemProps } from "@/types/meal-planner";

export function RecipeListItem({ recipe, onPress }: RecipeListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl border border-transparent bg-stone-50 p-3 active:border-orange-300 active:bg-orange-50 dark:bg-stone-800 dark:active:border-orange-600 dark:active:bg-orange-900/20"
      accessibilityLabel={`${recipe.name}, ${recipe.prepTime}`}
      accessibilityRole="button"
      accessibilityHint="Tap to add to meal plan"
    >
      {/* Recipe Thumbnail */}
      <View className="h-12 w-12 overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-700">
        <Image
          source={{ uri: recipe.image }}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      {/* Recipe Info */}
      <View className="min-w-0 flex-1">
        <Text
          className="text-sm font-medium text-stone-900 dark:text-white"
          numberOfLines={1}
        >
          {recipe.name}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1">
          <Clock className="h-3 w-3 text-stone-400 dark:text-stone-500" />
          <Text className="text-xs text-stone-500 dark:text-stone-400">
            {recipe.prepTime}
          </Text>
        </View>
      </View>

      {/* Add Icon */}
      <View className="h-8 w-8 items-center justify-center">
        <Plus className="h-4 w-4 text-stone-300 dark:text-stone-600" />
      </View>
    </Pressable>
  );
}
