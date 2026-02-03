/**
 * Feature 2: Cookbook Organization
 *
 * Onboarding screen explaining cookbook organization feature.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { FeatureScreen } from "@/components/onboarding/FeatureScreen";

export default function Feature2Screen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={2}
      totalSteps={5}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <FeatureScreen
        iconName="book"
        title="Organize into Cookbooks"
        description="Create custom cookbooks to organize your recipes by cuisine, occasion, or any way you like. Stay organized and find recipes fast."
        onNext={() => router.push("/(onboarding)/feature-3")}
      />
    </OnboardingContainer>
  );
}
