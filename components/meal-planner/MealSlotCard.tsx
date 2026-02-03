/**
 * MealSlotCard Component
 *
 * Displays a single meal slot with either empty state (dashed border + plus icon)
 * or filled state (recipe thumbnail, name, prep time, remove button).
 * Supports selection mode with checkboxes for shopping list generation.
 */

import { View, Text, Pressable, Image } from "react-native";
import { Plus, X, Clock, Check } from "lucide-react-native";
import type { MealSlotCardProps } from "@/types/meal-planner";

export function MealSlotCard({
  meal,
  slot,
  isSelected = false,
  isSelectionMode = false,
  isDragTarget = false,
  onTap,
  onRemove,
  onToggleSelect,
  onViewRecipe,
  onLongPress,
}: MealSlotCardProps) {
  const handlePress = () => {
    if (isSelectionMode && meal) {
      onToggleSelect?.();
    } else if (meal) {
      onViewRecipe?.();
    } else {
      onTap?.();
    }
  };

  // Empty slot
  if (!meal) {
    return (
      <Pressable
        onPress={onTap}
        onLongPress={onLongPress}
        className={`h-16 w-full items-center justify-center rounded-xl border-2 border-dashed ${
          isDragTarget
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
            : "border-stone-200 dark:border-stone-700"
        }`}
        accessibilityLabel={`Add ${slot} recipe`}
        accessibilityRole="button"
      >
        <Plus
          className={`h-6 w-6 ${
            isDragTarget
              ? "text-orange-500"
              : "text-stone-400 dark:text-stone-500"
          }`}
        />
      </Pressable>
    );
  }

  // Filled slot
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={500}
      className={`w-full overflow-hidden rounded-xl border ${
        isSelected
          ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20"
          : isDragTarget
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
            : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800"
      }`}
      accessibilityLabel={`${meal.recipeName}, ${meal.prepTime}${isSelectionMode ? (isSelected ? ", selected" : ", not selected") : ""}`}
      accessibilityRole={isSelectionMode ? "checkbox" : "button"}
      accessibilityState={{ checked: isSelected }}
    >
      <View className="flex-row items-center gap-3 p-3">
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <View
            className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
              isSelected
                ? "border-orange-500 bg-orange-500"
                : "border-stone-300 dark:border-stone-600"
            }`}
          >
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </View>
        )}

        {/* Recipe Thumbnail */}
        <View className="h-12 w-12 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-700">
          <Image
            source={{ uri: meal.recipeImage }}
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
            {meal.recipeName}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Clock className="h-3 w-3 text-stone-400 dark:text-stone-500" />
            <Text className="text-xs text-stone-500 dark:text-stone-400">
              {meal.prepTime}
            </Text>
          </View>
        </View>

        {/* Remove Button (only in non-selection mode) */}
        {!isSelectionMode && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onRemove?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-red-50 dark:active:bg-red-900/30"
            accessibilityLabel={`Remove ${meal.recipeName}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X className="h-4 w-4 text-stone-400 active:text-red-500" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
