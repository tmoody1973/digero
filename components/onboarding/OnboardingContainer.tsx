/**
 * Onboarding Container Component
 *
 * Wrapper for onboarding screens with progress dots and skip button.
 */

import { View, Text, Pressable, SafeAreaView } from "react-native";

interface OnboardingContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
}

export function OnboardingContainer({
  children,
  currentStep,
  totalSteps,
  onSkip,
}: OnboardingContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-4">
        <Pressable onPress={onSkip} className="py-2 px-4">
          <Text className="text-stone-500 dark:text-stone-400 font-medium">
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1">{children}</View>

      {/* Progress Dots */}
      <View className="flex-row justify-center pb-8 gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              index === currentStep
                ? "bg-orange-500"
                : index < currentStep
                ? "bg-orange-300"
                : "bg-stone-300 dark:bg-stone-600"
            }`}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
