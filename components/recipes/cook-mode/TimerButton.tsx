/**
 * TimerButton Component
 *
 * Button to set a timer based on detected time in instruction text.
 */

import { View, Text, Pressable } from "react-native";
import { Timer } from "lucide-react-native";
import { formatSeconds } from "./timePatterns";

interface TimerButtonProps {
  seconds: number;
  onPress: () => void;
}

export function TimerButton({ seconds, onPress }: TimerButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 active:bg-orange-600"
    >
      <Timer className="h-5 w-5 text-white" />
      <Text className="font-medium text-white">
        Set {formatSeconds(seconds)} Timer
      </Text>
    </Pressable>
  );
}
