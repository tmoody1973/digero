/**
 * ShoppingListCard Component
 *
 * Displays a single shopping list with name, date, progress, and actions.
 * Used in the Shopping Lists overview screen.
 */

import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ShoppingList } from "@/types/shopping-list";

interface ShoppingListCardProps {
  list: ShoppingList;
  onView?: () => void;
  onDelete?: () => void;
}

export function ShoppingListCard({ list, onView, onDelete }: ShoppingListCardProps) {
  const progress =
    list.totalItems > 0
      ? Math.round((list.checkedItems / list.totalItems) * 100)
      : 0;

  const isComplete = list.status === "archived";

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const dateLabel = isComplete
    ? `Completed ${formatDate(list.completedAt || list.updatedAt)}`
    : `Created ${formatDate(list.createdAt)}`;

  return (
    <Pressable
      onPress={onView}
      className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-stone-900 dark:text-white">
            {list.name}
          </Text>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            {dateLabel}
          </Text>
        </View>

        {!isComplete && onDelete && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 -m-2"
            hitSlop={8}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#a8a29e"
            />
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-stone-600 dark:text-stone-300">
          {list.checkedItems} of {list.totalItems} items
        </Text>

        {isComplete ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text className="text-sm font-medium text-green-600">
              Complete
            </Text>
          </View>
        ) : progress > 0 ? (
          <Text className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {progress}% done
          </Text>
        ) : null}
      </View>

      {/* Progress bar for active lists */}
      {!isComplete && list.totalItems > 0 && (
        <View className="mt-3 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-orange-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      )}
    </Pressable>
  );
}
