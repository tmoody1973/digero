/**
 * StepProgressBar Component
 *
 * Horizontal progress bar showing progress through cooking steps.
 */

import { View } from "react-native";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <View className="h-1 w-full bg-stone-200 dark:bg-stone-700">
      <View
        className="h-full bg-orange-500"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
