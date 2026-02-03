/**
 * ActionButtons Component
 *
 * Action buttons for meal plan, cookbook, and delete operations.
 */

import { View, Text, Pressable, Alert } from "react-native";
import { Calendar, BookOpen, Trash2 } from "lucide-react-native";

interface ActionButtonsProps {
  onAddToMealPlan?: () => void;
  onAddToCookbook?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({
  onAddToMealPlan,
  onAddToCookbook,
  onDelete,
}: ActionButtonsProps) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Recipe?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View className="mt-8 flex-row flex-wrap gap-3 border-t border-stone-200 pt-6 dark:border-stone-700">
      <Pressable
        onPress={onAddToMealPlan}
        className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 active:border-orange-300 active:bg-orange-50 dark:border-stone-700 dark:bg-stone-800 dark:active:border-orange-600 dark:active:bg-orange-900/30"
      >
        <Calendar className="h-5 w-5 text-orange-500" />
        <Text className="font-medium text-stone-700 dark:text-stone-200">
          Add to Meal Plan
        </Text>
      </Pressable>

      <Pressable
        onPress={onAddToCookbook}
        className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 active:border-orange-300 active:bg-orange-50 dark:border-stone-700 dark:bg-stone-800 dark:active:border-orange-600 dark:active:bg-orange-900/30"
      >
        <BookOpen className="h-5 w-5 text-orange-500" />
        <Text className="font-medium text-stone-700 dark:text-stone-200">
          Add to Cookbook
        </Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        className="flex-row items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 active:bg-red-50 dark:border-red-800 dark:bg-stone-800 dark:active:bg-red-900/30"
      >
        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
        <Text className="font-medium text-red-600 dark:text-red-400">
          Delete Recipe
        </Text>
      </Pressable>
    </View>
  );
}
