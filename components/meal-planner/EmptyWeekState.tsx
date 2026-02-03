/**
 * EmptyWeekState Component
 *
 * Displayed when the current week has no planned meals.
 * Shows a friendly illustration and call-to-action to add the first meal.
 */

import { View, Text, Pressable } from "react-native";
import { CalendarPlus, ChefHat, Plus } from "lucide-react-native";
import type { EmptyWeekStateProps } from "@/types/meal-planner";

export function EmptyWeekState({ onAddMeal }: EmptyWeekStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Illustration */}
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <CalendarPlus className="h-12 w-12 text-stone-400 dark:text-stone-500" />
      </View>

      {/* Text */}
      <Text className="mb-2 text-center text-xl font-bold text-stone-900 dark:text-white">
        No meals planned
      </Text>
      <Text className="mb-8 max-w-xs text-center text-sm text-stone-500 dark:text-stone-400">
        Start planning your week by adding recipes to your meal slots
      </Text>

      {/* CTA Button */}
      <Pressable
        onPress={onAddMeal}
        className="flex-row items-center gap-2 rounded-xl bg-orange-500 px-6 py-4 active:bg-orange-600"
        accessibilityLabel="Add your first meal"
        accessibilityRole="button"
      >
        <Plus className="h-5 w-5 text-white" />
        <Text className="text-base font-semibold text-white">
          Add Your First Meal
        </Text>
      </Pressable>

      {/* Additional hint */}
      <View className="mt-8 flex-row items-center gap-2 rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800">
        <ChefHat className="h-5 w-5 text-stone-400 dark:text-stone-500" />
        <Text className="text-sm text-stone-500 dark:text-stone-400">
          Tip: Tap any slot above to add a recipe
        </Text>
      </View>
    </View>
  );
}
