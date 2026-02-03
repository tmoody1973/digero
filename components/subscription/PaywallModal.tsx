/**
 * Paywall Modal Component
 *
 * Full-screen modal that displays subscription options when user hits a limit.
 * Hard block - cannot be dismissed without taking action.
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
import { X } from "lucide-react-native";
import { ProductCard } from "./ProductCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { OfferingsResult } from "@/lib/revenuecat";

// =============================================================================
// Types
// =============================================================================

export type PaywallTrigger = "RECIPE_LIMIT_EXCEEDED" | "SCAN_LIMIT_EXCEEDED";

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
  /** Called when modal is dismissed */
  onDismiss: () => void;
  /** Called after successful purchase */
  onPurchaseSuccess?: () => void;
}

interface ProductOption {
  identifier: string;
  title: string;
  priceString: string;
  periodDescription: string;
  isRecommended?: boolean;
  hasFreeTrial?: boolean;
  trialDescription?: string;
  savingsBadge?: string;
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
  onDismiss,
  onPurchaseSuccess,
}: PaywallModalProps) {
  const { purchase, restore, isPremium } = useSubscription();

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { getOfferings } = useSubscription();

  /**
   * Load offerings on mount
   */
  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

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
  }, [isPremium, visible]);

  const loadOfferings = async () => {
    setIsLoadingOfferings(true);
    setError(null);

    try {
      const offerings = await getOfferings();
      if (offerings.current) {
        const productOptions: ProductOption[] = [];

        // Add monthly option
        if (offerings.current.monthly) {
          productOptions.push({
            identifier: offerings.current.monthly.identifier,
            title: "Monthly",
            priceString: offerings.current.monthly.priceString,
            periodDescription: "/month",
          });
        }

        // Add annual option (recommended)
        if (offerings.current.annual) {
          const annual = offerings.current.annual;
          const hasIntro = annual.introPrice !== null;
          productOptions.push({
            identifier: annual.identifier,
            title: "Annual",
            priceString: annual.priceString,
            periodDescription: "/year",
            isRecommended: true,
            hasFreeTrial: hasIntro,
            trialDescription: hasIntro ? "7-day free trial" : undefined,
            savingsBadge: "Save 33%",
          });
        }

        // Add lifetime option
        if (offerings.current.lifetime) {
          productOptions.push({
            identifier: offerings.current.lifetime.identifier,
            title: "Lifetime",
            priceString: offerings.current.lifetime.priceString,
            periodDescription: "one-time",
          });
        }

        setProducts(productOptions);

        // Default select the annual (recommended) option
        const annualOption = productOptions.find((p) => p.isRecommended);
        if (annualOption) {
          setSelectedProduct(annualOption.identifier);
        } else if (productOptions.length > 0) {
          setSelectedProduct(productOptions[0].identifier);
        }
      }
    } catch (err) {
      console.error("Failed to load offerings:", err);
      setError("Unable to load subscription options. Please try again.");
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    setIsPurchasing(true);
    setError(null);

    try {
      const result = await purchase(selectedProduct);

      if (result.userCancelled) {
        // User cancelled, do nothing
        return;
      }

      if (!result.success) {
        setError(result.error || "Purchase failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      setError(err.message || "An error occurred. Please try again.");
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
    } catch (err: any) {
      console.error("Restore error:", err);
      setError(err.message || "Failed to restore purchases.");
    } finally {
      setIsRestoring(false);
    }
  };

  const getTriggerMessage = () => {
    if (trigger === "RECIPE_LIMIT_EXCEEDED") {
      return `You've reached the free limit of ${limit || 10} recipes.`;
    }
    if (trigger === "SCAN_LIMIT_EXCEEDED") {
      const resetText = resetsInDays
        ? ` (resets in ${resetsInDays} day${resetsInDays === 1 ? "" : "s"})`
        : "";
      return `You've used all ${limit || 3} free scans this month${resetText}.`;
    }
    return "Unlock unlimited access to all features.";
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
            Upgrade to Premium
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
                Welcome to Premium!
              </Text>
              <Text className="text-stone-600 dark:text-stone-400 mt-2">
                You now have unlimited access.
              </Text>
            </View>
          )}

          {/* Loading Offerings */}
          {isLoadingOfferings && !showSuccess && (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-stone-500 dark:text-stone-400 mt-4">
                Loading options...
              </Text>
            </View>
          )}

          {/* Main Content */}
          {!isLoadingOfferings && !showSuccess && (
            <>
              {/* Value Proposition */}
              <View className="items-center py-6">
                <View className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
                  <Text className="text-3xl">🍳</Text>
                </View>
                <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center">
                  Unlimited Recipes & Scans
                </Text>
                <Text className="text-stone-600 dark:text-stone-400 text-center mt-2 px-4">
                  {getTriggerMessage()}
                </Text>
              </View>

              {/* Features List */}
              <View className="mb-6">
                <FeatureItem text="Unlimited recipe storage" />
                <FeatureItem text="Unlimited cookbook scans" />
                <FeatureItem text="Priority support" />
              </View>

              {/* Product Options */}
              <View className="mb-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.identifier}
                    identifier={product.identifier}
                    title={product.title}
                    priceString={product.priceString}
                    periodDescription={product.periodDescription}
                    isRecommended={product.isRecommended}
                    hasFreeTrial={product.hasFreeTrial}
                    trialDescription={product.trialDescription}
                    savingsBadge={product.savingsBadge}
                    isSelected={selectedProduct === product.identifier}
                    onPress={() => setSelectedProduct(product.identifier)}
                    disabled={isLoading}
                  />
                ))}
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
                disabled={!selectedProduct || isLoading}
                className={`
                  py-4 rounded-xl items-center justify-center mb-4
                  ${!selectedProduct || isLoading
                    ? "bg-stone-300 dark:bg-stone-700"
                    : "bg-orange-500 active:bg-orange-600"
                  }
                `}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Continue
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
              <View className="flex-row justify-center mt-4 space-x-4">
                <Pressable
                  onPress={() =>
                    Linking.openURL("https://digero.app/terms")
                  }
                >
                  <Text className="text-stone-400 text-sm underline">
                    Terms of Service
                  </Text>
                </Pressable>
                <Text className="text-stone-400 text-sm mx-2">|</Text>
                <Pressable
                  onPress={() =>
                    Linking.openURL("https://digero.app/privacy")
                  }
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

function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mb-2">
      <View className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
        <Text className="text-green-600 text-xs">✓</Text>
      </View>
      <Text className="text-stone-700 dark:text-stone-300">{text}</Text>
    </View>
  );
}
