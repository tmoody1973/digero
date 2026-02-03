/**
 * ContextMenu Component
 *
 * Long-press context menu for filled meal slots.
 * Shows Copy, Move, and Remove options.
 */

import { View, Text, Pressable, Modal } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown } from "react-native-reanimated";
import { Copy, Move, Trash2, X } from "lucide-react-native";
import type { ContextMenuProps } from "@/types/meal-planner";

export function ContextMenu({
  isVisible,
  meal,
  onCopy,
  onMove,
  onRemove,
  onClose,
}: ContextMenuProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Animated.View
          entering={SlideInDown.duration(200)}
          exiting={FadeOut.duration(150)}
          className="rounded-t-3xl bg-white pb-8 pt-4 dark:bg-stone-800"
        >
          {/* Handle */}
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
          </View>

          {/* Meal Info */}
          <View className="mb-4 px-6">
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">
              {meal.recipeName}
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {meal.prepTime}
            </Text>
          </View>

          {/* Actions */}
          <View className="px-4">
            {/* Copy */}
            <Pressable
              onPress={onCopy}
              className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-stone-100 dark:active:bg-stone-700"
              accessibilityLabel="Copy meal to another slot"
              accessibilityRole="button"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </View>
              <View>
                <Text className="font-medium text-stone-900 dark:text-white">
                  Copy to Another Slot
                </Text>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  Duplicate this meal
                </Text>
              </View>
            </Pressable>

            {/* Move */}
            <Pressable
              onPress={onMove}
              className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-stone-100 dark:active:bg-stone-700"
              accessibilityLabel="Move meal to another slot"
              accessibilityRole="button"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <Move className="h-5 w-5 text-green-600 dark:text-green-400" />
              </View>
              <View>
                <Text className="font-medium text-stone-900 dark:text-white">
                  Move to Another Slot
                </Text>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  Relocate this meal
                </Text>
              </View>
            </Pressable>

            {/* Remove */}
            <Pressable
              onPress={onRemove}
              className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-red-50 dark:active:bg-red-900/20"
              accessibilityLabel="Remove meal"
              accessibilityRole="button"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </View>
              <View>
                <Text className="font-medium text-red-600 dark:text-red-400">
                  Remove Meal
                </Text>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  Delete from meal plan
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Cancel */}
          <View className="mt-4 px-4">
            <Pressable
              onPress={onClose}
              className="items-center rounded-xl bg-stone-100 py-4 active:bg-stone-200 dark:bg-stone-700 dark:active:bg-stone-600"
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text className="font-medium text-stone-900 dark:text-white">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
