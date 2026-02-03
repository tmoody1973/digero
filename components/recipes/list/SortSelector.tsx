/**
 * SortSelector Component
 *
 * Displays current sort option and opens a bottom sheet to select sorting.
 * Persists selection to AsyncStorage.
 */

import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SortOption =
  | "mostRecent"
  | "alphabetical"
  | "cookTime"
  | "calories"
  | "recentlyCooked";

interface SortSelectorProps {
  value: SortOption;
  onSortChange: (sort: SortOption) => void;
}

interface SortOptionConfig {
  value: SortOption;
  label: string;
}

const sortOptions: SortOptionConfig[] = [
  { value: "mostRecent", label: "Most Recent" },
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "cookTime", label: "Cook Time (Shortest)" },
  { value: "calories", label: "Calories (Lowest)" },
  { value: "recentlyCooked", label: "Recently Cooked" },
];

const SORT_STORAGE_KEY = "@digero/recipe-sort-preference";

export function SortSelector({ value, onSortChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = sortOptions.find((o) => o.value === value);

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(SORT_STORAGE_KEY);
        if (saved && sortOptions.some((o) => o.value === saved)) {
          onSortChange(saved as SortOption);
        }
      } catch (error) {
        console.error("Failed to load sort preference:", error);
      }
    };
    loadPreference();
  }, []);

  const handleSelect = async (sortValue: SortOption) => {
    onSortChange(sortValue);
    setIsOpen(false);

    // Persist preference
    try {
      await AsyncStorage.setItem(SORT_STORAGE_KEY, sortValue);
    } catch (error) {
      console.error("Failed to save sort preference:", error);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-800"
      >
        <Text className="text-sm text-stone-600 dark:text-stone-300">
          {currentOption?.label}
        </Text>
        <ChevronDown className="h-4 w-4 text-stone-400" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="mt-auto rounded-t-3xl bg-white dark:bg-stone-900">
            <View className="items-center py-4">
              <View className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
            </View>

            <Text className="px-6 pb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Sort Recipes
            </Text>

            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                className="flex-row items-center justify-between px-6 py-4 active:bg-stone-100 dark:active:bg-stone-800"
              >
                <Text
                  className={`text-base ${
                    option.value === value
                      ? "font-semibold text-orange-500"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {option.label}
                </Text>
                {option.value === value && (
                  <Check className="h-5 w-5 text-orange-500" />
                )}
              </Pressable>
            ))}

            <View className="h-8" />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
