/**
 * Feature Screen Component
 *
 * Reusable feature introduction screen for onboarding.
 */

import { View, Text, Pressable } from "react-native";

interface FeatureScreenProps {
  iconName: string;
  title: string;
  description: string;
  onNext: () => void;
  nextLabel?: string;
}

// Simple icon map using emoji (would be replaced with proper icons)
const iconMap: Record<string, string> = {
  bookmark: "",
  book: "",
  calendar: "",
  list: "",
};

export function FeatureScreen({
  iconName,
  title,
  description,
  onNext,
  nextLabel = "Next",
}: FeatureScreenProps) {
  const icon = iconMap[iconName] ?? "";

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Icon/Illustration */}
      <View className="w-48 h-48 bg-orange-100 dark:bg-orange-900/30 rounded-full items-center justify-center mb-8">
        <Text className="text-5xl">{icon}</Text>
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center mb-4">
        {title}
      </Text>

      {/* Description */}
      <Text className="text-base text-stone-600 dark:text-stone-400 text-center mb-8 leading-6">
        {description}
      </Text>

      {/* Next Button */}
      <Pressable
        onPress={onNext}
        className="bg-orange-500 active:bg-orange-600 rounded-xl py-4 px-8 shadow-sm"
      >
        <Text className="text-white font-semibold text-base">{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
