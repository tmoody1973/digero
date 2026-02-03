/**
 * OnboardingOverlay Component
 *
 * First-time user overlay explaining how to add recipes to the meal planner.
 * Shows hints for both tap-to-assign and drag-and-drop interactions.
 * Dismissible with "Got it" button.
 */

import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { MousePointerClick, Hand, Sparkles } from "lucide-react-native";
import type { OnboardingOverlayProps } from "@/types/meal-planner";

export function OnboardingOverlay({
  isVisible,
  onDismiss,
}: OnboardingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 items-center justify-center bg-black/60 px-6"
    >
      <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-stone-800">
        {/* Icon */}
        <View className="mb-4 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Sparkles className="h-8 w-8 text-orange-500" />
          </View>
        </View>

        {/* Title */}
        <Text className="mb-2 text-center text-xl font-bold text-stone-900 dark:text-white">
          Welcome to Meal Planning!
        </Text>

        <Text className="mb-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Plan your meals for the week with these simple actions:
        </Text>

        {/* Tips */}
        <View className="mb-6 gap-4">
          {/* Tap to Add */}
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
              <MousePointerClick className="h-5 w-5 text-stone-600 dark:text-stone-300" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-stone-900 dark:text-white">
                Tap a slot to add a recipe
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                Choose from your saved recipes
              </Text>
            </View>
          </View>

          {/* Drag and Drop */}
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
              <Hand className="h-5 w-5 text-stone-600 dark:text-stone-300" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-stone-900 dark:text-white">
                Drag recipes to rearrange
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                Long-press and drag to move meals
              </Text>
            </View>
          </View>
        </View>

        {/* Dismiss Button */}
        <Pressable
          onPress={onDismiss}
          className="items-center rounded-xl bg-orange-500 py-4 active:bg-orange-600"
          accessibilityLabel="Dismiss onboarding"
          accessibilityRole="button"
        >
          <Text className="text-base font-semibold text-white">Got it!</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
