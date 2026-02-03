/**
 * App Layout (Protected Routes)
 *
 * Layout wrapper for authenticated app screens.
 * Handles authentication checks, onboarding status, and navigation guards.
 */

import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, ActivityIndicator } from "react-native";

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);

  // Show loading state while checking auth status
  if (!isLoaded) {
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

  // Show loading while fetching user data
  if (currentUser === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Route new users to onboarding
  if (currentUser && !currentUser.hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // User not found in Convex yet (waiting for webhook)
  // This can happen if the webhook hasn't processed yet
  if (currentUser === null) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fafaf9", // stone-50
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="recipes" />
      <Stack.Screen name="cookbooks" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="meal-planner" />
      <Stack.Screen name="shopping" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
