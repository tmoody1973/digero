/**
 * Sign In Screen
 *
 * Provides email/password authentication with Apple and Google OAuth options.
 * Uses Clerk for authentication handling.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthInput } from "@/components/auth/AuthInput";
import { DigeroLogo } from "@/components/brand";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth strategies
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });

  // Handle email/password sign in
  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)");
      } else {
        // Handle additional steps if needed (e.g., MFA)
        console.log("Additional sign-in steps required:", result.status);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "An error occurred during sign in";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, email, password, router]);

  // Handle Apple OAuth
  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setOAuthActive } = await startAppleFlow();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(app)");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Apple sign in failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startAppleFlow, router]);

  // Handle Google OAuth
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setOAuthActive } = await startGoogleFlow();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(app)");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Google sign in failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleFlow, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Title */}
        <View className="items-center mb-10">
          <DigeroLogo width={140} height={62} />
          <Text className="text-lg text-stone-600 dark:text-stone-400 mt-3">
            Welcome back
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <Text className="text-red-600 dark:text-red-400 text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Email/Password Form */}
        <View className="mb-6">
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          {/* Forgot Password Link */}
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="self-end mb-6">
              <Text className="text-orange-500 text-sm font-medium">
                Forgot password?
              </Text>
            </Pressable>
          </Link>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading || !email || !password}
            className={`rounded-xl py-4 items-center shadow-sm ${
              isLoading || !email || !password
                ? "bg-stone-300 dark:bg-stone-700"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <AuthDivider />

        {/* OAuth Buttons */}
        <View className="space-y-3 mb-8">
          <OAuthButton
            provider="apple"
            onPress={handleAppleSignIn}
            disabled={isLoading}
          />
          <OAuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          />
        </View>

        {/* Sign Up Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-stone-600 dark:text-stone-400">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="text-orange-500 font-semibold">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
