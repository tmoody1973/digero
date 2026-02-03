/**
 * Nutrition Inputs Component
 *
 * Input fields for nutrition information: calories, protein, carbs, fat.
 */

import { View, Text, TextInput } from "react-native";
import { FormNutrition } from "./types";

interface NutritionInputsProps {
  nutrition: FormNutrition;
  onChange: (
    field: "calories" | "protein" | "carbs" | "fat",
    value: string
  ) => void;
  errors?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

interface NutritionFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function NutritionField({
  label,
  unit,
  value,
  onChange,
  error,
}: NutritionFieldProps) {
  return (
    <View className="flex-1">
      <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor="#a8a29e"
          keyboardType="decimal-pad"
          className={`flex-1 bg-white dark:bg-stone-800 border rounded-xl px-3 py-2.5 text-base text-stone-900 dark:text-stone-100 text-center ${
            error
              ? "border-red-400 dark:border-red-600"
              : "border-stone-200 dark:border-stone-700"
          }`}
        />
        <Text className="text-xs text-stone-500 dark:text-stone-400 ml-1 w-6">
          {unit}
        </Text>
      </View>
      {error && (
        <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}

export function NutritionInputs({
  nutrition,
  onChange,
  errors = {},
}: NutritionInputsProps) {
  return (
    <View className="bg-white dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700">
      <View className="flex-row gap-3">
        <NutritionField
          label="Calories"
          unit="kcal"
          value={nutrition.calories}
          onChange={(value) => onChange("calories", value)}
          error={errors.calories}
        />
        <NutritionField
          label="Protein"
          unit="g"
          value={nutrition.protein}
          onChange={(value) => onChange("protein", value)}
          error={errors.protein}
        />
      </View>
      <View className="flex-row gap-3 mt-3">
        <NutritionField
          label="Carbs"
          unit="g"
          value={nutrition.carbs}
          onChange={(value) => onChange("carbs", value)}
          error={errors.carbs}
        />
        <NutritionField
          label="Fat"
          unit="g"
          value={nutrition.fat}
          onChange={(value) => onChange("fat", value)}
          error={errors.fat}
        />
      </View>
    </View>
  );
}
