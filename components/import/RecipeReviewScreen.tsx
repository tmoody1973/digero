/**
 * Recipe Review Screen Component
 *
 * Smart confirmation screen that displays extracted recipe data in preview format.
 * Features inline editing, confidence indicators, and missing field handling.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import {
  X,
  Check,
  Clock,
  Users,
  Globe,
  ChefHat,
  Flame,
  Plus,
  Minus,
  ImageIcon,
} from "lucide-react-native";
import { InlineEditSection, MissingFieldPlaceholder } from "./InlineEditSection";
import { LowConfidenceHighlight } from "./ConfidenceIndicator";
import type {
  RecipeReviewScreenProps,
  ReviewRecipeData,
  ParsedIngredient,
  IngredientCategory,
} from "./types";

const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "meat",
  "produce",
  "dairy",
  "pantry",
  "spices",
  "condiments",
  "bread",
  "other",
];

/**
 * RecipeReviewScreen
 *
 * Displays extracted recipe in preview format with inline editing.
 * Features:
 * - Recipe preview matching RecipeDetail display
 * - Confidence indicators (yellow highlight for low confidence)
 * - Inline editing for each section
 * - Missing field placeholders
 * - Save and Cancel actions
 */
export function RecipeReviewScreen({
  recipeData,
  onSave,
  onCancel,
  onCreateManually,
}: RecipeReviewScreenProps) {
  const [data, setData] = useState<ReviewRecipeData>(recipeData);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Edit handlers
  const handleEditTitle = useCallback((title: string) => {
    setData((prev) => ({ ...prev, title }));
  }, []);

  const handleEditServings = useCallback((delta: number) => {
    setData((prev) => ({
      ...prev,
      servings: Math.max(1, prev.servings + delta),
    }));
  }, []);

  const handleEditPrepTime = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setData((prev) => ({
      ...prev,
      prepTime: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  }, []);

  const handleEditCookTime = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setData((prev) => ({
      ...prev,
      cookTime: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  }, []);

  const handleEditIngredient = useCallback(
    (index: number, field: keyof ParsedIngredient, value: string | number) => {
      setData((prev) => {
        const newIngredients = [...prev.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
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
  }, []);

  const handleAddIngredient = useCallback(() => {
    setData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", quantity: 1, unit: "item", category: "other" as const },
      ],
    }));
  }, []);

  const handleEditInstruction = useCallback(
    (index: number, value: string) => {
      setData((prev) => {
        const newInstructions = [...prev.instructions];
        newInstructions[index] = value;
        return { ...prev, instructions: newInstructions };
      });
    },
    []
  );

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

  const handleEditImageUrl = useCallback((imageUrl: string) => {
    setData((prev) => ({ ...prev, imageUrl }));
  }, []);

  const handleSave = useCallback(() => {
    // Validate title (required)
    if (!data.title || data.title.trim().length === 0) {
      Alert.alert(
        "Title Required",
        "Please enter a title for this recipe before saving.",
        [
          {
            text: "OK",
            onPress: () => setEditingSection("title"),
          },
        ]
      );
      return;
    }

    onSave(data);
  }, [data, onSave]);

  const totalTime = data.prepTime + data.cookTime;

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
        <Text className="text-lg font-semibold text-white">Review Recipe</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Source URL */}
        <View className="mb-4 flex-row items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2">
          <Globe size={16} color="#3b82f6" />
          <Text className="flex-1 text-sm text-blue-400" numberOfLines={1}>
            {data.sourceUrl}
          </Text>
        </View>

        {/* Image Preview */}
        <View className="mb-4">
          {data.imageUrl ? (
            <LowConfidenceHighlight confidence={data.confidence.imageUrl}>
              <Pressable
                onPress={() => setEditingSection("image")}
                className="overflow-hidden rounded-xl"
              >
                <Image
                  source={{ uri: data.imageUrl }}
                  className="aspect-video w-full"
                  resizeMode="cover"
                />
              </Pressable>
            </LowConfidenceHighlight>
          ) : (
            <Pressable
              onPress={() => setEditingSection("image")}
              className="aspect-video items-center justify-center rounded-xl border border-dashed border-stone-600 bg-stone-800/30"
            >
              <ImageIcon size={48} color="#78716c" />
              <Text className="mt-2 text-sm text-stone-500">
                Tap to add image URL
              </Text>
            </Pressable>
          )}
        </View>

        {/* Image URL Edit Modal */}
        {editingSection === "image" && (
          <View className="mb-4 rounded-xl border border-stone-700 bg-stone-800 p-3">
            <Text className="mb-2 text-sm font-medium text-stone-400">
              Image URL
            </Text>
            <TextInput
              value={data.imageUrl}
              onChangeText={handleEditImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#78716c"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-white"
            />
            <Pressable
              onPress={() => setEditingSection(null)}
              className="mt-2 items-center rounded-lg bg-green-500/20 py-2"
            >
              <Text className="font-medium text-green-500">Done</Text>
            </Pressable>
          </View>
        )}

        {/* Title */}
        <InlineEditSection
          title="Title"
          confidence={data.confidence.title}
          editMode={editingSection === "title"}
          onEdit={() => setEditingSection("title")}
          onDone={() => setEditingSection(null)}
          renderEditor={() => (
            <TextInput
              value={data.title}
              onChangeText={handleEditTitle}
              placeholder="Recipe title"
              placeholderTextColor="#78716c"
              className="rounded-lg border border-stone-600 bg-stone-900 px-3 py-2 text-white"
            />
          )}
        >
          {data.title ? (
            <LowConfidenceHighlight confidence={data.confidence.title}>
              <Text className="text-xl font-bold text-white">{data.title}</Text>
            </LowConfidenceHighlight>
          ) : (
            <MissingFieldPlaceholder onPress={() => setEditingSection("title")} />
          )}
        </InlineEditSection>

        {/* Time & Servings */}
        <InlineEditSection
          title="Details"
          confidence={data.confidence.servings}
          editMode={editingSection === "details"}
          onEdit={() => setEditingSection("details")}
          onDone={() => setEditingSection(null)}
          renderEditor={() => (
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Users size={18} color="#a8a29e" />
                <Text className="flex-1 text-stone-400">Servings</Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => handleEditServings(-1)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-stone-700"
                  >
                    <Minus size={16} color="#a8a29e" />
                  </Pressable>
                  <Text className="min-w-[2rem] text-center text-lg font-semibold text-white">
                    {data.servings}
                  </Text>
                  <Pressable
                    onPress={() => handleEditServings(1)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-stone-700"
                  >
                    <Plus size={16} color="#a8a29e" />
                  </Pressable>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Clock size={18} color="#a8a29e" />
                <Text className="flex-1 text-stone-400">Prep Time (min)</Text>
                <TextInput
                  value={String(data.prepTime)}
                  onChangeText={handleEditPrepTime}
                  keyboardType="number-pad"
                  className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
                />
              </View>
              <View className="flex-row items-center gap-3">
                <Flame size={18} color="#a8a29e" />
                <Text className="flex-1 text-stone-400">Cook Time (min)</Text>
                <TextInput
                  value={String(data.cookTime)}
                  onChangeText={handleEditCookTime}
                  keyboardType="number-pad"
                  className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
                />
              </View>
            </View>
          )}
        >
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#f97316" />
              <Text className="text-white">{totalTime} min total</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#a8a29e" />
              <Text className="text-stone-400">{data.prepTime} prep</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Flame size={18} color="#a8a29e" />
              <Text className="text-stone-400">{data.cookTime} cook</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#a8a29e" />
              <Text className="text-stone-400">{data.servings} servings</Text>
            </View>
          </View>
        </InlineEditSection>

        {/* Ingredients */}
        <InlineEditSection
          title={`Ingredients (${data.ingredients.length})`}
          confidence={data.confidence.ingredients}
          editMode={editingSection === "ingredients"}
          onEdit={() => setEditingSection("ingredients")}
          onDone={() => setEditingSection(null)}
          renderEditor={() => (
            <View className="gap-2">
              {data.ingredients.map((ing, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <TextInput
                    value={String(ing.quantity)}
                    onChangeText={(v) =>
                      handleEditIngredient(index, "quantity", parseFloat(v) || 0)
                    }
                    keyboardType="decimal-pad"
                    className="w-14 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-center text-white"
                  />
                  <TextInput
                    value={ing.unit}
                    onChangeText={(v) => handleEditIngredient(index, "unit", v)}
                    className="w-16 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                  />
                  <TextInput
                    value={ing.name}
                    onChangeText={(v) => handleEditIngredient(index, "name", v)}
                    className="flex-1 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                  />
                  <Pressable
                    onPress={() => handleRemoveIngredient(index)}
                    className="h-8 w-8 items-center justify-center rounded bg-red-500/20"
                  >
                    <X size={16} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={handleAddIngredient}
                className="flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-stone-600 py-2"
              >
                <Plus size={16} color="#a8a29e" />
                <Text className="text-stone-400">Add Ingredient</Text>
              </Pressable>
            </View>
          )}
        >
          {data.ingredients.length > 0 ? (
            <LowConfidenceHighlight confidence={data.confidence.ingredients}>
              <View className="gap-2">
                {data.ingredients.map((ing, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <Text className="min-w-[4rem] font-mono text-sm text-orange-500">
                      {ing.quantity} {ing.unit}
                    </Text>
                    <Text className="flex-1 text-white">{ing.name}</Text>
                  </View>
                ))}
              </View>
            </LowConfidenceHighlight>
          ) : (
            <MissingFieldPlaceholder
              message="No ingredients found - tap to add"
              onPress={() => setEditingSection("ingredients")}
            />
          )}
        </InlineEditSection>

        {/* Instructions */}
        <InlineEditSection
          title={`Instructions (${data.instructions.length} steps)`}
          confidence={data.confidence.instructions}
          editMode={editingSection === "instructions"}
          onEdit={() => setEditingSection("instructions")}
          onDone={() => setEditingSection(null)}
          renderEditor={() => (
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
                    onChangeText={(v) => handleEditInstruction(index, v)}
                    multiline
                    className="flex-1 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                  />
                  <Pressable
                    onPress={() => handleRemoveInstruction(index)}
                    className="h-6 w-6 items-center justify-center rounded bg-red-500/20"
                  >
                    <X size={14} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={handleAddInstruction}
                className="flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-stone-600 py-2"
              >
                <Plus size={16} color="#a8a29e" />
                <Text className="text-stone-400">Add Step</Text>
              </Pressable>
            </View>
          )}
        >
          {data.instructions.length > 0 ? (
            <LowConfidenceHighlight confidence={data.confidence.instructions}>
              <View className="gap-3">
                {data.instructions.map((step, index) => (
                  <View key={index} className="flex-row gap-3">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-orange-500/20">
                      <Text className="text-xs font-bold text-orange-500">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-stone-300">{step}</Text>
                  </View>
                ))}
              </View>
            </LowConfidenceHighlight>
          ) : (
            <MissingFieldPlaceholder
              message="No instructions found - tap to add"
              onPress={() => setEditingSection("instructions")}
            />
          )}
        </InlineEditSection>

        {/* Bottom spacing */}
        <View className="h-32" />
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
