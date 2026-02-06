/**
 * Feature 4: Shopping Lists
 *
 * Onboarding screen explaining shopping list feature.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { FeatureScreen } from "@/components/onboarding/FeatureScreen";

export default function Feature4Screen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={4}
      totalSteps={6}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <FeatureScreen
        iconName="list"
        title="Generate Shopping Lists"
        description="Automatically create shopping lists from your meal plan. Check off items as you shop, and never forget an ingredient again."
        onNext={() => router.push("/(onboarding)/free-tier")}
        nextLabel="Continue"
      />
    </OnboardingContainer>
  );
}
