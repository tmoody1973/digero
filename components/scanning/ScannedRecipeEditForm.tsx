/**
 * Scanned Recipe Edit Form Component
 *
 * Full edit form for reviewing and modifying extracted recipe data
 * before saving. Similar to manual recipe form but pre-populated.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import {
  X,
  Check,
  Clock,
  Users,
  Flame,
  Plus,
  Minus,
  Edit3,
  GripVertical,
} from "lucide-react-native";

import type {
  ScannedRecipeEditFormProps,
  ExtractedRecipeData,
  ExtractedIngredient,
  IngredientCategory,
} from "./types";

const INGREDIENT_CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: "meat", label: "Meat" },
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy" },
  { value: "pantry", label: "Pantry" },
  { value: "spices", label: "Spices" },
  { value: "condiments", label: "Condiments" },
  { value: "bread", label: "Bread" },
  { value: "other", label: "Other" },
];

/**
 * ScannedRecipeEditForm Component
 *
 * Features:
 * - Pre-populated with extracted data
 * - Editable title, ingredients, instructions
 * - Servings, prep time, cook time editing
 * - Add/remove ingredients and instructions
 * - Save and cancel actions
 * - "Enter Manually" fallback
 */
export function ScannedRecipeEditForm({
  recipe,
  onSave,
  onCancel,
  onEnterManually,
}: ScannedRecipeEditFormProps) {
  const [data, setData] = useState<ExtractedRecipeData>(recipe);
  const [editingIngredient, setEditingIngredient] = useState<number | null>(
    null
  );

  // Title handlers
  const handleTitleChange = useCallback((title: string) => {
    setData((prev) => ({ ...prev, title }));
  }, []);

  // Servings handlers
  const handleServingsChange = useCallback((delta: number) => {
    setData((prev) => ({
      ...prev,
      servings: Math.max(1, prev.servings + delta),
    }));
  }, []);

  // Time handlers
  const handlePrepTimeChange = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setData((prev) => ({
      ...prev,
      prepTime: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  }, []);

  const handleCookTimeChange = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setData((prev) => ({
      ...prev,
      cookTime: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  }, []);

  // Ingredient handlers
  const handleIngredientChange = useCallback(
    (
      index: number,
      field: keyof ExtractedIngredient,
      value: string | number
    ) => {
      setData((prev) => {
        const newIngredients = [...prev.ingredients];
        newIngredients[index] = {
          ...newIngredients[index],
          [field]: value,
        };
        return { ...prev, ingredients: newIngredients };
      });
    },
    []
  );

  const handleRemoveIngredient = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
    setEditingIngredient(null);
  }, []);

  const handleAddIngredient = useCallback(() => {
    setData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", quantity: 1, unit: "item", category: "other" as const },
      ],
    }));
    setEditingIngredient(data.ingredients.length);
  }, [data.ingredients.length]);

  // Instruction handlers
  const handleInstructionChange = useCallback((index: number, value: string) => {
    setData((prev) => {
      const newInstructions = [...prev.instructions];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  }, []);

  const handleRemoveInstruction = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddInstruction = useCallback(() => {
    setData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  }, []);

  // Save handler
  const handleSave = useCallback(() => {
    if (!data.title.trim()) {
      Alert.alert(
        "Title Required",
        "Please enter a title for this recipe before saving."
      );
      return;
    }

    if (data.ingredients.length === 0) {
      Alert.alert(
        "Ingredients Required",
        "Please add at least one ingredient."
      );
      return;
    }

    if (data.instructions.length === 0) {
      Alert.alert(
        "Instructions Required",
        "Please add at least one instruction."
      );
      return;
    }

    onSave(data);
  }, [data, onSave]);

  // Manual entry handler
  const handleEnterManually = useCallback(() => {
    onEnterManually({
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      servings: data.servings,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
    });
  }, [data, onEnterManually]);

  return (
    <View className="flex-1 bg-stone-950">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-stone-800 px-4 py-4">
        <Pressable
          onPress={onCancel}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-800"
        >
          <X size={24} color="#a8a29e" />
        </Pressable>
        <Text className="text-lg font-semibold text-white">Edit Recipe</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Title */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-stone-400">Title</Text>
          <TextInput
            value={data.title}
            onChangeText={handleTitleChange}
            placeholder="Recipe title"
            placeholderTextColor="#78716c"
            className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-lg text-white"
          />
        </View>

        {/* Time & Servings */}
        <View className="mb-6 rounded-xl border border-stone-700 bg-stone-800 p-4">
          <Text className="mb-3 text-sm font-medium text-stone-400">
            Details
          </Text>

          {/* Servings */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#a8a29e" />
              <Text className="text-stone-300">Servings</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => handleServingsChange(-1)}
                className="h-8 w-8 items-center justify-center rounded-full bg-stone-700 active:bg-stone-600"
              >
                <Minus size={16} color="#a8a29e" />
              </Pressable>
              <Text className="min-w-[2rem] text-center text-lg font-semibold text-white">
                {data.servings}
              </Text>
              <Pressable
                onPress={() => handleServingsChange(1)}
                className="h-8 w-8 items-center justify-center rounded-full bg-stone-700 active:bg-stone-600"
              >
                <Plus size={16} color="#a8a29e" />
              </Pressable>
            </View>
          </View>

          {/* Prep Time */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#a8a29e" />
              <Text className="text-stone-300">Prep Time (min)</Text>
            </View>
            <TextInput
              value={String(data.prepTime)}
              onChangeText={handlePrepTimeChange}
              keyboardType="number-pad"
              className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
            />
          </View>

          {/* Cook Time */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Flame size={18} color="#a8a29e" />
              <Text className="text-stone-300">Cook Time (min)</Text>
            </View>
            <TextInput
              value={String(data.cookTime)}
              onChangeText={handleCookTimeChange}
              keyboardType="number-pad"
              className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
            />
          </View>
        </View>

        {/* Ingredients */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-stone-400">
            Ingredients ({data.ingredients.length})
          </Text>
          <View className="gap-2">
            {data.ingredients.map((ing, index) => (
              <View
                key={index}
                className="flex-row items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 p-3"
              >
                <TextInput
                  value={String(ing.quantity)}
                  onChangeText={(v) =>
                    handleIngredientChange(index, "quantity", parseFloat(v) || 0)
                  }
                  keyboardType="decimal-pad"
                  className="w-14 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-center text-white"
                />
                <TextInput
                  value={ing.unit}
                  onChangeText={(v) => handleIngredientChange(index, "unit", v)}
                  className="w-16 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                  placeholder="unit"
                  placeholderTextColor="#57534e"
                />
                <TextInput
                  value={ing.name}
                  onChangeText={(v) => handleIngredientChange(index, "name", v)}
                  className="flex-1 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                  placeholder="ingredient"
                  placeholderTextColor="#57534e"
                />
                <Pressable
                  onPress={() => handleRemoveIngredient(index)}
                  className="h-8 w-8 items-center justify-center rounded bg-red-500/20 active:bg-red-500/30"
                >
                  <X size={16} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add Ingredient */}
          <Pressable
            onPress={handleAddIngredient}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-stone-600 py-3 active:bg-stone-800"
          >
            <Plus size={16} color="#a8a29e" />
            <Text className="text-stone-400">Add Ingredient</Text>
          </Pressable>
        </View>

        {/* Instructions */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-stone-400">
            Instructions ({data.instructions.length} steps)
          </Text>
          <View className="gap-3">
            {data.instructions.map((step, index) => (
              <View key={index} className="flex-row gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-orange-500/20">
                  <Text className="text-xs font-bold text-orange-500">
                    {index + 1}
                  </Text>
                </View>
                <TextInput
                  value={step}
                  onChangeText={(v) => handleInstructionChange(index, v)}
                  multiline
                  className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-white"
                  placeholder="Step instruction..."
                  placeholderTextColor="#57534e"
                />
                <Pressable
                  onPress={() => handleRemoveInstruction(index)}
                  className="h-6 w-6 items-center justify-center rounded bg-red-500/20 active:bg-red-500/30"
                >
                  <X size={14} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add Step */}
          <Pressable
            onPress={handleAddInstruction}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-stone-600 py-3 active:bg-stone-800"
          >
            <Plus size={16} color="#a8a29e" />
            <Text className="text-stone-400">Add Step</Text>
          </Pressable>
        </View>

        {/* Enter Manually Option */}
        <Pressable
          onPress={handleEnterManually}
          className="mb-6 flex-row items-center justify-center gap-2 rounded-xl border border-stone-700 py-3 active:bg-stone-800"
        >
          <Edit3 size={16} color="#a8a29e" />
          <Text className="text-stone-400">Enter Manually Instead</Text>
        </Pressable>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-stone-800 bg-stone-950 p-4">
        <View className="flex-row gap-3">
          <Pressable
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-xl border border-stone-700 py-4 active:bg-stone-800"
          >
            <Text className="font-semibold text-stone-400">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 active:bg-orange-600"
          >
            <Check size={20} color="#fff" />
            <Text className="font-semibold text-white">Save Recipe</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
