/**
 * WeekHeader Component
 *
 * Header for the meal planner showing week navigation,
 * meal count, and action buttons (Shop, Clear Week).
 */

import { View, Text, Pressable } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Trash2,
  X,
  ClipboardList,
} from "lucide-react-native";
import type { WeekHeaderProps } from "@/types/meal-planner";

export function WeekHeader({
  weekInfo,
  mealCount,
  isSelectionMode,
  selectedCount,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onShopPress,
  onCancelSelection,
  onGenerateList,
  onClearWeek,
}: WeekHeaderProps) {
  return (
    <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
      {/* Title Row */}
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-white">
            Meal Plan
          </Text>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            {mealCount} meal{mealCount !== 1 ? "s" : ""} planned this week
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          {isSelectionMode ? (
            <>
              {/* Cancel Button */}
              <Pressable
                onPress={onCancelSelection}
                className="px-3 py-1.5"
                accessibilityLabel="Cancel selection"
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Cancel
                </Text>
              </Pressable>

              {/* Generate List Button */}
              <Pressable
                onPress={onGenerateList}
                disabled={selectedCount === 0}
                className={`flex-row items-center gap-2 rounded-lg px-4 py-1.5 ${
                  selectedCount > 0
                    ? "bg-green-500 active:bg-green-600"
                    : "bg-green-500/50"
                }`}
                accessibilityLabel={`Generate shopping list with ${selectedCount} items`}
                accessibilityRole="button"
                accessibilityState={{ disabled: selectedCount === 0 }}
              >
                <ClipboardList className="h-4 w-4 text-white" />
                <Text className="text-sm font-semibold text-white">
                  Shopping List ({selectedCount})
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Shop Button */}
              <Pressable
                onPress={onShopPress}
                className="flex-row items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 active:bg-green-600"
                accessibilityLabel="Start shopping list selection"
                accessibilityRole="button"
              >
                <ShoppingCart className="h-4 w-4 text-white" />
                <Text className="text-sm font-medium text-white">Shop</Text>
              </Pressable>

              {/* Clear Week Button */}
              <Pressable
                onPress={onClearWeek}
                className="px-3 py-1.5"
                accessibilityLabel="Clear all meals for this week"
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Clear Week
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Week Navigation */}
      <View className="flex-row items-center justify-between">
        {/* Previous Week Button */}
        <Pressable
          onPress={onPreviousWeek}
          className="h-12 w-12 items-center justify-center rounded-lg bg-stone-100 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-700"
          accessibilityLabel="Previous week"
          accessibilityRole="button"
        >
          <ChevronLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
        </Pressable>

        {/* Week Label and Today Button */}
        <View className="flex-row items-center gap-3">
          <Text className="font-semibold text-stone-900 dark:text-white">
            {weekInfo.weekLabel}
          </Text>
          <Pressable
            onPress={onToday}
            className="rounded-full bg-orange-100 px-3 py-1 active:bg-orange-200 dark:bg-orange-900/30 dark:active:bg-orange-900/50"
            accessibilityLabel="Go to today"
            accessibilityRole="button"
          >
            <Text className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Today
            </Text>
          </Pressable>
        </View>

        {/* Next Week Button */}
        <Pressable
          onPress={onNextWeek}
          className="h-12 w-12 items-center justify-center rounded-lg bg-stone-100 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-700"
          accessibilityLabel="Next week"
          accessibilityRole="button"
        >
          <ChevronRight className="h-5 w-5 text-stone-600 dark:text-stone-400" />
        </Pressable>
      </View>
    </View>
  );
}
