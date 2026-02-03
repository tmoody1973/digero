/**
 * SwipeableRecipeCard Component
 *
 * Recipe card with swipe-to-delete functionality.
 */

import { useRef, useCallback } from "react";
import { View, Text, Pressable, Alert, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2 } from "lucide-react-native";
import { RecipeCard } from "./RecipeCard";
import type { ViewMode } from "./ViewModeToggle";
import { Id } from "@/convex/_generated/dataModel";

type RecipeSource = "youtube" | "website" | "scanned" | "manual";

interface Recipe {
  _id: Id<"recipes">;
  title: string;
  source: RecipeSource;
  imageUrl: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  isFavorited: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  physicalCookbook?: {
    name: string;
  } | null;
}

interface SwipeableRecipeCardProps {
  recipe: Recipe;
  viewMode: ViewMode;
  onPress: () => void;
  onDelete: () => void;
}

export function SwipeableRecipeCard({
  recipe,
  viewMode,
  onPress,
  onDelete,
}: SwipeableRecipeCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Recipe?",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            swipeableRef.current?.close();
            onDelete();
          },
        },
      ]
    );
  }, [onDelete]);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: "clamp",
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          opacity,
        }}
        className="flex-row items-center"
      >
        <Pressable
          onPress={handleDelete}
          className="h-full items-center justify-center bg-red-500 px-6"
        >
          <Trash2 className="h-6 w-6 text-white" />
          <Text className="mt-1 text-sm font-medium text-white">Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  // For grid view, don't enable swipe (it doesn't work well with grid layout)
  if (viewMode === "grid") {
    return <RecipeCard recipe={recipe} viewMode={viewMode} onPress={onPress} />;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <RecipeCard recipe={recipe} viewMode={viewMode} onPress={onPress} />
    </Swipeable>
  );
}
