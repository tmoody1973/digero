/**
 * Settings Screen
 *
 * User settings including subscription management, account info, and logout.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DeleteAccountConfirmation } from "@/components/auth/DeleteAccountConfirmation";
import { SubscriptionSection } from "@/components/subscription/SubscriptionSection";
import { TabBar } from "@/components/navigation";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [signOut, router]);

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="py-6">
        {/* Subscription Section */}
        <SubscriptionSection />

        {/* Account Section */}
        <View className="mb-6">
          <Text className="px-6 text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Account
          </Text>
          <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
            <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
              <Text className="text-base text-stone-900 dark:text-stone-100">
                {currentUser?.name ?? "Loading..."}
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {currentUser?.email ?? ""}
              </Text>
            </View>

            {/* Profile Info */}
            {currentUser && (
              <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
                <Text className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                  Cooking Level
                </Text>
                <Text className="text-base text-stone-900 dark:text-stone-100 capitalize">
                  {currentUser.cookingSkillLevel ?? "Not set"}
                </Text>
              </View>
            )}

            {currentUser && currentUser.dietaryRestrictions.length > 0 && (
              <View className="px-6 py-4">
                <Text className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                  Dietary Restrictions
                </Text>
                <Text className="text-base text-stone-900 dark:text-stone-100">
                  {currentUser.dietaryRestrictions
                    .map((r) => r.replace(/-/g, " "))
                    .join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions Section */}
        <View className="mb-6">
          <Text className="px-6 text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Actions
          </Text>
          <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
            <Pressable
              onPress={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-4 flex-row items-center justify-between border-b border-stone-100 dark:border-stone-800"
            >
              <Text className="text-base text-stone-900 dark:text-stone-100">
                Log Out
              </Text>
              {isLoggingOut && <ActivityIndicator size="small" color="#f97316" />}
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <Text className="px-6 text-sm font-medium text-red-500 uppercase tracking-wider mb-2">
            Danger Zone
          </Text>
          <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
            <Pressable
              onPress={() => setShowDeleteConfirmation(true)}
              className="px-6 py-4"
            >
              <Text className="text-base text-red-500">Delete Account</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                Permanently delete your account and all data
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Dialog */}
      <DeleteAccountConfirmation
        visible={showDeleteConfirmation}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          // Will be implemented in Task Group 8
          setShowDeleteConfirmation(false);
        }}
      />

      {/* Bottom Tab Bar */}
      <TabBar />
    </View>
  );
}
