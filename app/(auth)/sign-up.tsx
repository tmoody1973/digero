/**
 * Sign Up Screen
 *
 * Provides email/password registration with Apple and Google OAuth options.
 * Uses Clerk for authentication handling.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthInput } from "@/components/auth/AuthInput";
import { DigeroLogo } from "@/components/brand";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // OAuth strategies
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });

  // Handle email/password sign up
  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      // Split name into first and last
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") ?? "";

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "An error occurred during sign up";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, name, email, password]);

  // Handle email verification
  const handleVerification = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Route to onboarding for new users
        router.replace("/(onboarding)");
      } else {
        console.log("Additional verification steps required:", result.status);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Verification failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, setActive, verificationCode, router]);

  // Handle Apple OAuth
  const handleAppleSignUp = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setOAuthActive } = await startAppleFlow();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        // Route to onboarding for new users
        router.replace("/(onboarding)");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Apple sign up failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startAppleFlow, router]);

  // Handle Google OAuth
  const handleGoogleSignUp = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: setOAuthActive } = await startGoogleFlow();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        // Route to onboarding for new users
        router.replace("/(onboarding)");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Google sign up failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleFlow, router]);

  // Render verification screen
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-orange-500 mb-2">
              Verify Email
            </Text>
            <Text className="text-base text-stone-600 dark:text-stone-400 text-center">
              We've sent a verification code to{"\n"}
              <Text className="font-semibold">{email}</Text>
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <Text className="text-red-600 dark:text-red-400 text-center">
                {error}
              </Text>
            </View>
          )}

          <View className="mb-6">
            <AuthInput
              label="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />

            <Pressable
              onPress={handleVerification}
              disabled={isLoading || verificationCode.length < 6}
              className={`rounded-xl py-4 items-center shadow-sm ${
                isLoading || verificationCode.length < 6
                  ? "bg-stone-300 dark:bg-stone-700"
                  : "bg-orange-500 active:bg-orange-600"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Verify Email
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => setPendingVerification(false)}
            className="self-center"
          >
            <Text className="text-stone-500 text-sm">
              Go back
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
            Create your account
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

        {/* Registration Form */}
        <View className="mb-6">
          <AuthInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
          />

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
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            hint="Must be at least 8 characters"
          />

          {/* Create Account Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading || !name || !email || !password}
            className={`rounded-xl py-4 items-center shadow-sm ${
              isLoading || !name || !email || !password
                ? "bg-stone-300 dark:bg-stone-700"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Account
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
            onPress={handleAppleSignUp}
            disabled={isLoading}
          />
          <OAuthButton
            provider="google"
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          />
        </View>

        {/* Sign In Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-stone-600 dark:text-stone-400">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-orange-500 font-semibold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
