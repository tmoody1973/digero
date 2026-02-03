/**
 * Ingredient List Component
 *
 * Manages list of ingredient rows with add, delete, and reorder functionality.
 */

import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { IngredientRow } from "./IngredientRow";
import { FormIngredient, createEmptyIngredient } from "./types";

interface IngredientListProps {
  ingredients: FormIngredient[];
  onChange: (ingredients: FormIngredient[]) => void;
  error?: string;
}

export function IngredientList({
  ingredients,
  onChange,
  error,
}: IngredientListProps) {
  const handleIngredientChange = useCallback(
    (index: number, updatedIngredient: FormIngredient) => {
      const newIngredients = [...ingredients];
      newIngredients[index] = updatedIngredient;
      onChange(newIngredients);
    },
    [ingredients, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      if (ingredients.length <= 1) return; // Cannot delete last ingredient
      const newIngredients = ingredients.filter((_, i) => i !== index);
      onChange(newIngredients);
    },
    [ingredients, onChange]
  );

  const handleAddIngredient = useCallback(() => {
    onChange([...ingredients, createEmptyIngredient()]);
  }, [ingredients, onChange]);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= ingredients.length) return;
      const newIngredients = [...ingredients];
      const [removed] = newIngredients.splice(fromIndex, 1);
      newIngredients.splice(toIndex, 0, removed);
      onChange(newIngredients);
    },
    [ingredients, onChange]
  );

  return (
    <View>
      {/* Error message */}
      {error && (
        <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-3">
          <Text className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </Text>
        </View>
      )}

      {/* Ingredient Rows */}
      <View className="gap-3">
        {ingredients.map((ingredient, index) => (
          <IngredientRow
            key={ingredient.id}
            ingredient={ingredient}
            onChange={(updated) => handleIngredientChange(index, updated)}
            onDelete={() => handleDelete(index)}
            canDelete={ingredients.length > 1}
          />
        ))}
      </View>

      {/* Add Ingredient Button */}
      <Pressable
        onPress={handleAddIngredient}
        className="mt-3 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 active:bg-stone-100 dark:active:bg-stone-800"
      >
        <Plus className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        <Text className="text-stone-600 dark:text-stone-400 font-medium">
          Add Ingredient
        </Text>
      </Pressable>
    </View>
  );
}
