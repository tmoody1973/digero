/**
 * EmptyState Component
 *
 * Displayed when the user has no cookbooks.
 * Includes a CTA to create the first cookbook.
 */

import { View, Text, Pressable } from "react-native";
import { BookOpen, Plus } from "lucide-react-native";

interface EmptyStateProps {
  onCreateCookbook: () => void;
}

export function EmptyState({ onCreateCookbook }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-stone-200 bg-white py-16 dark:border-stone-700 dark:bg-stone-800">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700">
        <BookOpen className="h-8 w-8 text-stone-400" />
      </View>

      <Text className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">
        No cookbooks yet
      </Text>

      <Text className="mb-4 text-center text-stone-500 dark:text-stone-400">
        Create your first cookbook to organize your recipes
      </Text>

      <Pressable
        onPress={onCreateCookbook}
        className="flex-row items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 active:bg-orange-600"
      >
        <Plus className="h-5 w-5 text-white" />
        <Text className="font-semibold text-white">Create Cookbook</Text>
      </Pressable>
    </View>
  );
}

/**
 * CookbookEmptyState Component
 *
 * Displayed when a cookbook has no recipes.
 * Shows different messaging for built-in vs custom cookbooks.
 */
interface CookbookEmptyStateProps {
  isBuiltIn: boolean;
  cookbookName?: string;
}

export function CookbookEmptyState({
  isBuiltIn,
  cookbookName,
}: CookbookEmptyStateProps) {
  const getMessage = () => {
    if (isBuiltIn && cookbookName === "Favorites") {
      return "Tap the heart icon on any recipe to add it to your favorites";
    }
    if (isBuiltIn && cookbookName === "Recently Added") {
      return "Recipes you save will appear here automatically";
    }
    return "Add recipes from your library to this cookbook";
  };

  return (
    <View className="items-center rounded-2xl border border-stone-200 bg-white py-16 dark:border-stone-700 dark:bg-stone-800">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700">
        <BookOpen className="h-8 w-8 text-stone-400" />
      </View>

      <Text className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">
        No recipes yet
      </Text>

      <Text className="px-8 text-center text-stone-500 dark:text-stone-400">
        {getMessage()}
      </Text>
    </View>
  );
}
