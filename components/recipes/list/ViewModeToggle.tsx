/**
 * ViewModeToggle Component
 *
 * Toggle between grid and list view modes.
 * Persists preference to AsyncStorage.
 */

import { useEffect } from "react";
import { View, Pressable } from "react-native";
import { LayoutGrid, List } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ViewMode = "grid" | "list";

interface ViewModeToggleProps {
  value: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODE_STORAGE_KEY = "@digero/recipe-view-mode";

export function ViewModeToggle({ value, onViewModeChange }: ViewModeToggleProps) {
  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (saved === "grid" || saved === "list") {
          onViewModeChange(saved);
        }
      } catch (error) {
        console.error("Failed to load view mode preference:", error);
      }
    };
    loadPreference();
  }, []);

  const handleToggle = async (mode: ViewMode) => {
    onViewModeChange(mode);

    // Persist preference
    try {
      await AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save view mode preference:", error);
    }
  };

  return (
    <View className="flex-row items-center rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-800">
      <Pressable
        onPress={() => handleToggle("grid")}
        className={`rounded-md p-2 ${
          value === "grid" ? "bg-orange-500" : ""
        }`}
      >
        <LayoutGrid
          className={`h-4 w-4 ${
            value === "grid"
              ? "text-white"
              : "text-stone-400"
          }`}
        />
      </Pressable>
      <Pressable
        onPress={() => handleToggle("list")}
        className={`rounded-md p-2 ${
          value === "list" ? "bg-orange-500" : ""
        }`}
      >
        <List
          className={`h-4 w-4 ${
            value === "list"
              ? "text-white"
              : "text-stone-400"
          }`}
        />
      </Pressable>
    </View>
  );
}
