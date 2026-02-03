/**
 * SearchBar Component
 *
 * Search input with debounced text changes.
 * Shows a clear button when text is present.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";

interface SearchBarProps {
  value: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onSearchChange,
  placeholder = "Search recipes...",
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = useCallback(
    (text: string) => {
      setLocalValue(text);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced callback
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(text);
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onSearchChange("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [onSearchChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <View className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <TextInput
        value={localValue}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#a8a29e"
        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-12 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
      />
      {localValue.length > 0 && (
        <Pressable
          onPress={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 active:bg-stone-200 dark:active:bg-stone-700"
        >
          <X className="h-4 w-4 text-stone-400" />
        </Pressable>
      )}
    </View>
  );
}
