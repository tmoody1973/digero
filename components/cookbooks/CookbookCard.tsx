/**
 * CookbookCard Component
 *
 * Displays a cookbook in either grid or list view mode.
 * Includes action buttons and built-in badge.
 */

import { View, Text, Pressable, Image } from "react-native";
import {
  Share2,
  Pencil,
  Trash2,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { Id } from "@/convex/_generated/dataModel";

export type ViewMode = "grid" | "list";

interface Cookbook {
  _id: Id<"cookbooks">;
  name: string;
  description: string;
  coverUrl: string;
  recipeCount: number;
  isBuiltIn: boolean;
  updatedAt: number;
}

interface CookbookCardProps {
  cookbook: Cookbook;
  viewMode: ViewMode;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CookbookCard({
  cookbook,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onShare,
}: CookbookCardProps) {
  if (viewMode === "list") {
    return (
      <Pressable
        onPress={onView}
        className="flex-row items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 active:border-orange-300 dark:border-stone-700 dark:bg-stone-800"
      >
        {/* Cover Thumbnail */}
        <View className="relative h-16 w-16 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-700">
          <Image
            source={{ uri: cookbook.coverUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="font-semibold text-stone-900 dark:text-white"
              numberOfLines={1}
            >
              {cookbook.name}
            </Text>
            {cookbook.isBuiltIn && (
              <View className="rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900/30">
                <Text className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">
                  Built-in
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm text-stone-500 dark:text-stone-400"
            numberOfLines={1}
          >
            {cookbook.recipeCount}{" "}
            {cookbook.recipeCount === 1 ? "recipe" : "recipes"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-stone-100 dark:active:bg-stone-700"
          >
            <Share2 className="h-4 w-4 text-stone-400" />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-lg active:bg-stone-100 dark:active:bg-stone-700"
          >
            <Pencil className="h-4 w-4 text-stone-400" />
          </Pressable>
          {!cookbook.isBuiltIn && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="h-8 w-8 items-center justify-center rounded-lg active:bg-red-50 dark:active:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4 text-stone-400" />
            </Pressable>
          )}
        </View>

        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-stone-300 dark:text-stone-600" />
      </Pressable>
    );
  }

  // Grid view
  return (
    <Pressable
      onPress={onView}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white active:border-orange-300 dark:border-stone-700 dark:bg-stone-800"
    >
      {/* Cover Image */}
      <View className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-700">
        <Image
          source={{ uri: cookbook.coverUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Recipe Count Badge */}
        <View className="absolute bottom-3 left-3 flex-row items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 dark:bg-stone-900/90">
          <Text className="text-sm font-medium text-stone-900 dark:text-white">
            {cookbook.recipeCount}
          </Text>
        </View>

        {/* Built-in Badge */}
        {cookbook.isBuiltIn && (
          <View className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-0.5">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-white">
              Built-in
            </Text>
          </View>
        )}

        {/* Action Menu */}
        <View className="absolute right-3 top-3 flex-row gap-1">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90"
          >
            <Share2 className="h-4 w-4 text-stone-600 dark:text-stone-300" />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90"
          >
            <Pencil className="h-4 w-4 text-stone-600 dark:text-stone-300" />
          </Pressable>
          {!cookbook.isBuiltIn && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/90 active:bg-red-50 dark:bg-stone-900/90"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Info */}
      <View className="p-4">
        <Text
          className="font-bold text-stone-900 dark:text-white"
          numberOfLines={1}
        >
          {cookbook.name}
        </Text>
        <Text
          className="mt-1 text-sm text-stone-500 dark:text-stone-400"
          numberOfLines={1}
        >
          {cookbook.description}
        </Text>
        <Text className="mt-2 text-xs text-stone-400 dark:text-stone-500">
          Updated {formatDate(cookbook.updatedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * NewCookbookCard Component
 *
 * Dashed placeholder card for creating a new cookbook in grid view.
 */
interface NewCookbookCardProps {
  onPress: () => void;
}

export function NewCookbookCard({ onPress }: NewCookbookCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="aspect-[4/3] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 active:border-orange-400 dark:border-stone-600"
    >
      <View className="h-8 w-8 items-center justify-center">
        <Text className="text-2xl text-stone-400 dark:text-stone-500">+</Text>
      </View>
      <Text className="text-sm font-medium text-stone-400 dark:text-stone-500">
        New Cookbook
      </Text>
    </Pressable>
  );
}
