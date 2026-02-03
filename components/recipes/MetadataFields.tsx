/**
 * Metadata Fields Component
 *
 * Input fields for servings, prep time, and cook time.
 */

import { View, Text, TextInput } from "react-native";

interface MetadataFieldsProps {
  servings: string;
  prepTime: string;
  cookTime: string;
  onServingsChange: (value: string) => void;
  onPrepTimeChange: (value: string) => void;
  onCookTimeChange: (value: string) => void;
  errors?: {
    servings?: string;
    prepTime?: string;
    cookTime?: string;
  };
}

export function MetadataFields({
  servings,
  prepTime,
  cookTime,
  onServingsChange,
  onPrepTimeChange,
  onCookTimeChange,
  errors = {},
}: MetadataFieldsProps) {
  return (
    <View className="flex-row gap-3">
      {/* Servings */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Servings
        </Text>
        <TextInput
          value={servings}
          onChangeText={onServingsChange}
          placeholder="4"
          placeholderTextColor="#a8a29e"
          keyboardType="number-pad"
          maxLength={2}
          className={`bg-white dark:bg-stone-800 border rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 text-center ${
            errors.servings
              ? "border-red-400 dark:border-red-600"
              : "border-stone-200 dark:border-stone-700"
          }`}
        />
        {errors.servings && (
          <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.servings}
          </Text>
        )}
      </View>

      {/* Prep Time */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Prep (min)
        </Text>
        <TextInput
          value={prepTime}
          onChangeText={onPrepTimeChange}
          placeholder="15"
          placeholderTextColor="#a8a29e"
          keyboardType="number-pad"
          maxLength={3}
          className={`bg-white dark:bg-stone-800 border rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 text-center ${
            errors.prepTime
              ? "border-red-400 dark:border-red-600"
              : "border-stone-200 dark:border-stone-700"
          }`}
        />
        {errors.prepTime && (
          <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.prepTime}
          </Text>
        )}
      </View>

      {/* Cook Time */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Cook (min)
        </Text>
        <TextInput
          value={cookTime}
          onChangeText={onCookTimeChange}
          placeholder="30"
          placeholderTextColor="#a8a29e"
          keyboardType="number-pad"
          maxLength={3}
          className={`bg-white dark:bg-stone-800 border rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 text-center ${
            errors.cookTime
              ? "border-red-400 dark:border-red-600"
              : "border-stone-200 dark:border-stone-700"
          }`}
        />
        {errors.cookTime && (
          <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
            {errors.cookTime}
          </Text>
        )}
      </View>
    </View>
  );
}
