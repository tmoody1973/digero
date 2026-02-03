/**
 * Dietary Tag Selector Component
 *
 * Multi-select chip list for dietary tags.
 */

import { View, Text, Pressable, ScrollView } from "react-native";
import { Check } from "lucide-react-native";
import { DIETARY_TAG_OPTIONS } from "./types";

interface DietaryTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  "nut-free": "Nut-Free",
  "low-carb": "Low-Carb",
  keto: "Keto",
  paleo: "Paleo",
};

export function DietaryTagSelector({
  selectedTags,
  onChange,
}: DietaryTagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {DIETARY_TAG_OPTIONS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggleTag(tag)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
              isSelected
                ? "bg-orange-500 border-orange-500"
                : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 active:bg-stone-100 dark:active:bg-stone-700"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
            <Text
              className={`text-sm font-medium ${
                isSelected
                  ? "text-white"
                  : "text-stone-700 dark:text-stone-300"
              }`}
            >
              {TAG_LABELS[tag] || tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
