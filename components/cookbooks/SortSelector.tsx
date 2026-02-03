/**
 * SortSelector Component
 *
 * Dropdown selector for recipe sort order within a cookbook.
 */

import { View, Text, Pressable, Modal } from "react-native";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react-native";

export type SortOption = "position" | "dateAdded" | "title";

interface SortSelectorProps {
  value: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  position: "Manual Order",
  dateAdded: "Date Added",
  title: "Alphabetical",
};

export function SortSelector({ value, onSortChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 dark:bg-stone-800"
      >
        <Text className="text-sm font-medium text-stone-600 dark:text-stone-400">
          {sortLabels[value]}
        </Text>
        <ChevronDown className="h-4 w-4 text-stone-400" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="mx-8 w-64 overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <Text className="border-b border-stone-200 px-4 py-3 text-sm font-semibold text-stone-900 dark:border-stone-700 dark:text-white">
              Sort By
            </Text>
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                className="flex-row items-center justify-between border-b border-stone-100 px-4 py-3 last:border-b-0 active:bg-stone-50 dark:border-stone-700 dark:active:bg-stone-700"
              >
                <Text
                  className={`text-sm ${
                    value === option
                      ? "font-semibold text-orange-600 dark:text-orange-400"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {sortLabels[option]}
                </Text>
                {value === option && (
                  <Check className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
