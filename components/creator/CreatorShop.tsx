/**
 * Creator Shop
 *
 * Displays products from a creator's shop with member discounts.
 * Supports cookbooks, courses, merchandise, and equipment.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSubscription } from "@/hooks/useSubscription";

// =============================================================================
// Types
// =============================================================================

type ProductType = "cookbook" | "course" | "merchandise" | "subscription" | "equipment";

interface Product {
  _id: Id<"creatorProducts">;
  name: string;
  description: string;
  type: ProductType;
  imageUrl: string;
  price: number;
  memberDiscount: number;
  isActive: boolean;
  isFeatured: boolean;
  totalSales: number;
}

interface CreatorShopProps {
  creatorId: Id<"creatorProfiles">;
  creatorName: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function CreatorShop({ creatorId, creatorName }: CreatorShopProps) {
  const [selectedType, setSelectedType] = useState<ProductType | "all">("all");
  const { isPlus, isCreator } = useSubscription();

  const products = useQuery(api.creatorShop.getProducts, {
    creatorId,
    type: selectedType === "all" ? undefined : selectedType,
  });

  const hasMemberDiscount = isPlus || isCreator;

  if (!products) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="bg-white border-b border-stone-200 px-4 py-4">
        <Text className="text-xl font-bold text-stone-900">
          {creatorName}'s Shop
        </Text>
        {hasMemberDiscount && (
          <View className="flex-row items-center mt-2 bg-orange-50 px-3 py-2 rounded-lg">
            <Ionicons name="pricetag" size={16} color="#f97316" />
            <Text className="text-orange-600 text-sm ml-2">
              Member discount applied to all products
            </Text>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-stone-100"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        <CategoryChip
          label="All"
          selected={selectedType === "all"}
          onPress={() => setSelectedType("all")}
        />
        <CategoryChip
          label="Cookbooks"
          icon="book"
          selected={selectedType === "cookbook"}
          onPress={() => setSelectedType("cookbook")}
        />
        <CategoryChip
          label="Courses"
          icon="play-circle"
          selected={selectedType === "course"}
          onPress={() => setSelectedType("course")}
        />
        <CategoryChip
          label="Merch"
          icon="shirt"
          selected={selectedType === "merchandise"}
          onPress={() => setSelectedType("merchandise")}
        />
        <CategoryChip
          label="Equipment"
          icon="restaurant"
          selected={selectedType === "equipment"}
          onPress={() => setSelectedType("equipment")}
        />
      </ScrollView>

      {/* Products Grid */}
      {products.length === 0 ? (
        <EmptyState type={selectedType} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              hasMemberDiscount={hasMemberDiscount}
            />
          )}
        />
      )}
    </View>
  );
}

// =============================================================================
// Product Card
// =============================================================================

function ProductCard({
  product,
  hasMemberDiscount,
}: {
  product: Product;
  hasMemberDiscount: boolean;
}) {
  const discountedPrice = hasMemberDiscount
    ? product.price * (1 - product.memberDiscount / 100)
    : product.price;

  const savings = product.price - discountedPrice;

  return (
    <Pressable
      onPress={() => router.push(`/shop/product/${product._id}`)}
      className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm"
    >
      {/* Product Image */}
      <View className="relative">
        <Image
          source={{ uri: product.imageUrl }}
          className="w-full h-36"
          resizeMode="cover"
        />
        {product.isFeatured && (
          <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">Featured</Text>
          </View>
        )}
        {hasMemberDiscount && product.memberDiscount > 0 && (
          <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              -{product.memberDiscount}%
            </Text>
          </View>
        )}
        <ProductTypeBadge type={product.type} />
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text className="text-stone-900 font-semibold" numberOfLines={2}>
          {product.name}
        </Text>
        <Text className="text-stone-500 text-xs mt-1" numberOfLines={2}>
          {product.description}
        </Text>

        {/* Pricing */}
        <View className="flex-row items-baseline mt-2">
          <Text className="text-orange-500 font-bold text-lg">
            ${(discountedPrice / 100).toFixed(2)}
          </Text>
          {hasMemberDiscount && savings > 0 && (
            <Text className="text-stone-400 text-sm ml-2 line-through">
              ${(product.price / 100).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Sales count */}
        {product.totalSales > 0 && (
          <Text className="text-stone-400 text-xs mt-1">
            {product.totalSales} sold
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// Product Detail Screen
// =============================================================================

interface ProductDetailProps {
  productId: Id<"creatorProducts">;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const { isPlus, isCreator } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const product = useQuery(api.creatorShop.getProduct, { productId });
  const creator = useQuery(
    api.creatorShop.getCreator,
    product ? { creatorId: product.creatorId } : "skip"
  );
  const purchaseProduct = useMutation(api.creatorShop.purchaseProduct);

  const hasMemberDiscount = isPlus || isCreator;

  if (!product || !creator) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const discountedPrice = hasMemberDiscount
    ? product.price * (1 - product.memberDiscount / 100)
    : product.price;

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await purchaseProduct({
        productId,
        applyMemberDiscount: hasMemberDiscount,
      });

      if (result.success) {
        // Navigate to order confirmation
        router.push(`/shop/order/${result.orderId}`);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Product Images */}
      <Image
        source={{ uri: product.imageUrl }}
        className="w-full h-72"
        resizeMode="cover"
      />

      {/* Product Info */}
      <View className="p-4">
        <ProductTypeBadge type={product.type} inline />
        <Text className="text-2xl font-bold text-stone-900 mt-2">
          {product.name}
        </Text>

        {/* Creator Info */}
        <Pressable
          onPress={() => router.push(`/creator/${creator._id}`)}
          className="flex-row items-center mt-3 py-2"
        >
          <Image
            source={{ uri: creator.channelAvatarUrl }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3">
            <Text className="text-stone-900 font-medium">
              {creator.channelName}
            </Text>
            <Text className="text-stone-500 text-xs">View creator profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a8a29e" className="ml-auto" />
        </Pressable>

        {/* Price */}
        <View className="bg-stone-50 rounded-xl p-4 mt-4">
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold text-stone-900">
              ${(discountedPrice / 100).toFixed(2)}
            </Text>
            {hasMemberDiscount && product.memberDiscount > 0 && (
              <>
                <Text className="text-stone-400 text-lg ml-3 line-through">
                  ${(product.price / 100).toFixed(2)}
                </Text>
                <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                  <Text className="text-green-600 text-xs font-bold">
                    Save ${((product.price - discountedPrice) / 100).toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {hasMemberDiscount && product.memberDiscount > 0 && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="ribbon" size={16} color="#f97316" />
              <Text className="text-orange-600 text-sm ml-2">
                {product.memberDiscount}% member discount applied
              </Text>
            </View>
          )}

          {!hasMemberDiscount && product.memberDiscount > 0 && (
            <Pressable
              onPress={() => router.push("/paywall")}
              className="flex-row items-center mt-2 bg-orange-50 px-3 py-2 rounded-lg"
            >
              <Ionicons name="star" size={16} color="#f97316" />
              <Text className="text-orange-600 text-sm ml-2 flex-1">
                Upgrade to Plus for {product.memberDiscount}% off
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#f97316" />
            </Pressable>
          )}
        </View>

        {/* Description */}
        <View className="mt-6">
          <Text className="text-stone-900 font-semibold text-lg">
            About this product
          </Text>
          <Text className="text-stone-600 mt-2 leading-6">
            {product.description}
          </Text>
        </View>

        {/* Product Details */}
        <View className="mt-6">
          <Text className="text-stone-900 font-semibold text-lg mb-3">
            Details
          </Text>
          <DetailRow
            icon="pricetag"
            label="Type"
            value={formatProductType(product.type)}
          />
          {product.requiresShipping && (
            <DetailRow
              icon="car"
              label="Shipping"
              value={
                product.shippingCost
                  ? `$${(product.shippingCost / 100).toFixed(2)}`
                  : "Free"
              }
            />
          )}
          {!product.requiresShipping && (
            <DetailRow
              icon="download"
              label="Delivery"
              value="Instant digital download"
            />
          )}
          <DetailRow
            icon="shield-checkmark"
            label="Support"
            value="100% satisfaction guarantee"
          />
        </View>

        {/* Revenue Split Info */}
        <View className="mt-6 bg-orange-50 rounded-xl p-4">
          <View className="flex-row items-center">
            <Ionicons name="heart" size={20} color="#f97316" />
            <Text className="text-orange-800 font-medium ml-2">
              Supporting {creator.channelName}
            </Text>
          </View>
          <Text className="text-orange-700 text-sm mt-2">
            50% of your purchase goes directly to the creator. Thank you for
            supporting independent cooking content!
          </Text>
        </View>
      </View>

      {/* Purchase Button - Fixed at bottom */}
      <View className="p-4 border-t border-stone-100">
        <Pressable
          onPress={handlePurchase}
          disabled={isLoading}
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            isLoading ? "bg-orange-300" : "bg-orange-500"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="cart" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Buy Now - ${(discountedPrice / 100).toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function CategoryChip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        selected ? "bg-orange-500" : "bg-stone-100"
      }`}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? "white" : "#78716c"}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        className={`text-sm font-medium ${
          selected ? "text-white" : "text-stone-600"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProductTypeBadge({
  type,
  inline = false,
}: {
  type: ProductType;
  inline?: boolean;
}) {
  const config = {
    cookbook: { icon: "book", label: "Cookbook", color: "bg-blue-500" },
    course: { icon: "play-circle", label: "Course", color: "bg-purple-500" },
    merchandise: { icon: "shirt", label: "Merch", color: "bg-pink-500" },
    subscription: { icon: "repeat", label: "Subscription", color: "bg-green-500" },
    equipment: { icon: "restaurant", label: "Equipment", color: "bg-amber-500" },
  };

  const { icon, label, color } = config[type];

  if (inline) {
    return (
      <View className={`${color} self-start px-3 py-1 rounded-full flex-row items-center`}>
        <Ionicons name={icon as any} size={12} color="white" />
        <Text className="text-white text-xs font-medium ml-1">{label}</Text>
      </View>
    );
  }

  return (
    <View className={`absolute bottom-2 left-2 ${color} px-2 py-1 rounded-full`}>
      <Ionicons name={icon as any} size={12} color="white" />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-stone-100">
      <Ionicons name={icon} size={20} color="#a8a29e" />
      <Text className="text-stone-500 ml-3 flex-1">{label}</Text>
      <Text className="text-stone-900 font-medium">{value}</Text>
    </View>
  );
}

function EmptyState({ type }: { type: ProductType | "all" }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name="storefront-outline" size={48} color="#d6d3d1" />
      <Text className="text-stone-500 text-center mt-4">
        {type === "all"
          ? "No products available yet"
          : `No ${type}s available yet`}
      </Text>
    </View>
  );
}

// =============================================================================
// Utilities
// =============================================================================

function formatProductType(type: ProductType): string {
  const labels = {
    cookbook: "Cookbook",
    course: "Online Course",
    merchandise: "Merchandise",
    subscription: "Subscription",
    equipment: "Kitchen Equipment",
  };
  return labels[type];
}
