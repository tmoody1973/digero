/**
 * QuickStatsBar Component
 *
 * Displays total time, prep time, and cook time with icons.
 */

import { View, Text } from "react-native";
import { Clock, Flame, Users } from "lucide-react-native";

interface QuickStatsBarProps {
  totalTime: number;
  prepTime: number;
  cookTime: number;
  servings: number;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function QuickStatsBar({
  totalTime,
  prepTime,
  cookTime,
  servings,
}: QuickStatsBarProps) {
  return (
    <View className="flex-row flex-wrap gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      {/* Total Time */}
      <View className="flex-row items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <View>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            Total Time
          </Text>
          <Text className="font-semibold text-stone-900 dark:text-stone-100">
            {formatTime(totalTime)}
          </Text>
        </View>
      </View>

      <View className="h-10 w-px bg-stone-200 dark:bg-stone-700" />

      {/* Prep Time */}
      <View className="flex-row items-center gap-2">
        <Clock className="h-5 w-5 text-stone-400" />
        <View>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            Prep
          </Text>
          <Text className="font-semibold text-stone-900 dark:text-stone-100">
            {formatTime(prepTime)}
          </Text>
        </View>
      </View>

      <View className="h-10 w-px bg-stone-200 dark:bg-stone-700" />

      {/* Cook Time */}
      <View className="flex-row items-center gap-2">
        <Flame className="h-5 w-5 text-stone-400" />
        <View>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            Cook
          </Text>
          <Text className="font-semibold text-stone-900 dark:text-stone-100">
            {formatTime(cookTime)}
          </Text>
        </View>
      </View>

      <View className="h-10 w-px bg-stone-200 dark:bg-stone-700" />

      {/* Servings */}
      <View className="flex-row items-center gap-2">
        <Users className="h-5 w-5 text-stone-400" />
        <View>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            Servings
          </Text>
          <Text className="font-semibold text-stone-900 dark:text-stone-100">
            {servings}
          </Text>
        </View>
      </View>
    </View>
  );
}
