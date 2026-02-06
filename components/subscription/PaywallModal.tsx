/**
 * Paywall Modal Component
 *
 * Full-screen modal that displays subscription options when user hits a limit.
 * Shows Plus vs Creator tier comparison with benefits.
 * Supports purchase flow and restore purchases.
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import { X, Check, Crown, Star } from "lucide-react-native";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  PLUS_PRICING,
  CREATOR_PRICING,
  TIER_BENEFITS,
} from "@/lib/subscriptionTiers";

// =============================================================================
// Types
// =============================================================================

export type PaywallTrigger =
  | "RECIPE_LIMIT_EXCEEDED"
  | "SCAN_LIMIT_EXCEEDED"
  | "AI_CHAT_LIMIT_EXCEEDED";

type SelectedTier = "plus" | "creator";
type SelectedPeriod = "monthly" | "annual";

interface PaywallModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The trigger that caused the paywall to appear */
  trigger?: PaywallTrigger;
  /** Current count for personalized messaging */
  currentCount?: number;
  /** Limit value for personalized messaging */
  limit?: number;
  /** Days until scan limit resets (for scan limit trigger) */
  resetsInDays?: number;
  /** Custom message to display */
  customMessage?: string;
  /** Called when modal is dismissed */
  onDismiss: () => void;
  /** Called after successful purchase */
  onPurchaseSuccess?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function PaywallModal({
  visible,
  trigger,
  currentCount,
  limit,
  resetsInDays,
  customMessage,
  onDismiss,
  onPurchaseSuccess,
}: PaywallModalProps) {
  const { purchase, restore, isPremium } = useSubscription();

  const [selectedTier, setSelectedTier] = useState<SelectedTier>("plus");
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>("annual");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * If user becomes premium, show success and dismiss
   */
  useEffect(() => {
    if (visible && isPremium && !showSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onPurchaseSuccess?.();
        onDismiss();
      }, 1500);
    }
  }, [isPremium, visible, showSuccess, onPurchaseSuccess, onDismiss]);

  /**
   * Reset state when modal opens
   */
  useEffect(() => {
    if (visible) {
      setSelectedTier("plus");
      setSelectedPeriod("annual");
      setError(null);
    }
  }, [visible]);

  const getProductId = (): string => {
    if (selectedTier === "plus") {
      return selectedPeriod === "monthly"
        ? PLUS_PRICING.monthly.productId
        : PLUS_PRICING.annual.productId;
    }
    return selectedPeriod === "monthly"
      ? CREATOR_PRICING.monthly.productId
      : CREATOR_PRICING.annual.productId;
  };

  const handlePurchase = async () => {
    const productId = getProductId();

    setIsPurchasing(true);
    setError(null);

    try {
      const result = await purchase(productId);

      if (result.userCancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error || "Purchase failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Purchase error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);

    try {
      const result = await restore();

      if (!result.success) {
        setError(result.error || "Failed to restore purchases.");
      } else if (!result.hasPremium) {
        setError("No active subscription found to restore.");
      }
    } catch (err: unknown) {
      console.error("Restore error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to restore purchases.";
      setError(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  const getTriggerMessage = () => {
    if (customMessage) {
      return customMessage;
    }
    if (trigger === "RECIPE_LIMIT_EXCEEDED") {
      return `You've reached the free limit of ${limit || 10} recipes.`;
    }
    if (trigger === "SCAN_LIMIT_EXCEEDED") {
      const resetText = resetsInDays
        ? ` (resets in ${resetsInDays} day${resetsInDays === 1 ? "" : "s"})`
        : "";
      return `You've used all ${limit || 3} free scans this month${resetText}.`;
    }
    if (trigger === "AI_CHAT_LIMIT_EXCEEDED") {
      return "You've used all 5 free Sous Chef messages today.";
    }
    return "Unlock unlimited access to all features.";
  };

  const getCurrentPrice = () => {
    if (selectedTier === "plus") {
      return selectedPeriod === "monthly"
        ? PLUS_PRICING.monthly
        : PLUS_PRICING.annual;
    }
    return selectedPeriod === "monthly"
      ? CREATOR_PRICING.monthly
      : CREATOR_PRICING.annual;
  };

  const isLoading = isPurchasing || isRestoring;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View className="w-10" />
          <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Choose Your Plan
          </Text>
          <Pressable
            onPress={onDismiss}
            className="w-10 h-10 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800"
          >
            <X size={20} color="#78716c" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Success State */}
          {showSuccess && (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
                <Text className="text-4xl">🎉</Text>
              </View>
              <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Welcome to {selectedTier === "creator" ? "Creator" : "Plus"}!
              </Text>
              <Text className="text-stone-600 dark:text-stone-400 mt-2">
                You now have unlimited access.
              </Text>
            </View>
          )}

          {/* Main Content */}
          {!showSuccess && (
            <>
              {/* Value Proposition */}
              <View className="items-center py-4">
                <View className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
                  <Text className="text-2xl">🍳</Text>
                </View>
                <Text className="text-xl font-bold text-stone-900 dark:text-stone-100 text-center">
                  Unlimited Recipes & More
                </Text>
                <Text className="text-stone-600 dark:text-stone-400 text-center mt-1 px-4">
                  {getTriggerMessage()}
                </Text>
              </View>

              {/* Tier Selection */}
              <View className="flex-row gap-3 mb-4">
                {/* Plus Tier Card */}
                <Pressable
                  onPress={() => setSelectedTier("plus")}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    selectedTier === "plus"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  }`}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Star size={18} color={selectedTier === "plus" ? "#f97316" : "#78716c"} />
                    <Text
                      className={`font-bold ${
                        selectedTier === "plus"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      Plus
                    </Text>
                  </View>
                  <Text className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                    Unlimited access
                  </Text>
                  <Text
                    className={`font-bold ${
                      selectedTier === "plus"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {selectedPeriod === "monthly"
                      ? PLUS_PRICING.monthly.priceDisplay
                      : PLUS_PRICING.annual.priceDisplay}
                    <Text className="text-xs font-normal text-stone-500">
                      /{selectedPeriod === "monthly" ? "mo" : "yr"}
                    </Text>
                  </Text>
                </Pressable>

                {/* Creator Tier Card */}
                <Pressable
                  onPress={() => setSelectedTier("creator")}
                  className={`flex-1 p-4 rounded-xl border-2 relative ${
                    selectedTier === "creator"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  }`}
                >
                  <View className="absolute -top-2.5 right-2 bg-orange-500 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-bold text-white">BEST</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Crown size={18} color={selectedTier === "creator" ? "#f97316" : "#78716c"} />
                    <Text
                      className={`font-bold ${
                        selectedTier === "creator"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      Creator
                    </Text>
                  </View>
                  <Text className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                    Plus + exclusive perks
                  </Text>
                  <Text
                    className={`font-bold ${
                      selectedTier === "creator"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {selectedPeriod === "monthly"
                      ? CREATOR_PRICING.monthly.priceDisplay
                      : CREATOR_PRICING.annual.priceDisplay}
                    <Text className="text-xs font-normal text-stone-500">
                      /{selectedPeriod === "monthly" ? "mo" : "yr"}
                    </Text>
                  </Text>
                </Pressable>
              </View>

              {/* Period Toggle */}
              <View className="flex-row bg-stone-200 dark:bg-stone-800 rounded-xl p-1 mb-4">
                <Pressable
                  onPress={() => setSelectedPeriod("monthly")}
                  className={`flex-1 py-2 rounded-lg ${
                    selectedPeriod === "monthly"
                      ? "bg-white dark:bg-stone-700"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedPeriod === "monthly"
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    Monthly
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedPeriod("annual")}
                  className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1 ${
                    selectedPeriod === "annual"
                      ? "bg-white dark:bg-stone-700"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedPeriod === "annual"
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    Annual
                  </Text>
                  <View className="bg-green-500 px-1.5 py-0.5 rounded">
                    <Text className="text-xs font-bold text-white">SAVE</Text>
                  </View>
                </Pressable>
              </View>

              {/* Benefits Comparison */}
              <View className="bg-white dark:bg-stone-900 rounded-xl p-4 mb-4">
                <Text className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  {selectedTier === "creator" ? "Creator" : "Plus"} includes:
                </Text>
                <View className="gap-2">
                  <FeatureItem
                    text="Unlimited recipe storage"
                    included={true}
                  />
                  <FeatureItem
                    text="Unlimited cookbook scans"
                    included={true}
                  />
                  <FeatureItem
                    text="Unlimited Sous Chef AI"
                    included={true}
                  />
                  <FeatureItem
                    text="15% shop discount"
                    included={true}
                  />
                  <FeatureItem
                    text="Early access to creator recipes"
                    included={selectedTier === "creator"}
                    isCreatorOnly={true}
                  />
                  <FeatureItem
                    text="Direct messaging with creators"
                    included={selectedTier === "creator"}
                    isCreatorOnly={true}
                  />
                  <FeatureItem
                    text="Vote on future content"
                    included={selectedTier === "creator"}
                    isCreatorOnly={true}
                  />
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl mb-4">
                  <Text className="text-red-700 dark:text-red-400 text-center">
                    {error}
                  </Text>
                </View>
              )}

              {/* Purchase Button */}
              <Pressable
                onPress={handlePurchase}
                disabled={isLoading}
                className={`
                  py-4 rounded-xl items-center justify-center mb-3
                  ${isLoading
                    ? "bg-stone-300 dark:bg-stone-700"
                    : "bg-orange-500 active:bg-orange-600"
                  }
                `}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Continue with {selectedTier === "creator" ? "Creator" : "Plus"} -{" "}
                    {getCurrentPrice().priceDisplay}/{selectedPeriod === "monthly" ? "mo" : "yr"}
                  </Text>
                )}
              </Pressable>

              {/* Restore Purchases */}
              <Pressable
                onPress={handleRestore}
                disabled={isLoading}
                className="py-3 items-center"
              >
                {isRestoring ? (
                  <ActivityIndicator color="#f97316" size="small" />
                ) : (
                  <Text className="text-orange-500 font-medium">
                    Restore Purchases
                  </Text>
                )}
              </Pressable>

              {/* Legal Links */}
              <View className="flex-row justify-center mt-3 space-x-4">
                <Pressable
                  onPress={() => Linking.openURL("https://digero.app/terms")}
                >
                  <Text className="text-stone-400 text-sm underline">
                    Terms of Service
                  </Text>
                </Pressable>
                <Text className="text-stone-400 text-sm mx-2">|</Text>
                <Pressable
                  onPress={() => Linking.openURL("https://digero.app/privacy")}
                >
                  <Text className="text-stone-400 text-sm underline">
                    Privacy Policy
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function FeatureItem({
  text,
  included,
  isCreatorOnly = false,
}: {
  text: string;
  included: boolean;
  isCreatorOnly?: boolean;
}) {
  return (
    <View className="flex-row items-center">
      <View
        className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
          included
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-stone-100 dark:bg-stone-800"
        }`}
      >
        {included ? (
          <Check size={12} color="#22c55e" />
        ) : (
          <X size={12} color="#a8a29e" />
        )}
      </View>
      <Text
        className={`flex-1 ${
          included
            ? "text-stone-700 dark:text-stone-300"
            : "text-stone-400 dark:text-stone-500"
        }`}
      >
        {text}
      </Text>
      {isCreatorOnly && included && (
        <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
          <Text className="text-xs font-medium text-purple-600 dark:text-purple-400">
            Creator
          </Text>
        </View>
      )}
    </View>
  );
}
