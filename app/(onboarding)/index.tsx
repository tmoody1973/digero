/**
 * Onboarding Welcome Screen
 *
 * First screen in onboarding flow, welcomes user and starts feature tour.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={0}
      totalSteps={5}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Illustration placeholder */}
        <View className="w-64 h-64 bg-orange-100 dark:bg-orange-900/30 rounded-full items-center justify-center mb-8">
          <Text className="text-6xl">
            {/* Chef hat emoji placeholder */}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100 text-center mb-4">
          Welcome to Digero!
        </Text>

        {/* Description */}
        <Text className="text-lg text-stone-600 dark:text-stone-400 text-center mb-8">
          Your personal recipe manager.{"\n"}Let's take a quick tour of what you can do.
        </Text>

        {/* Get Started Button */}
        <Pressable
          onPress={() => router.push("/(onboarding)/feature-1")}
          className="bg-orange-500 active:bg-orange-600 rounded-xl py-4 px-8 shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Get Started
          </Text>
        </Pressable>
      </View>
    </OnboardingContainer>
  );
}
