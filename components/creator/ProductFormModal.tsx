/**
 * ProductFormModal Component
 *
 * Modal for adding or editing creator shop products.
 * Features:
 * - Name, description, type fields
 * - Price and member discount inputs
 * - Image upload via expo-image-picker
 * - Physical product toggle with shipping cost field
 */

import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  X,
  Upload,
  Camera,
  ChevronDown,
  Package,
  Truck,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

/**
 * Product type options
 */
const PRODUCT_TYPES = [
  { value: "cookbook", label: "Cookbook", icon: "book" },
  { value: "course", label: "Course", icon: "video" },
  { value: "merchandise", label: "Merchandise", icon: "shirt" },
  { value: "equipment", label: "Equipment", icon: "utensils" },
] as const;

type ProductType = (typeof PRODUCT_TYPES)[number]["value"];

/**
 * Product data for editing
 */
interface ProductData {
  _id?: Id<"creatorProducts">;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
  price: number;
  memberDiscount: number;
  requiresShipping: boolean;
  shippingCost?: number;
  digitalAssetUrl?: string;
  externalUrl?: string;
}

interface ProductFormModalProps {
  visible: boolean;
  creatorId: Id<"creatorProfiles">;
  product?: ProductData | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Format cents to dollars for display
 */
function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Parse dollars string to cents
 */
function dollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars.replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

export function ProductFormModal({
  visible,
  creatorId,
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProductType>("cookbook");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [priceText, setPriceText] = useState("");
  const [memberDiscount, setMemberDiscount] = useState("15");
  const [requiresShipping, setRequiresShipping] = useState(false);
  const [shippingCostText, setShippingCostText] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mutations
  const createProduct = useMutation(api.creatorShop.createProduct);
  const updateProduct = useMutation(api.creatorShop.updateProduct);

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (visible) {
      if (product) {
        // Editing existing product
        setName(product.name);
        setDescription(product.description);
        setType(product.type as ProductType);
        setImageUrl(product.imageUrl);
        setPriceText(centsToDollars(product.price));
        setMemberDiscount(String(product.memberDiscount));
        setRequiresShipping(product.requiresShipping);
        setShippingCostText(product.shippingCost ? centsToDollars(product.shippingCost) : "");
        setExternalUrl(product.externalUrl || "");
      } else {
        // New product - reset form
        setName("");
        setDescription("");
        setType("cookbook");
        setImageUrl("");
        setPriceText("");
        setMemberDiscount("15");
        setRequiresShipping(false);
        setShippingCostText("");
        setExternalUrl("");
      }
    }
  }, [visible, product]);

  // Image picker
  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        // For now, use the local URI as the image URL
        // In production, you would upload to Convex file storage here
        setImageUrl(result.assets[0].uri);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsUploading(false);
    }
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a product name.");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Required", "Please enter a product description.");
      return false;
    }
    if (!imageUrl) {
      Alert.alert("Required", "Please upload a product image.");
      return false;
    }
    const price = dollarsToCents(priceText);
    if (price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return false;
    }
    if (requiresShipping) {
      const shippingCost = dollarsToCents(shippingCostText);
      if (shippingCost <= 0) {
        Alert.alert("Invalid Shipping", "Please enter a valid shipping cost.");
        return false;
      }
    }
    return true;
  }, [name, description, imageUrl, priceText, requiresShipping, shippingCostText]);

  // Save product
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const price = dollarsToCents(priceText);
      const discount = parseInt(memberDiscount, 10) || 15;
      const shippingCost = requiresShipping ? dollarsToCents(shippingCostText) : undefined;

      if (product?._id) {
        // Update existing product
        await updateProduct({
          productId: product._id,
          name: name.trim(),
          description: description.trim(),
          imageUrl,
          price,
          memberDiscount: discount,
        });
      } else {
        // Create new product
        await createProduct({
          creatorId,
          name: name.trim(),
          description: description.trim(),
          type: type as "cookbook" | "course" | "merchandise" | "equipment",
          imageUrl,
          price,
          memberDiscount: discount,
          requiresShipping,
          shippingCost,
          externalUrl: externalUrl.trim() || undefined,
        });
      }

      onSaved();
    } catch (error) {
      console.error("Save product error:", error);
      Alert.alert("Error", "Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    validateForm,
    product,
    creatorId,
    name,
    description,
    type,
    imageUrl,
    priceText,
    memberDiscount,
    requiresShipping,
    shippingCostText,
    externalUrl,
    createProduct,
    updateProduct,
    onSaved,
  ]);

  const isEditing = !!product?._id;
  const selectedType = PRODUCT_TYPES.find((t) => t.value === type);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <Pressable onPress={onClose} className="p-2 -m-2">
            <X size={24} color="#78716c" />
          </Pressable>
          <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {isEditing ? "Edit Product" : "Add Product"}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="py-1.5 px-4 bg-orange-500 rounded-lg active:bg-orange-600 disabled:opacity-50"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Image */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Product Image
            </Text>
            <Pressable
              onPress={handlePickImage}
              disabled={isUploading}
              className="bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 overflow-hidden"
            >
              {imageUrl ? (
                <View className="relative">
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full aspect-square"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <Camera size={32} color="#fff" />
                    <Text className="text-white font-medium mt-2">Change Image</Text>
                  </View>
                </View>
              ) : (
                <View className="aspect-square items-center justify-center">
                  {isUploading ? (
                    <>
                      <ActivityIndicator size="large" color="#f97316" />
                      <Text className="text-stone-500 mt-2">Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="#a8a29e" />
                      <Text className="text-stone-500 dark:text-stone-400 font-medium mt-2">
                        Tap to upload image
                      </Text>
                      <Text className="text-stone-400 dark:text-stone-500 text-xs mt-1">
                        Square image recommended
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>
          </View>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Product Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., My Cookbook"
              placeholderTextColor="#a8a29e"
              className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800"
              maxLength={100}
            />
          </View>

          {/* Product Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your product..."
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 min-h-[100px]"
              maxLength={500}
            />
          </View>

          {/* Product Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Product Type
            </Text>
            <Pressable
              onPress={() => setShowTypePicker(!showTypePicker)}
              className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 flex-row items-center justify-between border border-stone-200 dark:border-stone-800"
            >
              <Text className="text-stone-900 dark:text-stone-100 capitalize">
                {selectedType?.label}
              </Text>
              <ChevronDown size={20} color="#78716c" />
            </Pressable>

            {showTypePicker && (
              <View className="mt-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                {PRODUCT_TYPES.map((typeOption) => (
                  <Pressable
                    key={typeOption.value}
                    onPress={() => {
                      setType(typeOption.value);
                      setShowTypePicker(false);
                      // Auto-set shipping for physical products
                      if (typeOption.value === "merchandise" || typeOption.value === "equipment") {
                        setRequiresShipping(true);
                      } else {
                        setRequiresShipping(false);
                      }
                    }}
                    className={`px-4 py-3 flex-row items-center border-b border-stone-100 dark:border-stone-800 ${
                      type === typeOption.value ? "bg-orange-50 dark:bg-orange-900/20" : ""
                    }`}
                  >
                    <Text
                      className={`capitalize ${
                        type === typeOption.value
                          ? "text-orange-600 dark:text-orange-400 font-medium"
                          : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      {typeOption.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Price (USD)
            </Text>
            <View className="flex-row items-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
              <Text className="pl-4 text-stone-500">$</Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                placeholder="24.99"
                placeholderTextColor="#a8a29e"
                keyboardType="decimal-pad"
                className="flex-1 px-2 py-3 text-stone-900 dark:text-stone-100"
              />
            </View>
          </View>

          {/* Member Discount */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Member Discount (%)
            </Text>
            <View className="flex-row items-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
              <TextInput
                value={memberDiscount}
                onChangeText={setMemberDiscount}
                placeholder="15"
                placeholderTextColor="#a8a29e"
                keyboardType="number-pad"
                className="flex-1 px-4 py-3 text-stone-900 dark:text-stone-100"
                maxLength={2}
              />
              <Text className="pr-4 text-stone-500">%</Text>
            </View>
            <Text className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Plus and Creator tier members get this discount
            </Text>
          </View>

          {/* Physical Product Toggle */}
          <View className="mb-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
            <Pressable
              onPress={() => setRequiresShipping(!requiresShipping)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                {requiresShipping ? (
                  <Truck size={20} color="#f97316" />
                ) : (
                  <Package size={20} color="#78716c" />
                )}
                <View>
                  <Text className="text-base font-medium text-stone-900 dark:text-stone-100">
                    Physical Product
                  </Text>
                  <Text className="text-xs text-stone-500 dark:text-stone-400">
                    Requires shipping
                  </Text>
                </View>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-0.5 ${
                  requiresShipping ? "bg-orange-500" : "bg-stone-300 dark:bg-stone-700"
                }`}
              >
                <View
                  className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    requiresShipping ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </View>
            </Pressable>

            {/* Shipping Cost (shown when physical) */}
            {requiresShipping && (
              <View className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Shipping Cost (USD)
                </Text>
                <View className="flex-row items-center bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <Text className="pl-3 text-stone-500">$</Text>
                  <TextInput
                    value={shippingCostText}
                    onChangeText={setShippingCostText}
                    placeholder="9.99"
                    placeholderTextColor="#a8a29e"
                    keyboardType="decimal-pad"
                    className="flex-1 px-2 py-2.5 text-stone-900 dark:text-stone-100"
                  />
                </View>
              </View>
            )}
          </View>

          {/* External URL (optional) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              External Purchase URL (Optional)
            </Text>
            <TextInput
              value={externalUrl}
              onChangeText={setExternalUrl}
              placeholder="https://example.com/buy"
              placeholderTextColor="#a8a29e"
              keyboardType="url"
              autoCapitalize="none"
              className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800"
            />
            <Text className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Link to external purchase page (e.g., Amazon, personal website)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
