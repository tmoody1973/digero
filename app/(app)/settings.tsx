/**
 * Settings Screen
 *
 * User settings including subscription management, account info,
 * creator partnership status, dev tools, and logout.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sun,
  Moon,
  Smartphone,
  Check,
  Youtube,
  LayoutDashboard,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Database,
  Trash2,
  ShoppingBag,
} from "lucide-react-native";
import { DeleteAccountConfirmation } from "@/components/auth/DeleteAccountConfirmation";
import { SubscriptionSection } from "@/components/subscription/SubscriptionSection";
import { TabBar } from "@/components/navigation";
import { useTheme } from "@/contexts/ThemeContext";

type ThemeMode = "light" | "dark" | "system";

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Smartphone },
];

// Show dev tools in development mode
const __DEV__ = process.env.NODE_ENV !== "production";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { themeMode, setThemeMode, isDark } = useTheme();

  // Fetch creator profile status
  const creatorProfile = useQuery(
    api.creator.getCreatorProfile,
    userId ? { userId } : "skip"
  );

  // Demo data seeding mutations
  const seedDemoData = useMutation(api.seed.creatorDemo.seedDemoData);
  const clearDemoData = useMutation(api.seed.creatorDemo.clearDemoData);
  const demoDataStatus = useQuery(api.seed.creatorDemo.checkDemoDataExists);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

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

  // Navigate to creator application
  const handleApplyForCreator = useCallback(() => {
    router.push("/(app)/creator/apply");
  }, [router]);

  // Navigate to creator dashboard
  const handleOpenCreatorDashboard = useCallback(() => {
    router.push("/(app)/creator");
  }, [router]);

  // Navigate to purchases
  const handleViewPurchases = useCallback(() => {
    router.push("/(app)/settings/purchases");
  }, [router]);

  // Handle seeding demo data
  const handleSeedDemoData = useCallback(async () => {
    setIsSeedingData(true);
    try {
      const result = await seedDemoData();
      if (result.alreadySeeded) {
        Alert.alert(
          "Demo Data Exists",
          "Demo data has already been seeded. Clear it first to reseed."
        );
      } else {
        Alert.alert(
          "Demo Data Seeded",
          `Successfully created demo data for Eitan Bernath:\n\n` +
            `- Products: ${result.summary.products}\n` +
            `- Recipes: ${result.summary.recipes}\n` +
            `- Engagement Records: ${result.summary.engagementRecords}\n` +
            `- Estimated Earnings: ${result.estimatedEarnings?.formattedTotal || "N/A"}`
        );
      }
    } catch (error) {
      console.error("Failed to seed demo data:", error);
      Alert.alert("Error", "Failed to seed demo data. Check console for details.");
    } finally {
      setIsSeedingData(false);
    }
  }, [seedDemoData]);

  // Handle clearing demo data
  const handleClearDemoData = useCallback(async () => {
    Alert.alert(
      "Clear Demo Data",
      "This will delete all demo data including Eitan's creator profile, products, recipes, and engagement data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setIsClearingData(true);
            try {
              await clearDemoData();
              Alert.alert("Success", "Demo data cleared successfully.");
            } catch (error) {
              console.error("Failed to clear demo data:", error);
              Alert.alert("Error", "Failed to clear demo data.");
            } finally {
              setIsClearingData(false);
            }
          },
        },
      ]
    );
  }, [clearDemoData]);

  /**
   * Render creator partnership section based on application status
   */
  const renderCreatorSection = () => {
    // Loading state
    if (creatorProfile === undefined) {
      return (
        <View className="px-6 py-4 flex-row items-center">
          <ActivityIndicator size="small" color="#f97316" />
          <Text className="ml-3 text-stone-500 dark:text-stone-400">Loading...</Text>
        </View>
      );
    }

    // Not applied - show CTA
    if (creatorProfile === null) {
      return (
        <Pressable
          onPress={handleApplyForCreator}
          className="px-6 py-4 flex-row items-center active:bg-stone-50 dark:active:bg-stone-800"
        >
          <View className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 mr-3">
            <Youtube size={20} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
              Become a Creator Partner
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              Earn revenue from your recipes
            </Text>
          </View>
          <ChevronRight size={20} className="text-stone-400" />
        </Pressable>
      );
    }

    // Application pending
    if (creatorProfile.applicationStatus === "pending") {
      return (
        <View className="px-6 py-4">
          <View className="flex-row items-center mb-2">
            <View className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2 mr-3">
              <Clock size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                Application Pending
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {creatorProfile.channelName}
              </Text>
            </View>
          </View>
          <View className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 ml-11">
            <Text className="text-xs text-amber-700 dark:text-amber-300">
              Your creator partnership application is being reviewed. We'll notify you once it's been processed.
            </Text>
          </View>
        </View>
      );
    }

    // Application approved - show Dashboard link
    if (creatorProfile.applicationStatus === "approved") {
      return (
        <View>
          {/* Creator Status Badge */}
          <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            <View className="flex-row items-center">
              <View className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3">
                <CheckCircle size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                  {creatorProfile.channelName}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      creatorProfile.tier === "partner"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : creatorProfile.tier === "established"
                          ? "bg-violet-100 dark:bg-violet-900/30"
                          : "bg-teal-100 dark:bg-teal-900/30"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium capitalize ${
                        creatorProfile.tier === "partner"
                          ? "text-amber-700 dark:text-amber-300"
                          : creatorProfile.tier === "established"
                            ? "text-violet-700 dark:text-violet-300"
                            : "text-teal-700 dark:text-teal-300"
                      }`}
                    >
                      {creatorProfile.tier} Creator
                    </Text>
                  </View>
                  <Text className="text-xs text-stone-500 dark:text-stone-400 ml-2">
                    {creatorProfile.resMultiplier}x RES
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Creator Dashboard Link */}
          <Pressable
            onPress={handleOpenCreatorDashboard}
            className="px-6 py-4 flex-row items-center active:bg-stone-50 dark:active:bg-stone-800"
          >
            <View className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 mr-3">
              <LayoutDashboard size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                Creator Dashboard
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                View earnings, analytics & shop
              </Text>
            </View>
            <ChevronRight size={20} className="text-stone-400" />
          </Pressable>
        </View>
      );
    }

    // Application rejected - show reapply option
    if (creatorProfile.applicationStatus === "rejected") {
      return (
        <View className="px-6 py-4">
          <View className="flex-row items-center mb-2">
            <View className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-3">
              <XCircle size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                Application Not Approved
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {creatorProfile.channelName}
              </Text>
            </View>
          </View>
          <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 ml-11 mb-3">
            <Text className="text-xs text-red-700 dark:text-red-300">
              Your application was not approved at this time. You may reapply after addressing the requirements.
            </Text>
          </View>
          <Pressable
            onPress={handleApplyForCreator}
            className="ml-11 bg-stone-100 dark:bg-stone-800 rounded-lg py-2 px-4 self-start active:bg-stone-200 dark:active:bg-stone-700"
          >
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Reapply
            </Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

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

        {/* Creator Partnership Section */}
        <View className="mb-6">
          <Text className="px-6 text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Creator Partnership
          </Text>
          <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
            {renderCreatorSection()}
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="px-6 text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Appearance
          </Text>
          <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
            <View className="flex-row">
              {themeOptions.map((option, index) => {
                const Icon = option.icon;
                const isSelected = themeMode === option.mode;
                return (
                  <Pressable
                    key={option.mode}
                    onPress={() => setThemeMode(option.mode)}
                    className={`flex-1 items-center py-4 ${
                      index < themeOptions.length - 1
                        ? "border-r border-stone-100 dark:border-stone-800"
                        : ""
                    }`}
                  >
                    <View
                      className={`mb-2 rounded-full p-2 ${
                        isSelected
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-stone-100 dark:bg-stone-800"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          isSelected
                            ? "text-orange-500"
                            : "text-stone-500 dark:text-stone-400"
                        }
                      />
                    </View>
                    <Text
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-orange-500"
                          : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Check size={14} className="text-orange-500 mt-1" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

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
              <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
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

            {/* My Purchases Link */}
            <Pressable
              onPress={handleViewPurchases}
              className="px-6 py-4 flex-row items-center active:bg-stone-50 dark:active:bg-stone-800"
            >
              <View className="bg-stone-100 dark:bg-stone-800 rounded-full p-2 mr-3">
                <ShoppingBag size={20} color="#78716c" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                  My Purchases
                </Text>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  View order history and downloads
                </Text>
              </View>
              <ChevronRight size={20} className="text-stone-400" />
            </Pressable>
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

        {/* Dev Tools Section (only in development) */}
        {__DEV__ && (
          <View className="mb-6">
            <Text className="px-6 text-sm font-medium text-violet-500 uppercase tracking-wider mb-2">
              Dev Tools
            </Text>
            <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
              {/* Demo Data Status */}
              <View className="px-6 py-3 border-b border-stone-100 dark:border-stone-800">
                <Text className="text-xs text-stone-500 dark:text-stone-400">
                  Demo Data Status:{" "}
                  <Text className={demoDataStatus?.hasCreatorProfile ? "text-green-500" : "text-stone-400"}>
                    {demoDataStatus?.hasCreatorProfile ? "Seeded" : "Not Seeded"}
                  </Text>
                </Text>
              </View>

              {/* Seed Demo Data Button */}
              <Pressable
                onPress={handleSeedDemoData}
                disabled={isSeedingData}
                className="px-6 py-4 flex-row items-center active:bg-stone-50 dark:active:bg-stone-800 border-b border-stone-100 dark:border-stone-800"
              >
                <View className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-2 mr-3">
                  <Database size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                    Seed Demo Data
                  </Text>
                  <Text className="text-sm text-stone-500 dark:text-stone-400">
                    Create Eitan Bernath as demo creator
                  </Text>
                </View>
                {isSeedingData && <ActivityIndicator size="small" color="#8b5cf6" />}
              </Pressable>

              {/* Clear Demo Data Button */}
              <Pressable
                onPress={handleClearDemoData}
                disabled={isClearingData || !demoDataStatus?.hasCreatorProfile}
                className="px-6 py-4 flex-row items-center active:bg-stone-50 dark:active:bg-stone-800"
              >
                <View className="bg-stone-100 dark:bg-stone-800 rounded-full p-2 mr-3">
                  <Trash2 size={20} color="#78716c" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${
                      demoDataStatus?.hasCreatorProfile
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-400 dark:text-stone-600"
                    }`}
                  >
                    Clear Demo Data
                  </Text>
                  <Text className="text-sm text-stone-500 dark:text-stone-400">
                    Remove all seeded demo data
                  </Text>
                </View>
                {isClearingData && <ActivityIndicator size="small" color="#78716c" />}
              </Pressable>
            </View>
          </View>
        )}

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
          setShowDeleteConfirmation(false);
        }}
      />

      {/* Bottom Tab Bar */}
      <TabBar />
    </View>
  );
}
