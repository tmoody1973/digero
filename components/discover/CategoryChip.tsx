/**
 * Category Chip Component
 *
 * Horizontal scrollable filter chip for channel categories.
 * Used in the Discover Channels view.
 */

import React from "react";
import { Text, Pressable } from "react-native";
import {
  Pizza,
  Soup,
  Timer,
  CakeSlice,
  Salad,
  Flame,
  ChefHat,
} from "lucide-react-native";
import type { CategoryChipProps } from "./types";

/**
 * Get icon component for category
 */
function getCategoryIcon(
  categoryName: string,
  isSelected: boolean
): React.ReactNode {
  const color = isSelected ? "#fff" : "#f97316"; // Orange icon when not selected
  const size = 16;

  switch (categoryName) {
    case "Italian":
      return <Pizza size={size} color={color} />;
    case "Asian":
      return <Soup size={size} color={color} />;
    case "Quick Meals":
      return <Timer size={size} color={color} />;
    case "Baking":
      return <CakeSlice size={size} color={color} />;
    case "Healthy":
      return <Salad size={size} color={color} />;
    case "BBQ & Grilling":
      return <Flame size={size} color={color} />;
    default:
      return <ChefHat size={size} color={color} />;
  }
}

export function CategoryChip({
  category,
  isSelected,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
        isSelected
          ? "bg-orange-500"
          : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 active:border-orange-500/50"
      }`}
    >
      {getCategoryIcon(category.name, isSelected)}
      <Text
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-stone-700 dark:text-stone-400"
        }`}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}
