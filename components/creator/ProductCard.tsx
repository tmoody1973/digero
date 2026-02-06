/**
 * ProductCard Component
 *
 * Displays a product card in the user-facing creator shop.
 * Shows image, name, price with member discount styling.
 */

import { View, Text, Pressable, Image } from "react-native";
import { Tag } from "lucide-react-native";

export interface ProductCardProps {
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Product image URL */
  imageUrl: string;
  /** Product type */
  type: string;
  /** Original price in cents */
  price: number;
  /** Member discount percentage */
  memberDiscount: number;
  /** Whether current user is a member (plus/creator tier) */
  isMember: boolean;
  /** Total sales count */
  totalSales: number;
  /** Callback when product is pressed */
  onPress: () => void;
}

/**
 * Format price from cents to dollars
 */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate discounted price
 */
function calculateDiscountedPrice(price: number, discountPercent: number): number {
  return Math.floor(price * (1 - discountPercent / 100));
}

/**
 * Get product type badge color
 */
function getTypeBadge(type: string): { bg: string; text: string } {
  const config: Record<string, { bg: string; text: string }> = {
    cookbook: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
    course: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    merchandise: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
    equipment: { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300" },
  };
  return config[type] || config.merchandise;
}

export function ProductCard({
  name,
  imageUrl,
  type,
  price,
  memberDiscount,
  isMember,
  totalSales,
  onPress,
}: ProductCardProps) {
  const typeBadge = getTypeBadge(type);
  const discountedPrice = calculateDiscountedPrice(price, memberDiscount);
  const showDiscount = memberDiscount > 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700 active:border-orange-400"
    >
      {/* Product Image */}
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full aspect-square"
          resizeMode="cover"
        />

        {/* Member Discount Badge */}
        {showDiscount && (
          <View className="absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded-full flex-row items-center gap-1">
            <Tag size={10} color="#fff" />
            <Text className="text-white text-xs font-bold">
              {memberDiscount}% OFF
            </Text>
          </View>
        )}

        {/* Type Badge */}
        <View className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full ${typeBadge.bg}`}>
          <Text className={`text-xs font-medium capitalize ${typeBadge.text}`}>
            {type}
          </Text>
        </View>
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text
          className="text-sm font-semibold text-stone-900 dark:text-white mb-1"
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* Pricing */}
        <View className="flex-row items-center gap-2">
          {isMember && showDiscount ? (
            <>
              {/* Discounted Price */}
              <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(discountedPrice)}
              </Text>
              {/* Original Price with strikethrough */}
              <Text className="text-sm text-stone-400 line-through">
                {formatPrice(price)}
              </Text>
            </>
          ) : (
            <>
              {/* Regular Price */}
              <Text className="text-base font-bold text-stone-900 dark:text-white">
                {formatPrice(price)}
              </Text>
              {/* Show potential savings for non-members */}
              {showDiscount && !isMember && (
                <Text className="text-xs text-orange-500">
                  Members save {memberDiscount}%
                </Text>
              )}
            </>
          )}
        </View>

        {/* Sales count */}
        {totalSales > 0 && (
          <Text className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            {totalSales} sold
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/**
 * Product Card Skeleton for loading state
 */
export function ProductCardSkeleton() {
  return (
    <View className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700">
      <View className="w-full aspect-square bg-stone-200 dark:bg-stone-700" />
      <View className="p-3">
        <View className="h-4 bg-stone-200 dark:bg-stone-700 rounded mb-2 w-3/4" />
        <View className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-1/3" />
      </View>
    </View>
  );
}
