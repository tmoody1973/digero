/**
 * CreatorShopSection Component
 *
 * User-facing shop section displayed on creator profile pages.
 * Shows products with member discounts and allows purchases.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ShoppingBag, Store, Tag } from "lucide-react-native";

import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";

interface CreatorShopSectionProps {
  /** Creator profile ID */
  creatorId: Id<"creatorProfiles">;
  /** Creator display name */
  creatorName: string;
}

/**
 * Shipping Address Form Modal (simplified inline collection)
 */
interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function CreatorShopSection({ creatorId, creatorName }: CreatorShopSectionProps) {
  // State
  const [selectedProductId, setSelectedProductId] = useState<Id<"creatorProducts"> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Fetch products
  const products = useQuery(api.creatorShop.getProducts, { creatorId });

  // Fetch user's membership status
  const memberDiscount = useQuery(api.subscriptions.getMemberDiscountRate);
  const isMember = (memberDiscount?.discountRate ?? 0) > 0;
  const discountRate = memberDiscount?.discountRate ?? 0;

  // Get selected product
  const selectedProduct = products?.find((p) => p._id === selectedProductId);

  // Handlers
  const handleProductPress = useCallback((productId: Id<"creatorProducts">) => {
    setSelectedProductId(productId);
    setShowProductModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowProductModal(false);
    setSelectedProductId(null);
  }, []);

  const handlePurchaseComplete = useCallback((orderId: Id<"creatorOrders">) => {
    // Could navigate to My Purchases or show confirmation
    Alert.alert(
      "Purchase Complete",
      "Your order has been placed. Check My Purchases in Settings to view your order.",
      [{ text: "OK" }]
    );
  }, []);

  const handleCollectShipping = useCallback((product: any) => {
    // In a full implementation, this would open a shipping address form
    Alert.alert(
      "Shipping Required",
      "This product requires a shipping address. In the full app, you would enter your address here."
    );
  }, []);

  // Loading state
  if (products === undefined) {
    return (
      <View className="px-4 py-6">
        <View className="flex-row items-center gap-2 mb-4">
          <Store size={20} color="#f97316" />
          <Text className="text-lg font-bold text-white">Shop</Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <ProductCardSkeleton />
          </View>
          <View className="flex-1">
            <ProductCardSkeleton />
          </View>
        </View>
      </View>
    );
  }

  // No products
  if (products.length === 0) {
    return (
      <View className="px-4 py-6">
        <View className="flex-row items-center gap-2 mb-4">
          <Store size={20} color="#f97316" />
          <Text className="text-lg font-bold text-white">Shop</Text>
        </View>
        <View className="bg-stone-800 rounded-xl p-6 items-center">
          <ShoppingBag size={32} color="#78716c" />
          <Text className="text-stone-400 mt-2 text-center">
            {creatorName} hasn't added any products yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="py-6">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Store size={20} color="#f97316" />
          <Text className="text-lg font-bold text-white">Shop</Text>
        </View>

        {/* Member Badge */}
        {isMember && (
          <View className="flex-row items-center gap-1.5 bg-orange-500/20 px-3 py-1 rounded-full">
            <Tag size={14} color="#f97316" />
            <Text className="text-orange-500 text-xs font-semibold">
              {discountRate}% Member Discount
            </Text>
          </View>
        )}
      </View>

      {/* Products Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-3"
      >
        {products.map((product) => (
          <View key={product._id} style={{ width: 180 }}>
            <ProductCard
              productId={product._id}
              name={product.name}
              imageUrl={product.imageUrl}
              type={product.type}
              price={product.price}
              memberDiscount={product.memberDiscount}
              isMember={isMember}
              totalSales={product.totalSales}
              onPress={() => handleProductPress(product._id)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Non-member upsell */}
      {!isMember && products.length > 0 && (
        <View className="mx-4 mt-4 bg-orange-500/10 rounded-xl p-3 flex-row items-center">
          <Tag size={16} color="#f97316" />
          <Text className="flex-1 text-orange-400 text-sm ml-2">
            Join Digero Plus to get 15% off all creator products
          </Text>
        </View>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showProductModal}
        product={
          selectedProduct
            ? {
                ...selectedProduct,
                creatorName,
              }
            : null
        }
        isMember={isMember}
        discountRate={discountRate}
        onClose={handleCloseModal}
        onPurchaseComplete={handlePurchaseComplete}
        onCollectShipping={handleCollectShipping}
      />
    </View>
  );
}
