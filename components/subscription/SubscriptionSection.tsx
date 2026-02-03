/**
 * Subscription Section Component
 *
 * Displays subscription status and usage stats in the Settings screen.
 * Shows different content for free vs premium users.
 */

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getManagementURL } from "@/lib/revenuecat";
import { PaywallModal } from "./PaywallModal";

// =============================================================================
// Component
// =============================================================================

export function SubscriptionSection() {
  const {
    isPremium,
    isTrialPeriod,
    subscriptionType,
    expiresAt,
    hasBillingIssue,
    isLoading: isSubscriptionLoading,
    restore,
  } = useSubscription();

  const usageStats = useQuery(api.subscriptions.getUsageStats);

  const [showPaywall, setShowPaywall] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  /**
   * Handle restore purchases
   */
  const handleRestore = async () => {
    setIsRestoring(true);
    setRestoreMessage(null);

    try {
      const result = await restore();
      if (result.hasPremium) {
        setRestoreMessage("Purchases restored successfully!");
      } else {
        setRestoreMessage("No purchases found to restore.");
      }
    } catch (error) {
      setRestoreMessage("Failed to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
      // Clear message after 3 seconds
      setTimeout(() => setRestoreMessage(null), 3000);
    }
  };

  /**
   * Open App Store subscription management
   */
  const handleManageSubscription = async () => {
    try {
      const url = await getManagementURL();
      if (url) {
        Linking.openURL(url);
      } else {
        // Fallback to general subscription settings
        Linking.openURL("https://apps.apple.com/account/subscriptions");
      }
    } catch (error) {
      console.error("Failed to open subscription management:", error);
      Linking.openURL("https://apps.apple.com/account/subscriptions");
    }
  };

  /**
   * Format expiration date
   */
  const formatExpirationDate = (date: Date | null) => {
    if (!date) return "Lifetime access";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Get plan display name
   */
  const getPlanName = () => {
    if (!isPremium) return "Free";
    if (isTrialPeriod) return "Premium Trial";
    switch (subscriptionType) {
      case "monthly":
        return "Premium Monthly";
      case "annual":
        return "Premium Annual";
      case "lifetime":
        return "Premium Lifetime";
      default:
        return "Premium";
    }
  };

  const isLoading = isSubscriptionLoading || usageStats === undefined;

  return (
    <View className="mb-6">
      <Text className="px-6 text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
        Subscription
      </Text>

      <View className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
        {isLoading ? (
          <View className="px-6 py-8 items-center">
            <ActivityIndicator size="small" color="#f97316" />
          </View>
        ) : isPremium ? (
          // Premium User View
          <>
            {/* Plan Status */}
            <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                    {getPlanName()}
                  </Text>
                  {subscriptionType !== "lifetime" && expiresAt && (
                    <Text className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                      {isTrialPeriod ? "Trial ends " : "Renews "}
                      {formatExpirationDate(expiresAt)}
                    </Text>
                  )}
                  {subscriptionType === "lifetime" && (
                    <Text className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                      Lifetime access
                    </Text>
                  )}
                </View>
                <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-green-700 dark:text-green-400">
                    Active
                  </Text>
                </View>
              </View>
            </View>

            {/* Billing Issue Warning */}
            {hasBillingIssue && (
              <View className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20">
                <Text className="text-sm text-amber-700 dark:text-amber-400">
                  There's an issue with your payment method. Please update it to
                  continue your subscription.
                </Text>
              </View>
            )}

            {/* Manage Subscription */}
            {subscriptionType !== "lifetime" && (
              <Pressable
                onPress={handleManageSubscription}
                className="px-6 py-4 border-b border-stone-100 dark:border-stone-800"
              >
                <Text className="text-base text-orange-500">
                  Manage Subscription
                </Text>
              </Pressable>
            )}

            {/* Unlimited Access Indicator */}
            <View className="px-6 py-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">🎉</Text>
                <Text className="text-base text-stone-700 dark:text-stone-300">
                  You have unlimited recipes and scans!
                </Text>
              </View>
            </View>
          </>
        ) : (
          // Free User View
          <>
            {/* Plan Status */}
            <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                  Free Plan
                </Text>
                <View className="bg-stone-200 dark:bg-stone-700 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-stone-600 dark:text-stone-400">
                    Limited
                  </Text>
                </View>
              </View>
            </View>

            {/* Usage Stats */}
            {usageStats && (
              <View className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
                <Text className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                  Usage
                </Text>

                {/* Recipe Usage */}
                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-stone-700 dark:text-stone-300">
                      Recipes
                    </Text>
                    <Text className="text-sm text-stone-500 dark:text-stone-400">
                      {usageStats.recipes.currentCount} / {usageStats.recipes.limit}
                    </Text>
                  </View>
                  <View className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (usageStats.recipes.currentCount /
                            (usageStats.recipes.limit || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Scan Usage */}
                <View>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-stone-700 dark:text-stone-300">
                      Scans
                    </Text>
                    <Text className="text-sm text-stone-500 dark:text-stone-400">
                      {usageStats.scans.currentCount} / {usageStats.scans.limit}
                      {usageStats.scans.resetsInDays !== null && (
                        <Text className="text-xs">
                          {" "}
                          (resets in {usageStats.scans.resetsInDays}d)
                        </Text>
                      )}
                    </Text>
                  </View>
                  <View className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (usageStats.scans.currentCount /
                            (usageStats.scans.limit || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Upgrade Button */}
            <Pressable
              onPress={() => setShowPaywall(true)}
              className="px-6 py-4 border-b border-stone-100 dark:border-stone-800"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-medium text-orange-500">
                    Upgrade to Premium
                  </Text>
                  <Text className="text-sm text-stone-500 dark:text-stone-400">
                    Unlimited recipes and scans
                  </Text>
                </View>
                <Text className="text-orange-500 text-xl">→</Text>
              </View>
            </Pressable>
          </>
        )}

        {/* Restore Purchases */}
        <Pressable
          onPress={handleRestore}
          disabled={isRestoring}
          className="px-6 py-4"
        >
          {isRestoring ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#f97316" />
              <Text className="text-stone-500 dark:text-stone-400 ml-2">
                Restoring...
              </Text>
            </View>
          ) : (
            <Text className="text-base text-stone-600 dark:text-stone-400">
              Restore Purchases
            </Text>
          )}
        </Pressable>

        {/* Restore Message */}
        {restoreMessage && (
          <View className="px-6 pb-4">
            <Text
              className={`text-sm ${
                restoreMessage.includes("successfully")
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {restoreMessage}
            </Text>
          </View>
        )}
      </View>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
      />
    </View>
  );
}
