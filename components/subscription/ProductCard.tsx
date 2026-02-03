/**
 * Product Card Component
 *
 * Displays a subscription product option in the paywall.
 * Supports highlighting for recommended plans and trial badges.
 */

import { View, Text, Pressable } from "react-native";

interface ProductCardProps {
  /** Product identifier */
  identifier: string;
  /** Product title */
  title: string;
  /** Formatted price string */
  priceString: string;
  /** Price per period description (e.g., "/month", "/year") */
  periodDescription: string;
  /** Whether this is the recommended option */
  isRecommended?: boolean;
  /** Whether this product has a free trial */
  hasFreeTrial?: boolean;
  /** Trial description (e.g., "7-day free trial") */
  trialDescription?: string;
  /** Savings badge text (e.g., "Save 33%") */
  savingsBadge?: string;
  /** Whether this product is currently selected */
  isSelected?: boolean;
  /** Called when the product is pressed */
  onPress: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
}

export function ProductCard({
  identifier,
  title,
  priceString,
  periodDescription,
  isRecommended = false,
  hasFreeTrial = false,
  trialDescription,
  savingsBadge,
  isSelected = false,
  onPress,
  disabled = false,
}: ProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`
        relative rounded-xl border-2 p-4 mb-3
        ${isSelected
          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
          : isRecommended
          ? "border-orange-300 bg-white dark:bg-stone-900"
          : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
        }
        ${disabled ? "opacity-50" : ""}
      `}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <View className="absolute -top-3 left-4 bg-orange-500 px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-white">BEST VALUE</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          {/* Title */}
          <Text
            className={`text-lg font-semibold ${
              isSelected
                ? "text-orange-600 dark:text-orange-400"
                : "text-stone-900 dark:text-stone-100"
            }`}
          >
            {title}
          </Text>

          {/* Price and period */}
          <View className="flex-row items-baseline mt-1">
            <Text
              className={`text-2xl font-bold ${
                isSelected
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-stone-900 dark:text-stone-100"
              }`}
            >
              {priceString}
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400 ml-1">
              {periodDescription}
            </Text>
          </View>

          {/* Free trial badge */}
          {hasFreeTrial && trialDescription && (
            <View className="mt-2 flex-row items-center">
              <View className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                <Text className="text-xs font-medium text-green-700 dark:text-green-400">
                  {trialDescription}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Savings badge */}
        {savingsBadge && (
          <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
            <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {savingsBadge}
            </Text>
          </View>
        )}

        {/* Selection indicator */}
        <View
          className={`ml-3 w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "border-orange-500 bg-orange-500"
              : "border-stone-300 dark:border-stone-600"
          }`}
        >
          {isSelected && (
            <View className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </View>
      </View>
    </Pressable>
  );
}
