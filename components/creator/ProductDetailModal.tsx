/**
 * ProductDetailModal Component
 *
 * Full product detail view with purchase flow.
 * Features:
 * - Full description
 * - Additional images carousel
 * - Price display with member discount
 * - Buy Now button
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  X,
  Tag,
  ShoppingCart,
  ExternalLink,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Product data for modal
 */
interface ProductData {
  _id: Id<"creatorProducts">;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
  additionalImages?: string[];
  price: number;
  memberDiscount: number;
  requiresShipping: boolean;
  shippingCost?: number;
  externalUrl?: string;
  digitalAssetUrl?: string;
  creatorName?: string;
}

interface ProductDetailModalProps {
  visible: boolean;
  product: ProductData | null;
  isMember: boolean;
  discountRate: number;
  onClose: () => void;
  onPurchaseComplete?: (orderId: Id<"creatorOrders">) => void;
  onCollectShipping?: (product: ProductData) => void;
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

export function ProductDetailModal({
  visible,
  product,
  isMember,
  discountRate,
  onClose,
  onPurchaseComplete,
  onCollectShipping,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Purchase mutation
  const purchaseProduct = useMutation(api.creatorShop.purchaseProduct);

  // Get all images (main + additional)
  const allImages = product
    ? [product.imageUrl, ...(product.additionalImages || [])]
    : [];

  // Calculate pricing
  const originalPrice = product?.price || 0;
  const showDiscount = isMember && discountRate > 0;
  const discountedPrice = showDiscount
    ? calculateDiscountedPrice(originalPrice, discountRate)
    : originalPrice;
  const savings = originalPrice - discountedPrice;
  const shippingCost = product?.requiresShipping ? (product.shippingCost || 0) : 0;
  const totalPrice = discountedPrice + shippingCost;

  // Image navigation
  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  }, [allImages.length]);

  // Handle external link
  const handleExternalLink = useCallback(async () => {
    if (product?.externalUrl) {
      const canOpen = await Linking.canOpenURL(product.externalUrl);
      if (canOpen) {
        await Linking.openURL(product.externalUrl);
      } else {
        Alert.alert("Error", "Unable to open external link");
      }
    }
  }, [product?.externalUrl]);

  // Handle purchase
  const handlePurchase = useCallback(async () => {
    if (!product) return;

    // If requires shipping, need to collect address first
    if (product.requiresShipping && onCollectShipping) {
      onCollectShipping(product);
      return;
    }

    setIsPurchasing(true);

    try {
      const result = await purchaseProduct({
        productId: product._id,
        applyMemberDiscount: isMember,
        quantity: 1,
      });

      if (result.success && result.orderId) {
        // In production, you would integrate with RevenueCat here
        // For now, simulate successful payment
        Alert.alert(
          "Order Created",
          "Your order has been created. In production, this would redirect to payment.",
          [
            {
              text: "OK",
              onPress: () => {
                if (onPurchaseComplete) {
                  onPurchaseComplete(result.orderId);
                }
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert("Error", "Failed to process purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  }, [product, isMember, purchaseProduct, onCollectShipping, onPurchaseComplete, onClose]);

  // Reset image index when modal closes
  const handleClose = useCallback(() => {
    setCurrentImageIndex(0);
    onClose();
  }, [onClose]);

  if (!product) return null;

  const isDigital = !product.requiresShipping;
  const hasExternalUrl = !!product.externalUrl;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white dark:bg-stone-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <Pressable onPress={handleClose} className="p-2 -m-2">
            <X size={24} color="#78716c" />
          </Pressable>
          <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Product Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="pb-32">
          {/* Image Carousel */}
          <View className="relative">
            <Image
              source={{ uri: allImages[currentImageIndex] }}
              style={{ width: screenWidth, height: screenWidth }}
              resizeMode="cover"
            />

            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                <Pressable
                  onPress={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                >
                  <ChevronLeft size={24} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                >
                  <ChevronRight size={24} color="#fff" />
                </Pressable>

                {/* Image Indicators */}
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                  {allImages.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Member Discount Badge */}
            {showDiscount && (
              <View className="absolute top-4 right-4 bg-orange-500 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                <Tag size={14} color="#fff" />
                <Text className="text-white text-sm font-bold">
                  {discountRate}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="p-4">
            {/* Creator Name */}
            {product.creatorName && (
              <Text className="text-sm text-orange-500 font-medium mb-1">
                by {product.creatorName}
              </Text>
            )}

            {/* Product Name */}
            <Text className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
              {product.name}
            </Text>

            {/* Type Badge */}
            <View className="flex-row items-center gap-2 mb-4">
              <View className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full">
                <Text className="text-xs font-medium text-stone-600 dark:text-stone-400 capitalize">
                  {product.type}
                </Text>
              </View>
              {isDigital ? (
                <View className="flex-row items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Download size={12} color="#3b82f6" />
                  <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Digital
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Truck size={12} color="#d97706" />
                  <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Physical
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text className="text-base text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              {product.description}
            </Text>

            {/* External Link */}
            {hasExternalUrl && (
              <Pressable
                onPress={handleExternalLink}
                className="flex-row items-center gap-2 py-3 px-4 bg-stone-100 dark:bg-stone-800 rounded-xl mb-4"
              >
                <ExternalLink size={18} color="#3b82f6" />
                <Text className="text-blue-600 dark:text-blue-400 font-medium">
                  View on external site
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Purchase Section */}
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-4 py-4 pb-8">
          {/* Pricing Summary */}
          <View className="mb-4">
            {showDiscount && (
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-sm text-stone-400 line-through">
                  {formatPrice(originalPrice)}
                </Text>
                <Text className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Save {formatPrice(savings)}
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-stone-900 dark:text-white">
                  {formatPrice(discountedPrice)}
                </Text>
                {shippingCost > 0 && (
                  <Text className="text-xs text-stone-500">
                    + {formatPrice(shippingCost)} shipping
                  </Text>
                )}
              </View>

              {!isMember && discountRate > 0 && (
                <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg">
                  <Text className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                    Join Plus to save {discountRate}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Buy Button */}
          <Pressable
            onPress={handlePurchase}
            disabled={isPurchasing}
            className="bg-orange-500 py-4 rounded-xl flex-row items-center justify-center gap-2 active:bg-orange-600 disabled:opacity-50"
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ShoppingCart size={20} color="#fff" />
                <Text className="text-white font-bold text-base">
                  Buy Now - {formatPrice(totalPrice)}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
