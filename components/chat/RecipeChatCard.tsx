/**
 * RecipeChatCard Component
 *
 * Displays a recipe suggestion in the chat interface.
 * Shows recipe metadata with expandable ingredients and save functionality.
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Clock,
  Users,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
} from "lucide-react-native";

/**
 * Recipe ingredient from AI response
 */
interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  note?: string;
}

/**
 * Recipe step from AI response
 */
interface RecipeStep {
  step_number: number;
  instruction: string;
  estimated_time_minutes?: number;
  notes?: string;
}

/**
 * Recipe data structure from AI response
 */
export interface AiRecipe {
  id: string;
  name: string;
  servings: number;
  estimated_total_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  why_it_works: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  variations?: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  equipment?: string[];
  nutrition_notes?: string;
  leftover_and_waste_tips?: string;
}

interface RecipeChatCardProps {
  recipe: AiRecipe;
  onSaved?: () => void;
}

/**
 * Difficulty badge colors
 */
const difficultyColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
  hard: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
};

export function RecipeChatCard({ recipe, onSaved }: RecipeChatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveRecipe = useMutation(api.recipes.saveAiGeneratedRecipe);

  // Handle save recipe
  const handleSave = useCallback(async () => {
    if (isSaved || isSaving) return;

    setIsSaving(true);

    try {
      await saveRecipe({
        aiRecipeId: recipe.id,
        name: recipe.name,
        servings: recipe.servings,
        estimatedTotalTimeMinutes: recipe.estimated_total_time_minutes,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        whyItWorks: recipe.why_it_works,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        nutritionNotes: recipe.nutrition_notes,
      });

      setIsSaved(true);
      onSaved?.();
    } catch (error) {
      console.error("Failed to save recipe:", error);
    } finally {
      setIsSaving(false);
    }
  }, [recipe, saveRecipe, isSaved, isSaving, onSaved]);

  // Format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get difficulty styling
  const difficulty = difficultyColors[recipe.difficulty] || difficultyColors.medium;

  // Get visible ingredients (first 5 or all if expanded)
  const visibleIngredients = isExpanded
    ? recipe.ingredients
    : recipe.ingredients.slice(0, 5);
  const hasMoreIngredients = recipe.ingredients.length > 5;

  return (
    <View className="my-2 mx-2 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      {/* Header */}
      <View className="border-b border-stone-100 p-4 dark:border-stone-700">
        <Text className="mb-2 text-lg font-bold text-stone-900 dark:text-white">
          {recipe.name}
        </Text>

        {/* Metadata row */}
        <View className="flex-row flex-wrap items-center gap-3">
          {/* Time */}
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#78716c" />
            <Text className="text-sm text-stone-600 dark:text-stone-400">
              {formatTime(recipe.estimated_total_time_minutes)}
            </Text>
          </View>

          {/* Servings */}
          <View className="flex-row items-center gap-1">
            <Users size={14} color="#78716c" />
            <Text className="text-sm text-stone-600 dark:text-stone-400">
              {recipe.servings} servings
            </Text>
          </View>

          {/* Difficulty */}
          <View className={`rounded-full px-2 py-0.5 ${difficulty.bg}`}>
            <Text className={`text-xs font-medium capitalize ${difficulty.text}`}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </View>

      {/* Why it works */}
      <View className="border-b border-stone-100 p-4 dark:border-stone-700">
        <View className="mb-1 flex-row items-center gap-1">
          <ChefHat size={14} color="#f97316" />
          <Text className="text-sm font-medium text-orange-500">
            Why it works
          </Text>
        </View>
        <Text className="text-sm text-stone-600 dark:text-stone-400">
          {recipe.why_it_works}
        </Text>
      </View>

      {/* Ingredients preview */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="border-b border-stone-100 p-4 dark:border-stone-700"
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-stone-900 dark:text-white">
            Ingredients ({recipe.ingredients.length})
          </Text>
          {hasMoreIngredients && (
            isExpanded ? (
              <ChevronUp size={18} color="#78716c" />
            ) : (
              <ChevronDown size={18} color="#78716c" />
            )
          )}
        </View>

        <View className="gap-1">
          {visibleIngredients.map((ing, index) => (
            <Text
              key={`${ing.name}-${index}`}
              className="text-sm text-stone-600 dark:text-stone-400"
            >
              {ing.quantity} {ing.unit} {ing.name}
              {ing.is_optional && (
                <Text className="text-stone-400 dark:text-stone-500">
                  {" "}(optional)
                </Text>
              )}
            </Text>
          ))}
          {!isExpanded && hasMoreIngredients && (
            <Text className="text-sm text-stone-400 dark:text-stone-500">
              +{recipe.ingredients.length - 5} more...
            </Text>
          )}
        </View>
      </Pressable>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1 border-b border-stone-100 p-4 dark:border-stone-700">
          {recipe.tags.slice(0, 4).map((tag) => (
            <View
              key={tag}
              className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-700"
            >
              <Text className="text-xs text-stone-600 dark:text-stone-400">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Save button */}
      <View className="p-4">
        <Pressable
          onPress={handleSave}
          disabled={isSaved || isSaving}
          className={`flex-row items-center justify-center gap-2 rounded-xl py-3 ${
            isSaved
              ? "bg-green-500"
              : isSaving
                ? "bg-orange-400"
                : "bg-orange-500 active:bg-orange-600"
          }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : isSaved ? (
            <Check size={18} color="#ffffff" />
          ) : (
            <Plus size={18} color="#ffffff" />
          )}
          <Text className="text-base font-semibold text-white">
            {isSaved ? "Added to My Recipes" : isSaving ? "Saving..." : "Add to My Recipes"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
