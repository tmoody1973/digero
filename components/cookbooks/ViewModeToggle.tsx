/**
 * ViewModeToggle Component
 *
 * Toggle between grid and list view modes.
 * Used in both Cookbooks list and Cookbook detail views.
 */

import { View, Pressable } from "react-native";
import { Grid3X3, List } from "lucide-react-native";

export type ViewMode = "grid" | "list";

interface ViewModeToggleProps {
  value: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  size?: "sm" | "md";
}

export function ViewModeToggle({
  value,
  onViewModeChange,
  size = "md",
}: ViewModeToggleProps) {
  const iconSize = size === "sm" ? 14 : 16;
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <View className="flex-row items-center gap-0.5 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800">
      <Pressable
        onPress={() => onViewModeChange("grid")}
        className={`${buttonSize} items-center justify-center rounded-md ${
          value === "grid"
            ? "bg-white shadow-sm dark:bg-stone-700"
            : "bg-transparent"
        }`}
      >
        <Grid3X3
          width={iconSize}
          height={iconSize}
          className={
            value === "grid"
              ? "text-stone-900 dark:text-white"
              : "text-stone-400"
          }
        />
      </Pressable>
      <Pressable
        onPress={() => onViewModeChange("list")}
        className={`${buttonSize} items-center justify-center rounded-md ${
          value === "list"
            ? "bg-white shadow-sm dark:bg-stone-700"
            : "bg-transparent"
        }`}
      >
        <List
          width={iconSize}
          height={iconSize}
          className={
            value === "list"
              ? "text-stone-900 dark:text-white"
              : "text-stone-400"
          }
        />
      </Pressable>
    </View>
  );
}
