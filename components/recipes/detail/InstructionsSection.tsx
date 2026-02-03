/**
 * InstructionsSection Component
 *
 * Displays numbered cooking instructions.
 */

import { View, Text } from "react-native";

interface InstructionsSectionProps {
  instructions: string[];
}

export function InstructionsSection({ instructions }: InstructionsSectionProps) {
  return (
    <View className="mt-8">
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Instructions
      </Text>
      <View className="gap-4">
        {instructions.map((step, index) => (
          <View key={index} className="flex-row gap-4">
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {index + 1}
              </Text>
            </View>
            <Text className="flex-1 pt-1 text-stone-700 dark:text-stone-300 leading-relaxed">
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
