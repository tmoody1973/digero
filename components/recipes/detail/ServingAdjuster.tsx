/**
 * ServingAdjuster Component
 *
 * +/- buttons to adjust serving count with min/max constraints.
 */

import { View, Text, Pressable } from "react-native";
import { Minus, Plus, Users } from "lucide-react-native";

interface ServingAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function ServingAdjuster({
  value,
  onChange,
  min = 1,
  max = 20,
}: ServingAdjusterProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View className="flex-row items-center gap-3 rounded-full border border-stone-200 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-800">
      <Pressable
        onPress={handleDecrement}
        disabled={value <= min}
        className={`h-8 w-8 items-center justify-center rounded-full ${
          value <= min ? "opacity-30" : "active:bg-stone-100 dark:active:bg-stone-700"
        }`}
      >
        <Minus className="h-4 w-4 text-stone-500" />
      </Pressable>

      <View className="flex-row items-center gap-1.5">
        <Users className="h-4 w-4 text-stone-400" />
        <Text className="min-w-[2ch] text-center font-semibold text-stone-900 dark:text-stone-100">
          {value}
        </Text>
      </View>

      <Pressable
        onPress={handleIncrement}
        disabled={value >= max}
        className={`h-8 w-8 items-center justify-center rounded-full ${
          value >= max ? "opacity-30" : "active:bg-stone-100 dark:active:bg-stone-700"
        }`}
      >
        <Plus className="h-4 w-4 text-stone-500" />
      </Pressable>
    </View>
  );
}
