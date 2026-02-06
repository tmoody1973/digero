/**
 * Feature 3: Meal Planning
 *
 * Onboarding screen explaining meal planning feature.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { FeatureScreen } from "@/components/onboarding/FeatureScreen";

export default function Feature3Screen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={3}
      totalSteps={6}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <FeatureScreen
        iconName="calendar"
        title="Plan Your Weekly Meals"
        description="Drag and drop recipes onto your weekly calendar. Plan breakfast, lunch, dinner, and snacks for the whole week ahead."
        onNext={() => router.push("/(onboarding)/feature-4")}
      />
    </OnboardingContainer>
  );
}
