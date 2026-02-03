/**
 * Feature 1: Recipe Saving
 *
 * Onboarding screen explaining recipe saving feature.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { FeatureScreen } from "@/components/onboarding/FeatureScreen";

export default function Feature1Screen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={1}
      totalSteps={5}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <FeatureScreen
        iconName="bookmark"
        title="Save Recipes from Anywhere"
        description="Import recipes from YouTube videos, websites, or scan them from your physical cookbooks. All your recipes in one place."
        onNext={() => router.push("/(onboarding)/feature-2")}
      />
    </OnboardingContainer>
  );
}
