/**
 * Manual Recipe Form Component
 *
 * Full-screen modal form for creating a recipe manually.
 * Includes all fields: title, image, ingredients, instructions,
 * metadata, dietary tags, nutrition, and notes.
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { DiscardConfirmation } from "./DiscardConfirmation";
import { TitleInput } from "./TitleInput";
import { MetadataFields } from "./MetadataFields";
import { CuisineInput } from "./CuisineInput";
import { DifficultySelector } from "./DifficultySelector";
import { IngredientList } from "./IngredientList";
import { InstructionList } from "./InstructionList";
import { ImageSelector } from "./ImageSelector";
import { DietaryTagSelector } from "./DietaryTagSelector";
import { NutritionInputs } from "./NutritionInputs";
import { NotesInput } from "./NotesInput";

import {
  RecipeFormState,
  FormErrors,
  FormIngredient,
  FormInstruction,
  DifficultyLevel,
  createInitialFormState,
} from "./types";

interface ManualRecipeFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (recipeId: string) => void;
}

export function ManualRecipeForm({
  visible,
  onClose,
  onSuccess,
}: ManualRecipeFormProps) {
  // Form state
  const [formState, setFormState] = useState<RecipeFormState>(
    createInitialFormState()
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Convex mutation
  const createRecipe = useMutation(api.recipes.createRecipe);

  // Check if form has any data entered (dirty state)
  const isDirty = useMemo(() => {
    const initial = createInitialFormState();
    return (
      formState.title !== initial.title ||
      formState.imageUri !== initial.imageUri ||
      formState.ingredients.some((ing) => ing.name || ing.quantity || ing.unit) ||
      formState.instructions.some((inst) => inst.text) ||
      formState.servings !== initial.servings ||
      formState.prepTime !== initial.prepTime ||
      formState.cookTime !== initial.cookTime ||
      formState.cuisineType !== initial.cuisineType ||
      formState.difficulty !== initial.difficulty ||
      formState.dietaryTags.length > 0 ||
      formState.nutrition.calories !== initial.nutrition.calories ||
      formState.nutrition.protein !== initial.nutrition.protein ||
      formState.nutrition.carbs !== initial.nutrition.carbs ||
      formState.nutrition.fat !== initial.nutrition.fat ||
      formState.notes !== initial.notes
    );
  }, [formState]);

  // Validate form
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formState.title.trim()) {
      newErrors.title = "Recipe title is required";
    } else if (formState.title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    // Ingredients validation
    const hasValidIngredient = formState.ingredients.some(
      (ing) => ing.name.trim()
    );
    if (!hasValidIngredient) {
      newErrors.ingredients = "At least one ingredient with a name is required";
    }

    // Instructions validation
    const hasValidInstruction = formState.instructions.some(
      (inst) => inst.text.trim()
    );
    if (!hasValidInstruction) {
      newErrors.instructions = "At least one instruction is required";
    }

    // Servings validation
    if (formState.servings) {
      const servingsNum = parseInt(formState.servings, 10);
      if (isNaN(servingsNum) || servingsNum < 1 || servingsNum > 99) {
        newErrors.servings = "Servings must be between 1 and 99";
      }
    }

    // Prep time validation
    if (formState.prepTime) {
      const prepTimeNum = parseInt(formState.prepTime, 10);
      if (isNaN(prepTimeNum) || prepTimeNum < 0) {
        newErrors.prepTime = "Prep time must be a positive number";
      }
    }

    // Cook time validation
    if (formState.cookTime) {
      const cookTimeNum = parseInt(formState.cookTime, 10);
      if (isNaN(cookTimeNum) || cookTimeNum < 0) {
        newErrors.cookTime = "Cook time must be a positive number";
      }
    }

    // Nutrition validation
    const nutritionErrors: FormErrors["nutrition"] = {};
    if (formState.nutrition.calories) {
      const val = parseFloat(formState.nutrition.calories);
      if (isNaN(val) || val < 0) {
        nutritionErrors.calories = "Must be a non-negative number";
      }
    }
    if (formState.nutrition.protein) {
      const val = parseFloat(formState.nutrition.protein);
      if (isNaN(val) || val < 0) {
        nutritionErrors.protein = "Must be a non-negative number";
      }
    }
    if (formState.nutrition.carbs) {
      const val = parseFloat(formState.nutrition.carbs);
      if (isNaN(val) || val < 0) {
        nutritionErrors.carbs = "Must be a non-negative number";
      }
    }
    if (formState.nutrition.fat) {
      const val = parseFloat(formState.nutrition.fat);
      if (isNaN(val) || val < 0) {
        nutritionErrors.fat = "Must be a non-negative number";
      }
    }
    if (Object.keys(nutritionErrors).length > 0) {
      newErrors.nutrition = nutritionErrors;
    }

    return newErrors;
  }, [formState]);

  // Check if form is valid
  const isValid = useMemo(() => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  }, [validateForm]);

  // Handle cancel button
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Handle discard confirmation
  const handleDiscard = useCallback(() => {
    setShowDiscardConfirmation(false);
    setFormState(createInitialFormState());
    setErrors({});
    onClose();
  }, [onClose]);

  // Handle save
  const handleSave = useCallback(async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Filter valid ingredients
      const validIngredients = formState.ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit || "piece",
          category: ing.category,
        }));

      // Filter valid instructions
      const validInstructions = formState.instructions
        .filter((inst) => inst.text.trim())
        .map((inst) => inst.text.trim());

      // Build nutrition object if any values provided
      const hasNutrition =
        formState.nutrition.calories ||
        formState.nutrition.protein ||
        formState.nutrition.carbs ||
        formState.nutrition.fat;

      const nutrition = hasNutrition
        ? {
            calories: parseFloat(formState.nutrition.calories) || 0,
            protein: parseFloat(formState.nutrition.protein) || 0,
            carbs: parseFloat(formState.nutrition.carbs) || 0,
            fat: parseFloat(formState.nutrition.fat) || 0,
          }
        : undefined;

      // Create recipe
      const recipeId = await createRecipe({
        title: formState.title.trim(),
        source: "manual",
        imageUrl: formState.imageUri || "https://via.placeholder.com/400x300?text=Recipe",
        servings: parseInt(formState.servings, 10) || 4,
        prepTime: parseInt(formState.prepTime, 10) || 0,
        cookTime: parseInt(formState.cookTime, 10) || 0,
        ingredients: validIngredients,
        instructions: validInstructions,
        notes: formState.notes.trim() || undefined,
        nutrition,
        cuisineType: formState.cuisineType.trim() || undefined,
        difficulty: formState.difficulty || undefined,
        dietaryTags: formState.dietaryTags,
      });

      // Reset form and close
      setFormState(createInitialFormState());
      onSuccess(recipeId);
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setErrors({ title: "Failed to save recipe. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [formState, validateForm, createRecipe, onSuccess]);

  // Form field update handlers
  const updateTitle = useCallback((title: string) => {
    setFormState((prev) => ({ ...prev, title }));
    setErrors((prev) => ({ ...prev, title: undefined }));
  }, []);

  const updateImageUri = useCallback((imageUri: string | null) => {
    setFormState((prev) => ({ ...prev, imageUri }));
  }, []);

  const updateIngredients = useCallback((ingredients: FormIngredient[]) => {
    setFormState((prev) => ({ ...prev, ingredients }));
    setErrors((prev) => ({ ...prev, ingredients: undefined }));
  }, []);

  const updateInstructions = useCallback((instructions: FormInstruction[]) => {
    setFormState((prev) => ({ ...prev, instructions }));
    setErrors((prev) => ({ ...prev, instructions: undefined }));
  }, []);

  const updateServings = useCallback((servings: string) => {
    setFormState((prev) => ({ ...prev, servings }));
    setErrors((prev) => ({ ...prev, servings: undefined }));
  }, []);

  const updatePrepTime = useCallback((prepTime: string) => {
    setFormState((prev) => ({ ...prev, prepTime }));
    setErrors((prev) => ({ ...prev, prepTime: undefined }));
  }, []);

  const updateCookTime = useCallback((cookTime: string) => {
    setFormState((prev) => ({ ...prev, cookTime }));
    setErrors((prev) => ({ ...prev, cookTime: undefined }));
  }, []);

  const updateCuisineType = useCallback((cuisineType: string) => {
    setFormState((prev) => ({ ...prev, cuisineType }));
  }, []);

  const updateDifficulty = useCallback((difficulty: DifficultyLevel | null) => {
    setFormState((prev) => ({ ...prev, difficulty }));
  }, []);

  const updateDietaryTags = useCallback((dietaryTags: string[]) => {
    setFormState((prev) => ({ ...prev, dietaryTags }));
  }, []);

  const updateNutrition = useCallback(
    (field: "calories" | "protein" | "carbs" | "fat", value: string) => {
      setFormState((prev) => ({
        ...prev,
        nutrition: { ...prev.nutrition, [field]: value },
      }));
      setErrors((prev) => {
        if (!prev.nutrition) return prev;
        const { [field]: _, ...rest } = prev.nutrition;
        return {
          ...prev,
          nutrition: Object.keys(rest).length > 0 ? rest : undefined,
        };
      });
    },
    []
  );

  const updateNotes = useCallback((notes: string) => {
    setFormState((prev) => ({ ...prev, notes }));
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <Pressable
            onPress={handleCancel}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
          >
            <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </Pressable>

          <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Create Recipe
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={!isValid || isSaving}
            className={`w-10 h-10 items-center justify-center rounded-full ${
              isValid && !isSaving
                ? "bg-orange-500 active:bg-orange-600"
                : "bg-stone-200 dark:bg-stone-700"
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Check
                className={`w-5 h-5 ${
                  isValid ? "text-white" : "text-stone-400 dark:text-stone-500"
                }`}
              />
            )}
          </Pressable>
        </View>

        {/* Form Content */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Section */}
          <View className="px-4 pt-4">
            <ImageSelector
              imageUri={formState.imageUri}
              onImageSelected={updateImageUri}
            />
          </View>

          {/* Title Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Basic Info
            </Text>
            <TitleInput
              value={formState.title}
              onChange={updateTitle}
              error={errors.title}
            />
          </View>

          {/* Ingredients Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Ingredients
            </Text>
            <IngredientList
              ingredients={formState.ingredients}
              onChange={updateIngredients}
              error={errors.ingredients}
            />
          </View>

          {/* Instructions Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Instructions
            </Text>
            <InstructionList
              instructions={formState.instructions}
              onChange={updateInstructions}
              error={errors.instructions}
            />
          </View>

          {/* Metadata Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Details
            </Text>
            <MetadataFields
              servings={formState.servings}
              prepTime={formState.prepTime}
              cookTime={formState.cookTime}
              onServingsChange={updateServings}
              onPrepTimeChange={updatePrepTime}
              onCookTimeChange={updateCookTime}
              errors={{
                servings: errors.servings,
                prepTime: errors.prepTime,
                cookTime: errors.cookTime,
              }}
            />

            <View className="mt-4">
              <CuisineInput
                value={formState.cuisineType}
                onChange={updateCuisineType}
              />
            </View>

            <View className="mt-4">
              <DifficultySelector
                value={formState.difficulty}
                onChange={updateDifficulty}
              />
            </View>
          </View>

          {/* Dietary Tags Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Dietary Tags
            </Text>
            <DietaryTagSelector
              selectedTags={formState.dietaryTags}
              onChange={updateDietaryTags}
            />
          </View>

          {/* Nutrition Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Nutrition (per serving)
            </Text>
            <NutritionInputs
              nutrition={formState.nutrition}
              onChange={updateNutrition}
              errors={errors.nutrition}
            />
          </View>

          {/* Notes Section */}
          <View className="px-4 pt-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
              Notes
            </Text>
            <NotesInput value={formState.notes} onChange={updateNotes} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Discard Confirmation Modal */}
      <DiscardConfirmation
        visible={showDiscardConfirmation}
        onCancel={() => setShowDiscardConfirmation(false)}
        onDiscard={handleDiscard}
      />
    </Modal>
  );
}
