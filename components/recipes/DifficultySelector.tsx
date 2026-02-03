/**
 * Difficulty Selector Component
 *
 * Segmented control for selecting recipe difficulty level.
 */

import { View, Text, Pressable } from "react-native";
import { DifficultyLevel } from "./types";

interface DifficultySelectorProps {
  value: DifficultyLevel | null;
  onChange: (value: DifficultyLevel | null) => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  const handleSelect = (difficulty: DifficultyLevel) => {
    // Toggle off if already selected, otherwise select
    onChange(value === difficulty ? null : difficulty);
  };

  return (
    <View>
      <Text className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        Difficulty
      </Text>

      <View className="flex-row bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                isSelected
                  ? "bg-orange-500"
                  : "active:bg-stone-200 dark:active:bg-stone-700"
              }`}
            >
              <Text
                className={`font-medium ${
                  isSelected
                    ? "text-white"
                    : "text-stone-600 dark:text-stone-400"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
