/**
 * Forgot Password Screen
 *
 * Allows users to reset their password via email.
 * Uses Clerk's built-in password reset flow.
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
import { useSignIn } from "@clerk/clerk-expo";
import { AuthInput } from "@/components/auth/AuthInput";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();

  // Form state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState(false);

  // Handle sending reset code
  const handleSendResetCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setPendingReset(true);
      setSuccessMessage("Reset code sent! Check your email.");
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Failed to send reset code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, email]);

  // Handle resetting password
  const handleResetPassword = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        setSuccessMessage("Password reset successful!");
        // Navigate to sign in after a brief delay
        setTimeout(() => {
          router.replace("/(auth)/sign-in");
        }, 1500);
      } else if (result.status === "needs_second_factor") {
        setError("Two-factor authentication required");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const errorMessage =
        clerkError.errors?.[0]?.message ?? "Failed to reset password";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, code, newPassword, router]);

  // Render reset form (code + new password)
  if (pendingReset) {
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
              Reset Password
            </Text>
            <Text className="text-base text-stone-600 dark:text-stone-400 text-center">
              Enter the code sent to{"\n"}
              <Text className="font-semibold">{email}</Text>
            </Text>
          </View>

          {/* Success Message */}
          {successMessage && (
            <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <Text className="text-green-600 dark:text-green-400 text-center">
                {successMessage}
              </Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <Text className="text-red-600 dark:text-red-400 text-center">
                {error}
              </Text>
            </View>
          )}

          <View className="mb-6">
            <AuthInput
              label="Reset Code"
              value={code}
              onChangeText={setCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />

            <AuthInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              hint="Must be at least 8 characters"
            />

            <Pressable
              onPress={handleResetPassword}
              disabled={isLoading || code.length < 6 || newPassword.length < 8}
              className={`rounded-xl py-4 items-center shadow-sm ${
                isLoading || code.length < 6 || newPassword.length < 8
                  ? "bg-stone-300 dark:bg-stone-700"
                  : "bg-orange-500 active:bg-orange-600"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Reset Password
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setPendingReset(false);
              setCode("");
              setNewPassword("");
              setError(null);
              setSuccessMessage(null);
            }}
            className="self-center"
          >
            <Text className="text-stone-500 text-sm">
              Try a different email
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
        {/* Title */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-orange-500 mb-2">
            Forgot Password
          </Text>
          <Text className="text-base text-stone-600 dark:text-stone-400 text-center">
            Enter your email and we'll send you{"\n"}a code to reset your password
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

        {/* Email Form */}
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

          <Pressable
            onPress={handleSendResetCode}
            disabled={isLoading || !email}
            className={`rounded-xl py-4 items-center shadow-sm ${
              isLoading || !email
                ? "bg-stone-300 dark:bg-stone-700"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Send Reset Code
              </Text>
            )}
          </Pressable>
        </View>

        {/* Back to Sign In */}
        <View className="flex-row items-center justify-center">
          <Text className="text-stone-600 dark:text-stone-400">
            Remember your password?{" "}
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
