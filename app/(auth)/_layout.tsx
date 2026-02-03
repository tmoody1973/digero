/**
 * Auth Layout
 *
 * Layout wrapper for authentication screens (sign-in, sign-up, forgot-password).
 * Provides consistent styling and prevents authenticated users from accessing.
 */

import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Redirect authenticated users to the main app
  if (isSignedIn) {
    return <Redirect href="/(app)" />;
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
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
