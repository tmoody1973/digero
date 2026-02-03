/**
 * ShoppingItemRow Component
 *
 * Displays a single shopping list item with checkbox, name, quantity,
 * and inline editing capabilities.
 */

import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ShoppingItem, ItemCategory } from "@/types/shopping-list";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  isReadOnly?: boolean;
  onToggle?: () => void;
  onEdit?: (quantity: number, unit: string) => void;
  onDelete?: () => void;
}

export function ShoppingItemRow({
  item,
  isReadOnly = false,
  onToggle,
  onEdit,
  onDelete,
}: ShoppingItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [unit, setUnit] = useState(item.unit);

  const handleSave = () => {
    const newQuantity = parseFloat(quantity) || item.quantity;
    onEdit?.(newQuantity, unit);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setIsEditing(false);
  };

  return (
    <View
      className={`flex-row items-center gap-3 py-3 px-4 rounded-xl ${
        item.checked
          ? "bg-stone-50 dark:bg-stone-800/50"
          : "bg-white dark:bg-stone-800"
      }`}
    >
      {/* Checkbox */}
      <Pressable
        onPress={isReadOnly ? undefined : onToggle}
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          item.checked
            ? "bg-green-500 border-green-500"
            : "border-stone-300 dark:border-stone-600"
        }`}
        disabled={isReadOnly}
      >
        {item.checked && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </Pressable>

      {/* Item Info */}
      <View className="flex-1">
        {isEditing ? (
          <View className="flex-row items-center gap-2">
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              className="w-16 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md text-stone-900 dark:text-white"
            />
            <TextInput
              value={unit}
              onChangeText={setUnit}
              className="w-20 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md text-stone-900 dark:text-white"
            />
            <Pressable onPress={handleSave} className="p-1">
              <Ionicons name="checkmark" size={20} color="#16a34a" />
            </Pressable>
            <Pressable onPress={handleCancel} className="p-1">
              <Ionicons name="close" size={20} color="#a8a29e" />
            </Pressable>
          </View>
        ) : (
          <>
            <View className="flex-row items-baseline gap-2 flex-wrap">
              <Text
                className={`font-medium ${
                  item.checked
                    ? "text-stone-400 dark:text-stone-500 line-through"
                    : "text-stone-900 dark:text-white"
                }`}
              >
                {item.name}
              </Text>
              <Text
                className={`text-sm ${
                  item.checked
                    ? "text-stone-400 dark:text-stone-500"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {item.quantity} {item.unit}
              </Text>
              {item.isCustom && (
                <View className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                  <Text className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Custom
                  </Text>
                </View>
              )}
            </View>

            {/* Recipe source */}
            {item.recipeName && !item.isCustom && (
              <Text
                className={`text-xs mt-0.5 ${
                  item.checked
                    ? "text-stone-400 dark:text-stone-500"
                    : "text-stone-400 dark:text-stone-500"
                }`}
              >
                from {item.recipeName}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Actions */}
      {!isEditing && !isReadOnly && !item.checked && (
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => setIsEditing(true)}
            className="p-1.5"
          >
            <Ionicons name="pencil-outline" size={16} color="#a8a29e" />
          </Pressable>
          <Pressable onPress={onDelete} className="p-1.5">
            <Ionicons name="trash-outline" size={16} color="#a8a29e" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
