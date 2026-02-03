/**
 * Notes Input Component
 *
 * Multi-line text area for recipe notes, tips, or variations.
 */

import { View, Text, TextInput } from "react-native";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesInput({ value, onChange }: NotesInputProps) {
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Add notes, tips, or variations..."
        placeholderTextColor="#a8a29e"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 min-h-[100px]"
      />
    </View>
  );
}
