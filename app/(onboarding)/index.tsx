/**
 * Onboarding Welcome Screen
 *
 * First screen in onboarding flow, welcomes user and starts feature tour.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { DigeroLogo } from "@/components/brand";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={0}
      totalSteps={6}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-8">
          <DigeroLogo width={200} height={89} />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100 text-center mb-4">
          Welcome!
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
