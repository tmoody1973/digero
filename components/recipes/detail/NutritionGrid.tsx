/**
 * NutritionGrid Component
 *
 * Displays nutrition information in a 4-column grid with colored values.
 */

import { View, Text } from "react-native";

interface NutritionGridProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionBadgeProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function NutritionBadge({ label, value, unit, color }: NutritionBadgeProps) {
  return (
    <View className="flex-1 items-center rounded-xl bg-stone-100 px-4 py-3 dark:bg-stone-800">
      <Text className={`text-lg font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-stone-500 dark:text-stone-400">{unit}</Text>
      <Text className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300">
        {label}
      </Text>
    </View>
  );
}

export function NutritionGrid({
  calories,
  protein,
  carbs,
  fat,
}: NutritionGridProps) {
  return (
    <View>
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Nutrition per Serving
      </Text>
      <View className="flex-row gap-3">
        <NutritionBadge
          label="Calories"
          value={calories}
          unit="kcal"
          color="text-orange-500"
        />
        <NutritionBadge
          label="Protein"
          value={protein}
          unit="g"
          color="text-red-500"
        />
        <NutritionBadge
          label="Carbs"
          value={carbs}
          unit="g"
          color="text-amber-500"
        />
        <NutritionBadge
          label="Fat"
          value={fat}
          unit="g"
          color="text-green-500"
        />
      </View>
    </View>
  );
}
