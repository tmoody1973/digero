/**
 * RecipePickerSheet Component
 *
 * Bottom sheet modal for selecting recipes to add to meal slots.
 * Includes search input and category filter pills.
 * Adapts the sidebar design from the web mockup to mobile.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Search, X, ChevronDown } from "lucide-react-native";
import { RecipeListItem } from "./RecipeListItem";
import type { RecipePickerSheetProps } from "@/types/meal-planner";
import type { CategoryFilter, MealSlot } from "@/types/meal-planner";
import { CATEGORY_LABELS, SLOT_LABELS } from "@/types/meal-planner";
import { Id } from "@/convex/_generated/dataModel";

const CATEGORY_FILTERS: CategoryFilter[] = [
  "all",
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
];

export function RecipePickerSheet({
  isVisible,
  recipes,
  targetDay,
  targetSlot,
  onSelectRecipe,
  onClose,
}: RecipePickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<CategoryFilter>("all");

  // Animation values
  const translateY = useSharedValue(500);
  const backdropOpacity = useSharedValue(0);

  // Animate sheet in/out
  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(500, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, translateY, backdropOpacity]);

  // Animated styles
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.category === filterCategory
      );
    }

    return filtered;
  }, [recipes, searchQuery, filterCategory]);

  // Handle recipe selection
  const handleSelectRecipe = useCallback(
    (recipeId: Id<"recipes">) => {
      onSelectRecipe(recipeId);
      setSearchQuery("");
      setFilterCategory("all");
    },
    [onSelectRecipe]
  );

  // Handle close
  const handleClose = useCallback(() => {
    setSearchQuery("");
    setFilterCategory("all");
    onClose();
  }, [onClose]);

  // Format target info for header
  const targetInfo = useMemo(() => {
    const date = new Date(targetDay + "T12:00:00");
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return `${SLOT_LABELS[targetSlot]} - ${dayName}`;
  }, [targetDay, targetSlot]);

  if (!isVisible) {
    return null;
  }

  return (
    <View className="absolute inset-0">
      {/* Backdrop */}
      <Animated.View
        style={backdropStyle}
        className="absolute inset-0 bg-black/50"
      >
        <Pressable className="flex-1" onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={sheetStyle}
        className="absolute bottom-0 left-0 right-0 max-h-[80%] rounded-t-3xl bg-white dark:bg-stone-900"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Handle */}
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
          </View>

          {/* Header */}
          <View className="border-b border-stone-100 px-4 pb-4 dark:border-stone-800">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-stone-900 dark:text-white">
                  Add Recipe
                </Text>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  {targetInfo}
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
                accessibilityLabel="Close recipe picker"
                accessibilityRole="button"
              >
                <X className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              </Pressable>
            </View>

            {/* Search Input */}
            <View className="mt-4 flex-row items-center rounded-xl bg-stone-100 px-3 dark:bg-stone-800">
              <Search className="h-4 w-4 text-stone-400" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search recipes..."
                placeholderTextColor="#a8a29e"
                className="flex-1 px-2 py-3 text-sm text-stone-900 dark:text-white"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  accessibilityLabel="Clear search"
                >
                  <X className="h-4 w-4 text-stone-400" />
                </Pressable>
              )}
            </View>

            {/* Category Filter Pills */}
            <View className="mt-3 flex-row flex-wrap gap-2">
              {CATEGORY_FILTERS.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setFilterCategory(category)}
                  className={`rounded-lg px-3 py-1.5 ${
                    filterCategory === category
                      ? "bg-orange-500"
                      : "bg-stone-100 dark:bg-stone-800"
                  }`}
                  accessibilityLabel={`Filter by ${CATEGORY_LABELS[category]}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filterCategory === category }}
                >
                  <Text
                    className={`text-xs font-medium ${
                      filterCategory === category
                        ? "text-white"
                        : "text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recipe List */}
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecipeListItem
                recipe={item}
                onPress={() => handleSelectRecipe(item.id)}
              />
            )}
            contentContainerClassName="p-4 gap-2"
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-sm text-stone-400 dark:text-stone-500">
                  No recipes found
                </Text>
                {searchQuery && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    <Text className="text-sm text-orange-500">Clear search</Text>
                  </Pressable>
                )}
              </View>
            }
            showsVerticalScrollIndicator={false}
          />

          {/* Hint */}
          <View className="border-t border-stone-100 p-4 dark:border-stone-800">
            <Text className="text-center text-xs text-stone-400 dark:text-stone-500">
              Tap a recipe to add it to your meal plan
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}
