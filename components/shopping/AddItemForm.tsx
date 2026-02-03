/**
 * AddItemForm Component
 *
 * Inline form for adding custom items to a shopping list.
 * Includes name, quantity, unit, and category fields.
 */

import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ItemCategory } from "@/types/shopping-list";
import { ITEM_CATEGORIES } from "@/types/shopping-list";

interface AddItemFormProps {
  onAdd?: (name: string, quantity: number, unit: string, category: ItemCategory) => void;
  onCancel?: () => void;
}

export function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<ItemCategory>("Pantry");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd?.(
        name.trim(),
        parseFloat(quantity) || 1,
        unit.trim() || "item",
        category
      );
      // Reset form
      setName("");
      setQuantity("1");
      setUnit("");
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <View className="p-4 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
      <View className="space-y-3">
        {/* Name input */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          placeholderTextColor="#a8a29e"
          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-900 dark:text-white"
          autoFocus
        />

        {/* Quantity, Unit, Category row */}
        <View className="flex-row gap-3">
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="Qty"
            placeholderTextColor="#a8a29e"
            className="w-20 px-3 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-900 dark:text-white text-center"
          />

          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="Unit (e.g., lbs)"
            placeholderTextColor="#a8a29e"
            className="flex-1 px-3 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-900 dark:text-white"
          />

          <Pressable
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            className="px-3 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl flex-row items-center gap-1"
          >
            <Text className="text-stone-900 dark:text-white text-sm" numberOfLines={1}>
              {category.length > 10 ? category.substring(0, 10) + "..." : category}
            </Text>
            <Ionicons
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={16}
              color="#a8a29e"
            />
          </Pressable>
        </View>

        {/* Category picker */}
        {showCategoryPicker && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2 -mx-4 px-4"
          >
            {ITEM_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
                className={`px-3 py-2 rounded-lg ${
                  category === cat
                    ? "bg-orange-500"
                    : "bg-stone-100 dark:bg-stone-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    category === cat
                      ? "text-white font-medium"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleAdd}
            disabled={!isValid}
            className={`flex-1 py-3 rounded-xl items-center ${
              isValid
                ? "bg-orange-500"
                : "bg-stone-300 dark:bg-stone-600"
            }`}
          >
            <Text
              className={`font-semibold ${
                isValid ? "text-white" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              Add to List
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="px-4 py-3 items-center justify-center"
          >
            <Text className="text-stone-600 dark:text-stone-400">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
