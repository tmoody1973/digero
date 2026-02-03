/**
 * SkeletonRecipeCard Component
 *
 * Placeholder card with shimmer animation while loading.
 */

import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import type { ViewMode } from "./ViewModeToggle";

interface SkeletonRecipeCardProps {
  viewMode: ViewMode;
}

function ShimmerView({ className }: { className?: string }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{ opacity }}
      className={`bg-stone-200 dark:bg-stone-700 ${className}`}
    />
  );
}

export function SkeletonRecipeCard({ viewMode }: SkeletonRecipeCardProps) {
  if (viewMode === "list") {
    return (
      <View className="flex-row items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-800">
        {/* Thumbnail */}
        <ShimmerView className="h-20 w-20 rounded-lg" />

        {/* Content */}
        <View className="flex-1 gap-2">
          <ShimmerView className="h-5 w-3/4 rounded" />
          <ShimmerView className="h-4 w-1/2 rounded" />
          <ShimmerView className="h-3 w-2/3 rounded" />
        </View>
      </View>
    );
  }

  // Grid view
  return (
    <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      {/* Image placeholder */}
      <ShimmerView className="aspect-[4/3] w-full" />

      {/* Content */}
      <View className="gap-2 p-4">
        <ShimmerView className="h-5 w-full rounded" />
        <ShimmerView className="h-4 w-3/4 rounded" />
        <ShimmerView className="h-3 w-1/2 rounded" />
      </View>
    </View>
  );
}
