/**
 * Specialty Picker Component
 *
 * Multi-select chip picker for creator cooking specialties.
 * Used in the creator application flow.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  CakeSlice,
  Flame,
  Leaf,
  Timer,
  Globe,
  Heart,
  Coffee,
  IceCream,
  ChefHat,
} from "lucide-react-native";

/**
 * Predefined cooking specialties
 */
export const COOKING_SPECIALTIES = [
  { id: "baking", name: "Baking", icon: CakeSlice },
  { id: "grilling", name: "Grilling", icon: Flame },
  { id: "vegan", name: "Vegan", icon: Leaf },
  { id: "quick-meals", name: "Quick Meals", icon: Timer },
  { id: "international", name: "International", icon: Globe },
  { id: "healthy", name: "Healthy", icon: Heart },
  { id: "comfort-food", name: "Comfort Food", icon: Coffee },
  { id: "desserts", name: "Desserts", icon: IceCream },
] as const;

export type SpecialtyId = (typeof COOKING_SPECIALTIES)[number]["id"];

interface SpecialtyPickerProps {
  /** Currently selected specialty IDs */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
  /** Maximum number of selections allowed (optional) */
  maxSelections?: number;
  /** Show inline or as horizontal scroll */
  layout?: "wrap" | "scroll";
  /** Label to display above the picker */
  label?: string;
  /** Error message to display */
  error?: string;
}

/**
 * Get icon component for a specialty
 */
function getSpecialtyIcon(
  specialtyId: string,
  isSelected: boolean
): React.ReactNode {
  const color = isSelected ? "#fff" : "#f97316"; // Orange when not selected, white when selected
  const size = 16;

  const specialty = COOKING_SPECIALTIES.find((s) => s.id === specialtyId);
  if (specialty) {
    const Icon = specialty.icon;
    return <Icon size={size} color={color} />;
  }

  return <ChefHat size={size} color={color} />;
}

/**
 * Individual specialty chip
 */
function SpecialtyChip({
  specialty,
  isSelected,
  onPress,
  disabled,
}: {
  specialty: (typeof COOKING_SPECIALTIES)[number];
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled && !isSelected}
      className={`flex-row items-center gap-2 px-4 py-2 rounded-full mr-2 mb-2 ${
        isSelected
          ? "bg-orange-500"
          : disabled
            ? "bg-stone-100 dark:bg-stone-800 opacity-50"
            : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 active:border-orange-500/50"
      }`}
    >
      {getSpecialtyIcon(specialty.id, isSelected)}
      <Text
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-stone-700 dark:text-stone-400"
        }`}
      >
        {specialty.name}
      </Text>
    </Pressable>
  );
}

/**
 * Multi-select specialty picker component
 */
export function SpecialtyPicker({
  selected,
  onChange,
  maxSelections,
  layout = "wrap",
  label,
  error,
}: SpecialtyPickerProps) {
  const isMaxReached = maxSelections ? selected.length >= maxSelections : false;

  const handleToggle = (specialtyId: string) => {
    if (selected.includes(specialtyId)) {
      // Remove from selection
      onChange(selected.filter((id) => id !== specialtyId));
    } else if (!isMaxReached) {
      // Add to selection
      onChange([...selected, specialtyId]);
    }
  };

  const content = COOKING_SPECIALTIES.map((specialty) => (
    <SpecialtyChip
      key={specialty.id}
      specialty={specialty}
      isSelected={selected.includes(specialty.id)}
      onPress={() => handleToggle(specialty.id)}
      disabled={isMaxReached}
    />
  ));

  return (
    <View className="mb-4">
      {label && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {label}
          </Text>
          {maxSelections && (
            <Text className="text-xs text-stone-500 dark:text-stone-400">
              {selected.length}/{maxSelections} selected
            </Text>
          )}
        </View>
      )}

      {layout === "scroll" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="py-1"
        >
          <View className="flex-row">{content}</View>
        </ScrollView>
      ) : (
        <View className="flex-row flex-wrap">{content}</View>
      )}

      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}

      {isMaxReached && !error && (
        <Text className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Maximum selections reached. Tap a selected specialty to remove it.
        </Text>
      )}
    </View>
  );
}

/**
 * Get specialty name by ID
 */
export function getSpecialtyName(id: string): string {
  const specialty = COOKING_SPECIALTIES.find((s) => s.id === id);
  return specialty?.name ?? id;
}

/**
 * Get specialty names from IDs
 */
export function getSpecialtyNames(ids: string[]): string[] {
  return ids.map(getSpecialtyName);
}
