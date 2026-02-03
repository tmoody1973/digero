/**
 * Onboarding Layout
 *
 * Layout wrapper for onboarding screens.
 * Checks if user has already completed onboarding and redirects accordingly.
 */

import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, ActivityIndicator } from "react-native";

export default function OnboardingLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const hasCompletedOnboarding = useQuery(api.users.hasCompletedOnboarding);

  // Show loading state while checking auth and onboarding status
  if (!isLoaded || hasCompletedOnboarding === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Redirect unauthenticated users to sign-in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Skip onboarding if already completed
  if (hasCompletedOnboarding === true) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fafaf9", // stone-50
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="feature-1" />
      <Stack.Screen name="feature-2" />
      <Stack.Screen name="feature-3" />
      <Stack.Screen name="feature-4" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
