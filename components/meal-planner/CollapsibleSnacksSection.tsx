/**
 * CollapsibleSnacksSection Component
 *
 * Collapsible section for the snacks meal slot.
 * Collapsed by default to reduce visual clutter.
 * Includes expand/collapse animation using react-native-reanimated.
 */

import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ChevronDown, Cookie } from "lucide-react-native";
import { MealSlotCard } from "./MealSlotCard";
import type { CollapsibleSnacksSectionProps } from "@/types/meal-planner";

export function CollapsibleSnacksSection({
  isExpanded,
  meal,
  isSelectionMode,
  isSelected,
  isDragTarget,
  onToggle,
  onSlotTap,
  onMealRemove,
  onMealSelect,
  onViewRecipe,
  onLongPress,
}: CollapsibleSnacksSectionProps) {
  // Animate the chevron rotation
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(isExpanded ? "180deg" : "0deg", {
          duration: 200,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }));

  // Animate the content height
  const contentStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 80 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
    opacity: withTiming(isExpanded ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    }),
  }));

  return (
    <View className="border-t border-stone-100 dark:border-stone-800">
      {/* Toggle Header */}
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between py-3"
        accessibilityLabel={`Snacks section, ${isExpanded ? "expanded" : "collapsed"}${meal ? ", has meal" : ""}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View className="flex-row items-center gap-2">
          <Cookie className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          <Text className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Snacks
          </Text>
          {meal && !isExpanded && (
            <View className="h-2 w-2 rounded-full bg-orange-500" />
          )}
        </View>

        <Animated.View style={chevronStyle}>
          <ChevronDown className="h-4 w-4 text-stone-400 dark:text-stone-500" />
        </Animated.View>
      </Pressable>

      {/* Collapsible Content */}
      <Animated.View style={contentStyle} className="overflow-hidden">
        <View className="pb-3">
          <MealSlotCard
            meal={meal}
            day=""
            slot="snacks"
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            isDragTarget={isDragTarget}
            onTap={onSlotTap}
            onRemove={onMealRemove}
            onToggleSelect={onMealSelect}
            onViewRecipe={onViewRecipe}
            onLongPress={onLongPress}
          />
        </View>
      </Animated.View>
    </View>
  );
}
