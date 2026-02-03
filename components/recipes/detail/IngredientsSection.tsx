/**
 * IngredientsSection Component
 *
 * Displays ingredients with serving adjuster and shopping list actions.
 */

import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { ShoppingCart, Check } from "lucide-react-native";
import { ServingAdjuster } from "./ServingAdjuster";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  originalServings: number;
  onAddToShoppingList?: (ingredientIndexes: number[]) => void;
}

export function IngredientsSection({
  ingredients,
  originalServings,
  onAddToShoppingList,
}: IngredientsSectionProps) {
  const [servings, setServings] = useState(originalServings);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // Calculate scale factor for ingredients
  const scaleFactor = servings / originalServings;

  // Scale ingredients based on current serving count
  const scaledIngredients = useMemo(() => {
    return ingredients.map((ing) => ({
      ...ing,
      quantity: Math.round(ing.quantity * scaleFactor * 100) / 100,
    }));
  }, [ingredients, scaleFactor]);

  const toggleSelection = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleAddAll = () => {
    const allIndexes = ingredients.map((_, i) => i);
    onAddToShoppingList?.(allIndexes);
  };

  const handleAddSelected = () => {
    onAddToShoppingList?.(selectedIndexes);
    setSelectedIndexes([]);
    setIsSelectMode(false);
  };

  const handleCancelSelect = () => {
    setSelectedIndexes([]);
    setIsSelectMode(false);
  };

  return (
    <View className="mt-6">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Ingredients
        </Text>
        <ServingAdjuster value={servings} onChange={setServings} />
      </View>

      {/* Ingredients List */}
      <View className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        {scaledIngredients.map((ingredient, index) => (
          <Pressable
            key={index}
            onPress={() => isSelectMode && toggleSelection(index)}
            disabled={!isSelectMode}
            className={`flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0 dark:border-stone-700 ${
              isSelectMode ? "active:bg-stone-50 dark:active:bg-stone-700/50" : ""
            }`}
          >
            {isSelectMode && (
              <View
                className={`h-5 w-5 items-center justify-center rounded border-2 ${
                  selectedIndexes.includes(index)
                    ? "border-orange-500 bg-orange-500"
                    : "border-stone-300 dark:border-stone-600"
                }`}
              >
                {selectedIndexes.includes(index) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </View>
            )}
            <Text className="min-w-16 font-mono text-sm text-orange-600 dark:text-orange-400">
              {ingredient.quantity} {ingredient.unit}
            </Text>
            <Text className="flex-1 text-stone-900 dark:text-stone-100">
              {ingredient.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Shopping List Actions */}
      <View className="mt-4 flex-row flex-wrap gap-3">
        {isSelectMode ? (
          <>
            <Pressable
              onPress={handleAddSelected}
              disabled={selectedIndexes.length === 0}
              className={`flex-row items-center gap-2 rounded-xl px-4 py-3 ${
                selectedIndexes.length > 0
                  ? "bg-orange-500 active:bg-orange-600"
                  : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              <ShoppingCart
                className={`h-5 w-5 ${
                  selectedIndexes.length > 0
                    ? "text-white"
                    : "text-stone-400"
                }`}
              />
              <Text
                className={`font-medium ${
                  selectedIndexes.length > 0
                    ? "text-white"
                    : "text-stone-400"
                }`}
              >
                Add {selectedIndexes.length} Selected
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCancelSelect}
              className="rounded-xl border border-stone-200 px-4 py-3 active:bg-stone-100 dark:border-stone-700 dark:active:bg-stone-800"
            >
              <Text className="font-medium text-stone-600 dark:text-stone-300">
                Cancel
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={handleAddAll}
              className="flex-row items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 active:bg-orange-600"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              <Text className="font-medium text-white">
                Add All to Shopping List
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsSelectMode(true)}
              className="rounded-xl border border-stone-200 px-4 py-3 active:bg-stone-100 dark:border-stone-700 dark:active:bg-stone-800"
            >
              <Text className="font-medium text-stone-600 dark:text-stone-300">
                Select Items
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
