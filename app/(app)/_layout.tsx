/**
 * App Layout (Protected Routes)
 *
 * Layout wrapper for authenticated app screens.
 * Handles authentication checks, onboarding status, and navigation guards.
 */

import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, ActivityIndicator, Text } from "react-native";
import { useEffect, useState } from "react";

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const ensureUserExists = useMutation(api.users.ensureUserExists);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreationError, setUserCreationError] = useState<string | null>(null);

  // Debug logging
  console.log("[AppLayout] isLoaded:", isLoaded, "isSignedIn:", isSignedIn, "currentUser:", currentUser);

  // Auto-create user if they don't exist
  useEffect(() => {
    if (currentUser === null && isSignedIn && !isCreatingUser) {
      console.log("[AppLayout] User not found, creating...");
      setIsCreatingUser(true);
      ensureUserExists()
        .then(() => {
          console.log("[AppLayout] User created successfully");
          setIsCreatingUser(false);
        })
        .catch((error) => {
          console.error("[AppLayout] Failed to create user:", error);
          setUserCreationError(error.message);
          setIsCreatingUser(false);
        });
    }
  }, [currentUser, isSignedIn, isCreatingUser, ensureUserExists]);

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

  // User creation error
  if (userCreationError) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
        <Text className="text-red-500 text-center mb-4">Failed to initialize user: {userCreationError}</Text>
        <Text className="text-stone-600 dark:text-stone-400 text-center">Please try signing out and signing back in.</Text>
      </View>
    );
  }

  // User not found in Convex yet - creating...
  if (currentUser === null || isCreatingUser) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-stone-600 dark:text-stone-400 mt-4">Setting up your account...</Text>
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
      <Stack.Screen name="cookbooks/index" />
      <Stack.Screen name="cookbooks/[id]" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="meal-planner/index" />
      <Stack.Screen name="shopping/index" />
      <Stack.Screen name="shopping/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
