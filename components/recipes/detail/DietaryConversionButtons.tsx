/**
 * DietaryConversionButtons Component
 *
 * Buttons to convert recipe to vegan or vegetarian.
 * UI only - triggers callbacks for actual conversion.
 */

import { View, Text, Pressable } from "react-native";
import { Leaf } from "lucide-react-native";

interface DietaryConversionButtonsProps {
  onConvertToVegan?: () => void;
  onConvertToVegetarian?: () => void;
}

export function DietaryConversionButtons({
  onConvertToVegan,
  onConvertToVegetarian,
}: DietaryConversionButtonsProps) {
  return (
    <View className="mt-6">
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Dietary Options
      </Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={onConvertToVegan}
          className="flex-row items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 active:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:active:bg-green-900/50"
        >
          <Leaf className="h-5 w-5 text-green-700 dark:text-green-400" />
          <Text className="font-medium text-green-700 dark:text-green-400">
            Convert to Vegan
          </Text>
        </Pressable>

        <Pressable
          onPress={onConvertToVegetarian}
          className="flex-row items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 active:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:active:bg-emerald-900/50"
        >
          <Leaf className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          <Text className="font-medium text-emerald-700 dark:text-emerald-400">
            Convert to Vegetarian
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
