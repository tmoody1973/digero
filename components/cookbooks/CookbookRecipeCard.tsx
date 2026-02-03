/**
 * CookbookRecipeCard Component
 *
 * Displays a recipe within a cookbook in grid or list view.
 * Supports multi-select mode, drag handle, and remove button.
 */

import { View, Text, Pressable, Image } from "react-native";
import {
  Youtube,
  Globe,
  Camera,
  PenLine,
  GripHorizontal,
  X,
  Check,
} from "lucide-react-native";
import { Id } from "@/convex/_generated/dataModel";
import type { ViewMode } from "./CookbookCard";

type RecipeSource = "youtube" | "website" | "scanned" | "manual";

interface CookbookRecipe {
  recipeId: Id<"recipes">;
  title: string;
  imageUrl: string;
  source: RecipeSource;
  position: number;
  dateAdded: number;
}

interface CookbookRecipeCardProps {
  recipe: CookbookRecipe;
  viewMode: ViewMode;
  isSelected?: boolean;
  isSelectMode?: boolean;
  isBuiltIn?: boolean;
  onView?: () => void;
  onToggleSelect?: () => void;
  onRemove?: () => void;
}

const sourceIcons: Record<RecipeSource, React.ReactNode> = {
  youtube: <Youtube className="h-3.5 w-3.5" />,
  website: <Globe className="h-3.5 w-3.5" />,
  scanned: <Camera className="h-3.5 w-3.5" />,
  manual: <PenLine className="h-3.5 w-3.5" />,
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CookbookRecipeCard({
  recipe,
  viewMode,
  isSelected = false,
  isSelectMode = false,
  isBuiltIn = false,
  onView,
  onToggleSelect,
  onRemove,
}: CookbookRecipeCardProps) {
  const handlePress = () => {
    if (isSelectMode) {
      onToggleSelect?.();
    } else {
      onView?.();
    }
  };

  if (viewMode === "list") {
    return (
      <Pressable
        onPress={handlePress}
        className={`flex-row items-center gap-4 rounded-xl border p-3 ${
          isSelected
            ? "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20"
            : "border-stone-200 bg-white active:border-orange-300 dark:border-stone-700 dark:bg-stone-800"
        }`}
      >
        {/* Selection Checkbox */}
        {isSelectMode && (
          <View
            className={`h-5 w-5 items-center justify-center rounded-md border-2 ${
              isSelected
                ? "border-orange-500 bg-orange-500"
                : "border-stone-300 dark:border-stone-600"
            }`}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </View>
        )}

        {/* Thumbnail */}
        <View className="h-14 w-14 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-700">
          <Image
            source={{ uri: recipe.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View className="min-w-0 flex-1">
          <Text
            className="font-medium text-stone-900 dark:text-white"
            numberOfLines={1}
          >
            {recipe.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 text-stone-500 dark:text-stone-400">
              {sourceIcons[recipe.source]}
              <Text className="text-xs capitalize text-stone-500 dark:text-stone-400">
                {recipe.source}
              </Text>
            </View>
            <Text className="text-xs text-stone-400 dark:text-stone-500">
              Added {formatDate(recipe.dateAdded)}
            </Text>
          </View>
        </View>

        {/* Remove Button */}
        {!isSelectMode && !isBuiltIn && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-red-50 dark:active:bg-red-900/30"
          >
            <X className="h-4 w-4 text-stone-400" />
          </Pressable>
        )}

        {/* Drag Handle */}
        {!isSelectMode && !isBuiltIn && (
          <View className="items-center justify-center">
            <GripHorizontal className="h-5 w-5 text-stone-300 dark:text-stone-600" />
          </View>
        )}
      </Pressable>
    );
  }

  // Grid view
  return (
    <Pressable
      onPress={handlePress}
      className={`overflow-hidden rounded-xl border ${
        isSelected
          ? "border-orange-400 dark:border-orange-500"
          : "border-stone-200 active:border-orange-300 dark:border-stone-700"
      }`}
    >
      {/* Image */}
      <View className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-700">
        <Image
          source={{ uri: recipe.imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Selection Overlay */}
        {isSelectMode && isSelected && (
          <View className="absolute inset-0 bg-orange-500/20" />
        )}

        {/* Selection Checkbox */}
        {isSelectMode && (
          <View
            className={`absolute left-2 top-2 h-6 w-6 items-center justify-center rounded-full border-2 ${
              isSelected
                ? "border-orange-500 bg-orange-500"
                : "border-stone-300 bg-white/90 dark:border-stone-600 dark:bg-stone-900/90"
            }`}
          >
            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
          </View>
        )}

        {/* Source Badge */}
        <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full bg-white/90 px-2 py-1 dark:bg-stone-900/90">
          <View className="text-stone-600 dark:text-stone-300">
            {sourceIcons[recipe.source]}
          </View>
        </View>

        {/* Remove Button */}
        {!isSelectMode && !isBuiltIn && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-white/90 active:bg-red-50 dark:bg-stone-900/90"
          >
            <X className="h-4 w-4 text-stone-400" />
          </Pressable>
        )}
      </View>

      {/* Info */}
      <View className="bg-white p-3 dark:bg-stone-800">
        <Text
          className="text-sm font-medium text-stone-900 dark:text-white"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
      </View>
    </Pressable>
  );
}
