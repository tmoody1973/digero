/**
 * Cuisine Input Component
 *
 * Text input with dropdown suggestions for cuisine type.
 */

import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { CUISINE_SUGGESTIONS } from "./types";

interface CuisineInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CuisineInput({ value, onChange }: CuisineInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = useCallback(
    (cuisine: string) => {
      onChange(cuisine);
      setShowSuggestions(false);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (text: string) => {
      onChange(text);
      if (text.length > 0) {
        setShowSuggestions(true);
      }
    },
    [onChange]
  );

  const filteredSuggestions = CUISINE_SUGGESTIONS.filter((cuisine) =>
    cuisine.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <View>
      <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        Cuisine Type
      </Text>

      <View className="relative">
        <TextInput
          value={value}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="e.g., Italian, Mexican, Asian"
          placeholderTextColor="#a8a29e"
          className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3.5 text-base text-stone-900 dark:text-stone-100 pr-10"
        />
        <Pressable
          onPress={() => setShowSuggestions(!showSuggestions)}
          className="absolute right-3 top-0 bottom-0 justify-center"
        >
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </Pressable>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden z-10 shadow-lg">
          <ScrollView
            className="max-h-48"
            keyboardShouldPersistTaps="handled"
          >
            {filteredSuggestions.map((cuisine) => (
              <Pressable
                key={cuisine}
                onPress={() => handleSelect(cuisine)}
                className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 last:border-b-0 active:bg-stone-100 dark:active:bg-stone-700"
              >
                <Text className="text-base text-stone-900 dark:text-stone-100">
                  {cuisine}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
