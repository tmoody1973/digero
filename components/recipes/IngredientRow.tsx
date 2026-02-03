/**
 * Ingredient Row Component
 *
 * Single ingredient row with quantity, unit, name, and category fields.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { X, GripVertical, ChevronDown } from "lucide-react-native";
import {
  FormIngredient,
  IngredientCategory,
  UNIT_OPTIONS,
  CATEGORY_OPTIONS,
} from "./types";

interface IngredientRowProps {
  ingredient: FormIngredient;
  onChange: (ingredient: FormIngredient) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function IngredientRow({
  ingredient,
  onChange,
  onDelete,
  canDelete,
}: IngredientRowProps) {
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const updateField = useCallback(
    (field: keyof FormIngredient, value: string | IngredientCategory) => {
      onChange({ ...ingredient, [field]: value });
    },
    [ingredient, onChange]
  );

  const getCategoryLabel = (category: IngredientCategory): string => {
    const labels: Record<IngredientCategory, string> = {
      meat: "Meat",
      produce: "Produce",
      dairy: "Dairy",
      pantry: "Pantry",
      spices: "Spices",
      condiments: "Condiments",
      bread: "Bread",
      other: "Other",
    };
    return labels[category];
  };

  return (
    <View className="flex-row items-start gap-2 bg-white dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700">
      {/* Drag Handle */}
      <View className="pt-3">
        <GripVertical className="w-5 h-5 text-stone-400" />
      </View>

      {/* Fields Container */}
      <View className="flex-1 gap-2">
        {/* Top Row: Quantity, Unit, Name */}
        <View className="flex-row gap-2">
          {/* Quantity */}
          <TextInput
            value={ingredient.quantity}
            onChangeText={(value) => updateField("quantity", value)}
            placeholder="Qty"
            placeholderTextColor="#a8a29e"
            keyboardType="decimal-pad"
            className="w-16 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-2 text-sm text-stone-900 dark:text-stone-100 text-center"
          />

          {/* Unit Picker */}
          <Pressable
            onPress={() => setShowUnitPicker(true)}
            className="w-20 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-2 flex-row items-center justify-between"
          >
            <Text
              className={`text-sm ${
                ingredient.unit
                  ? "text-stone-900 dark:text-stone-100"
                  : "text-stone-400"
              }`}
              numberOfLines={1}
            >
              {ingredient.unit || "Unit"}
            </Text>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </Pressable>

          {/* Name */}
          <TextInput
            value={ingredient.name}
            onChangeText={(value) => updateField("name", value)}
            placeholder="Ingredient name"
            placeholderTextColor="#a8a29e"
            className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100"
          />
        </View>

        {/* Bottom Row: Category */}
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 flex-row items-center justify-between"
        >
          <Text className="text-sm text-stone-900 dark:text-stone-100">
            {getCategoryLabel(ingredient.category)}
          </Text>
          <ChevronDown className="w-4 h-4 text-stone-400" />
        </Pressable>
      </View>

      {/* Delete Button */}
      {canDelete && (
        <Pressable
          onPress={onDelete}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-700"
        >
          <X className="w-5 h-5 text-stone-400" />
        </Pressable>
      )}

      {/* Unit Picker Modal */}
      <Modal
        visible={showUnitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50 px-6"
          onPress={() => setShowUnitPicker(false)}
        >
          <View className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-sm overflow-hidden">
            <View className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
              <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Select Unit
              </Text>
            </View>
            <ScrollView className="max-h-64">
              {UNIT_OPTIONS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => {
                    updateField("unit", unit);
                    setShowUnitPicker(false);
                  }}
                  className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 active:bg-stone-100 dark:active:bg-stone-700"
                >
                  <Text
                    className={`text-base ${
                      ingredient.unit === unit
                        ? "text-orange-500 font-medium"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
              {/* Custom unit option */}
              <TextInput
                placeholder="Custom unit..."
                placeholderTextColor="#a8a29e"
                onSubmitEditing={(e) => {
                  if (e.nativeEvent.text) {
                    updateField("unit", e.nativeEvent.text);
                    setShowUnitPicker(false);
                  }
                }}
                className="mx-4 my-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-base text-stone-900 dark:text-stone-100"
              />
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50 px-6"
          onPress={() => setShowCategoryPicker(false)}
        >
          <View className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-sm overflow-hidden">
            <View className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
              <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Select Category
              </Text>
            </View>
            <ScrollView className="max-h-64">
              {CATEGORY_OPTIONS.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => {
                    updateField("category", category);
                    setShowCategoryPicker(false);
                  }}
                  className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 active:bg-stone-100 dark:active:bg-stone-700"
                >
                  <Text
                    className={`text-base ${
                      ingredient.category === category
                        ? "text-orange-500 font-medium"
                        : "text-stone-900 dark:text-stone-100"
                    }`}
                  >
                    {getCategoryLabel(category)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
