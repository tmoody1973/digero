/**
 * Auth Input Component
 *
 * Styled text input for authentication forms.
 * Supports labels, hints, and error states.
 */

import { View, Text, TextInput, TextInputProps } from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export function AuthInput({
  label,
  hint,
  error,
  ...inputProps
}: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
      </Text>
      <TextInput
        className={`bg-white dark:bg-stone-800 border rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 ${
          error
            ? "border-red-400 dark:border-red-600"
            : "border-stone-200 dark:border-stone-700"
        }`}
        placeholderTextColor="#a8a29e" // stone-400
        {...inputProps}
      />
      {hint && !error && (
        <Text className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {hint}
        </Text>
      )}
      {error && (
        <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
