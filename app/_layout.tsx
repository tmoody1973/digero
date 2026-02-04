// Polyfill MUST be first import for Speechmatics Flow SDK
import "event-target-polyfill";

/**
 * Root Layout
 *
 * Sets up ClerkProvider for authentication, ConvexProvider for backend,
 * and SubscriptionProvider for RevenueCat subscription management.
 * Manages the global authentication state, navigation structure, and deep linking.
 */

import "../global.css";
import { useEffect, useCallback } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { ShareIntentProvider } from "expo-share-intent";
import { tokenCache } from "@/lib/token-cache";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Initialize Convex client
const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

// Get Clerk publishable key from environment
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment variables."
  );
}

/**
 * Initial Layout Component
 *
 * Handles initial navigation based on authentication state and deep links.
 */
function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Debug logging
  console.log("[Auth Debug] isLoaded:", isLoaded, "isSignedIn:", isSignedIn, "segments:", JSON.stringify(segments));

  /**
   * Auth-based navigation
   */
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inAppGroup = segments[0] === "(app)";

    if (!isSignedIn && !inAuthGroup) {
      // User is not signed in and not in auth group
      // Redirect to sign-in
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      // User is signed in but still in auth group
      // Redirect to app (which will handle onboarding check)
      router.replace("/(app)");
    }
  }, [isSignedIn, isLoaded, segments]);

  // Show loading screen while Clerk initializes
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  console.log("[RootLayout] Rendering...");
  return (
    <ShareIntentProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider>
            <SubscriptionProvider>
              <InitialLayout />
            </SubscriptionProvider>
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ShareIntentProvider>
  );
}
