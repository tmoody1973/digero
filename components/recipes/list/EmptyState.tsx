/**
 * EmptyState Component
 *
 * Displays when no recipes match the current filters/search.
 */

import { View, Text, Pressable } from "react-native";
import { Search, ChefHat } from "lucide-react-native";

interface EmptyStateProps {
  hasFilters: boolean;
  searchQuery?: string;
  onClearFilters?: () => void;
  onAddRecipe?: () => void;
}

export function EmptyState({
  hasFilters,
  searchQuery,
  onClearFilters,
  onAddRecipe,
}: EmptyStateProps) {
  if (hasFilters || searchQuery) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
          <Search className="h-10 w-10 text-stone-300 dark:text-stone-600" />
        </View>
        <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          No recipes found
        </Text>
        <Text className="mt-1 text-center text-stone-500 dark:text-stone-400">
          {searchQuery
            ? `No recipes match "${searchQuery}"`
            : "Try adjusting your filters"}
        </Text>
        {onClearFilters && (
          <Pressable
            onPress={onClearFilters}
            className="mt-4 rounded-xl bg-stone-100 px-4 py-2 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-700"
          >
            <Text className="font-medium text-stone-700 dark:text-stone-300">
              Clear Filters
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
        <ChefHat className="h-10 w-10 text-orange-500" />
      </View>
      <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        No recipes yet
      </Text>
      <Text className="mt-1 text-center text-stone-500 dark:text-stone-400">
        Add your first recipe to get started!
      </Text>
      {onAddRecipe && (
        <Pressable
          onPress={onAddRecipe}
          className="mt-4 rounded-xl bg-orange-500 px-6 py-3 active:bg-orange-600"
        >
          <Text className="font-medium text-white">Add Recipe</Text>
        </Pressable>
      )}
    </View>
  );
}
