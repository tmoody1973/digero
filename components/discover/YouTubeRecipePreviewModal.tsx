/**
 * YouTube Recipe Preview Modal
 *
 * Editable modal for reviewing and saving recipes extracted from YouTube videos.
 * Supports inline editing of all recipe fields before save.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
  Youtube,
  Sparkles,
  AlertCircle,
  ChefHat,
} from "lucide-react-native";
import type {
  YouTubeRecipePreviewModalProps,
  YouTubeRecipePreview,
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
 * Get confidence badge color
 */
function getConfidenceColor(confidence: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (confidence) {
    case "high":
      return {
        bg: "bg-green-500/10",
        text: "text-green-500",
        border: "border-green-500/30",
      };
    case "medium":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        border: "border-yellow-500/30",
      };
    case "low":
    default:
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/30",
      };
  }
}

export function YouTubeRecipePreviewModal({
  visible,
  preview,
  isLoading,
  onClose,
  onSave,
}: YouTubeRecipePreviewModalProps) {
  // Local state for editing
  const [editedPreview, setEditedPreview] = useState<YouTubeRecipePreview | null>(
    null
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Sync local state when preview changes
  useEffect(() => {
    if (preview) {
      setEditedPreview({ ...preview });
    }
  }, [preview]);

  // Edit handlers
  const handleEditTitle = useCallback((title: string) => {
    setEditedPreview((prev) => (prev ? { ...prev, title } : null));
  }, []);

  const handleEditServings = useCallback((delta: number) => {
    setEditedPreview((prev) =>
      prev ? { ...prev, servings: Math.max(1, prev.servings + delta) } : null
    );
  }, []);

  const handleEditPrepTime = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setEditedPreview((prev) =>
      prev
        ? { ...prev, prepTime: isNaN(parsed) ? 0 : Math.max(0, parsed) }
        : null
    );
  }, []);

  const handleEditCookTime = useCallback((time: string) => {
    const parsed = parseInt(time, 10);
    setEditedPreview((prev) =>
      prev
        ? { ...prev, cookTime: isNaN(parsed) ? 0 : Math.max(0, parsed) }
        : null
    );
  }, []);

  const handleEditIngredient = useCallback(
    (
      index: number,
      field: keyof ParsedIngredient,
      value: string | number
    ) => {
      setEditedPreview((prev) => {
        if (!prev) return null;
        const newIngredients = [...prev.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        return { ...prev, ingredients: newIngredients };
      });
    },
    []
  );

  const handleRemoveIngredient = useCallback((index: number) => {
    setEditedPreview((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      };
    });
  }, []);

  const handleAddIngredient = useCallback(() => {
    setEditedPreview((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          { name: "", quantity: 1, unit: "item", category: "other" as const },
        ],
      };
    });
  }, []);

  const handleEditInstruction = useCallback(
    (index: number, value: string) => {
      setEditedPreview((prev) => {
        if (!prev) return null;
        const newInstructions = [...prev.instructions];
        newInstructions[index] = value;
        return { ...prev, instructions: newInstructions };
      });
    },
    []
  );

  const handleRemoveInstruction = useCallback((index: number) => {
    setEditedPreview((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index),
      };
    });
  }, []);

  const handleAddInstruction = useCallback(() => {
    setEditedPreview((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        instructions: [...prev.instructions, ""],
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editedPreview) return;

    // Validate title
    if (!editedPreview.title || editedPreview.title.trim().length === 0) {
      Alert.alert(
        "Title Required",
        "Please enter a title for this recipe before saving.",
        [{ text: "OK", onPress: () => setEditingSection("title") }]
      );
      return;
    }

    // Validate at least one ingredient
    const validIngredients = editedPreview.ingredients.filter(
      (ing) => ing.name.trim().length > 0
    );
    if (validIngredients.length === 0) {
      Alert.alert(
        "Ingredients Required",
        "Please add at least one ingredient before saving.",
        [{ text: "OK", onPress: () => setEditingSection("ingredients") }]
      );
      return;
    }

    // Validate at least one instruction
    const validInstructions = editedPreview.instructions.filter(
      (step) => step.trim().length > 0
    );
    if (validInstructions.length === 0) {
      Alert.alert(
        "Instructions Required",
        "Please add at least one instruction step before saving.",
        [{ text: "OK", onPress: () => setEditingSection("instructions") }]
      );
      return;
    }

    // Clean up empty entries and save
    const cleanedPreview: YouTubeRecipePreview = {
      ...editedPreview,
      ingredients: validIngredients,
      instructions: validInstructions,
    };

    onSave(cleanedPreview);
  }, [editedPreview, onSave]);

  // Loading state
  if (isLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-stone-950 items-center justify-center">
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center rounded-3xl bg-orange-500/20 mb-6">
              <Sparkles size={48} color="#f97316" />
            </View>
            <Text className="text-2xl font-bold text-white mb-2">
              Extracting Recipe...
            </Text>
            <Text className="text-stone-400 text-center px-8">
              AI is analyzing the video to extract recipe details
            </Text>
            <ActivityIndicator
              size="large"
              color="#f97316"
              className="mt-8"
            />
          </View>
        </View>
      </Modal>
    );
  }

  // No preview yet
  if (!editedPreview) {
    return null;
  }

  const confidenceColor = getConfidenceColor(editedPreview.confidence);
  const totalTime = editedPreview.prepTime + editedPreview.cookTime;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-stone-950"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-800 px-4 py-4">
          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-800"
          >
            <X size={24} color="#a8a29e" />
          </Pressable>
          <View className="items-center">
            <Text className="text-lg font-semibold text-white">
              Review Recipe
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Youtube size={14} color="#ef4444" />
              <Text className="text-xs text-stone-400">From YouTube</Text>
            </View>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Video Thumbnail */}
          <View className="mb-4">
            <View className="overflow-hidden rounded-xl">
              <Image
                source={{ uri: editedPreview.thumbnailUrl }}
                className="aspect-video w-full"
                resizeMode="cover"
              />
              {/* YouTube Badge */}
              <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-black/80 px-2 py-1 rounded">
                <Youtube size={14} color="#ef4444" />
                <Text className="text-white text-xs font-medium">YouTube</Text>
              </View>
            </View>
          </View>

          {/* AI Extraction Note */}
          <View
            className={`mb-4 flex-row items-start gap-2 p-3 rounded-lg border ${confidenceColor.bg} ${confidenceColor.border}`}
          >
            <Sparkles size={18} color="#f97316" />
            <View className="flex-1">
              <Text className="text-sm text-orange-400 font-medium">
                Extracted by AI from YouTube video
              </Text>
              <Text className="text-xs text-stone-400 mt-1">
                Confidence: {editedPreview.confidence} - Review and edit before
                saving
              </Text>
              {editedPreview.extractionNotes && (
                <Text className="text-xs text-stone-500 mt-1">
                  {editedPreview.extractionNotes}
                </Text>
              )}
            </View>
          </View>

          {/* Low confidence warning */}
          {editedPreview.confidence === "low" && (
            <View className="mb-4 flex-row items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle size={18} color="#eab308" />
              <View className="flex-1">
                <Text className="text-sm text-yellow-500 font-medium">
                  Low confidence extraction
                </Text>
                <Text className="text-xs text-stone-400 mt-1">
                  The AI had difficulty extracting this recipe. Please review
                  carefully and fill in any missing information.
                </Text>
              </View>
            </View>
          )}

          {/* Title Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-stone-400">
                Recipe Title
              </Text>
              {editingSection !== "title" && (
                <Pressable onPress={() => setEditingSection("title")}>
                  <Text className="text-sm text-orange-500">Edit</Text>
                </Pressable>
              )}
            </View>

            {editingSection === "title" ? (
              <View className="rounded-xl border border-stone-700 bg-stone-800 p-3">
                <TextInput
                  value={editedPreview.title}
                  onChangeText={handleEditTitle}
                  placeholder="Recipe title"
                  placeholderTextColor="#78716c"
                  className="text-lg font-bold text-white"
                  autoFocus
                />
                <Pressable
                  onPress={() => setEditingSection(null)}
                  className="mt-2 items-center rounded-lg bg-green-500/20 py-2"
                >
                  <Text className="font-medium text-green-500">Done</Text>
                </Pressable>
              </View>
            ) : (
              <Text className="text-xl font-bold text-white">
                {editedPreview.title || "Untitled Recipe"}
              </Text>
            )}
          </View>

          {/* Time & Servings Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-stone-400">
                Time & Servings
              </Text>
              {editingSection !== "details" && (
                <Pressable onPress={() => setEditingSection("details")}>
                  <Text className="text-sm text-orange-500">Edit</Text>
                </Pressable>
              )}
            </View>

            {editingSection === "details" ? (
              <View className="rounded-xl border border-stone-700 bg-stone-800 p-3 gap-3">
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
                      {editedPreview.servings}
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
                    value={String(editedPreview.prepTime)}
                    onChangeText={handleEditPrepTime}
                    keyboardType="number-pad"
                    className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
                  />
                </View>
                <View className="flex-row items-center gap-3">
                  <Flame size={18} color="#a8a29e" />
                  <Text className="flex-1 text-stone-400">Cook Time (min)</Text>
                  <TextInput
                    value={String(editedPreview.cookTime)}
                    onChangeText={handleEditCookTime}
                    keyboardType="number-pad"
                    className="w-16 rounded-lg border border-stone-600 bg-stone-900 px-3 py-1 text-center text-white"
                  />
                </View>
                <Pressable
                  onPress={() => setEditingSection(null)}
                  className="items-center rounded-lg bg-green-500/20 py-2"
                >
                  <Text className="font-medium text-green-500">Done</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-4">
                <View className="flex-row items-center gap-2">
                  <Clock size={18} color="#f97316" />
                  <Text className="text-white">{totalTime} min total</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Clock size={18} color="#a8a29e" />
                  <Text className="text-stone-400">
                    {editedPreview.prepTime} prep
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Flame size={18} color="#a8a29e" />
                  <Text className="text-stone-400">
                    {editedPreview.cookTime} cook
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Users size={18} color="#a8a29e" />
                  <Text className="text-stone-400">
                    {editedPreview.servings} servings
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Ingredients Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-stone-400">
                Ingredients ({editedPreview.ingredients.length})
              </Text>
              {editingSection !== "ingredients" && (
                <Pressable onPress={() => setEditingSection("ingredients")}>
                  <Text className="text-sm text-orange-500">Edit</Text>
                </Pressable>
              )}
            </View>

            {editingSection === "ingredients" ? (
              <View className="rounded-xl border border-stone-700 bg-stone-800 p-3 gap-2">
                {editedPreview.ingredients.map((ing, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <TextInput
                      value={String(ing.quantity)}
                      onChangeText={(v) =>
                        handleEditIngredient(
                          index,
                          "quantity",
                          parseFloat(v) || 0
                        )
                      }
                      keyboardType="decimal-pad"
                      className="w-14 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-center text-white"
                    />
                    <TextInput
                      value={ing.unit}
                      onChangeText={(v) =>
                        handleEditIngredient(index, "unit", v)
                      }
                      className="w-16 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                    />
                    <TextInput
                      value={ing.name}
                      onChangeText={(v) =>
                        handleEditIngredient(index, "name", v)
                      }
                      className="flex-1 rounded border border-stone-600 bg-stone-900 px-2 py-1 text-white"
                      placeholder="Ingredient name"
                      placeholderTextColor="#78716c"
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
                <Pressable
                  onPress={() => setEditingSection(null)}
                  className="items-center rounded-lg bg-green-500/20 py-2"
                >
                  <Text className="font-medium text-green-500">Done</Text>
                </Pressable>
              </View>
            ) : (
              <View className="rounded-xl border border-stone-700 bg-stone-800/50 p-3 gap-2">
                {editedPreview.ingredients.length > 0 ? (
                  editedPreview.ingredients.map((ing, index) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <Text className="min-w-[4rem] font-mono text-sm text-orange-500">
                        {ing.quantity} {ing.unit}
                      </Text>
                      <Text className="flex-1 text-white">{ing.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-stone-500 text-center py-4">
                    No ingredients found - tap Edit to add
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Instructions Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-stone-400">
                Instructions ({editedPreview.instructions.length} steps)
              </Text>
              {editingSection !== "instructions" && (
                <Pressable onPress={() => setEditingSection("instructions")}>
                  <Text className="text-sm text-orange-500">Edit</Text>
                </Pressable>
              )}
            </View>

            {editingSection === "instructions" ? (
              <View className="rounded-xl border border-stone-700 bg-stone-800 p-3 gap-3">
                {editedPreview.instructions.map((step, index) => (
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
                      placeholder="Step instruction"
                      placeholderTextColor="#78716c"
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
                <Pressable
                  onPress={() => setEditingSection(null)}
                  className="items-center rounded-lg bg-green-500/20 py-2"
                >
                  <Text className="font-medium text-green-500">Done</Text>
                </Pressable>
              </View>
            ) : (
              <View className="rounded-xl border border-stone-700 bg-stone-800/50 p-3 gap-3">
                {editedPreview.instructions.length > 0 ? (
                  editedPreview.instructions.map((step, index) => (
                    <View key={index} className="flex-row gap-3">
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-orange-500/20">
                        <Text className="text-xs font-bold text-orange-500">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-stone-300">{step}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-stone-500 text-center py-4">
                    No instructions found - tap Edit to add
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View className="h-32" />
        </ScrollView>

        {/* Bottom Actions */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-stone-800 bg-stone-950 p-4">
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}
