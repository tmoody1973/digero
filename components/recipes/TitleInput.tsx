/**
 * Title Input Component
 *
 * Text input for recipe title with character count and validation.
 */

import { View, Text, TextInput } from "react-native";

const MAX_TITLE_LENGTH = 200;

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TitleInput({ value, onChange, error }: TitleInputProps) {
  const characterCount = value.length;
  const isNearLimit = characterCount > MAX_TITLE_LENGTH * 0.8;
  const isOverLimit = characterCount > MAX_TITLE_LENGTH;

  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Recipe Title <Text className="text-red-500">*</Text>
        </Text>
        <Text
          className={`text-xs ${
            isOverLimit
              ? "text-red-500"
              : isNearLimit
              ? "text-amber-500"
              : "text-stone-400 dark:text-stone-500"
          }`}
        >
          {characterCount}/{MAX_TITLE_LENGTH}
        </Text>
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Recipe title"
        placeholderTextColor="#a8a29e"
        maxLength={MAX_TITLE_LENGTH + 10} // Allow slight overage for display
        className={`bg-white dark:bg-stone-800 border rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 ${
          error
            ? "border-red-400 dark:border-red-600"
            : "border-stone-200 dark:border-stone-700"
        }`}
      />

      {error && (
        <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
