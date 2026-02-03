/**
 * Instruction Step Component
 *
 * Single instruction step with step number badge and multi-line text.
 */

import { View, Text, TextInput, Pressable } from "react-native";
import { X, GripVertical } from "lucide-react-native";
import { FormInstruction } from "./types";

interface InstructionStepProps {
  instruction: FormInstruction;
  stepNumber: number;
  onChange: (instruction: FormInstruction) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function InstructionStep({
  instruction,
  stepNumber,
  onChange,
  onDelete,
  canDelete,
}: InstructionStepProps) {
  const handleTextChange = (text: string) => {
    onChange({ ...instruction, text });
  };

  return (
    <View className="flex-row items-start gap-2 bg-white dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700">
      {/* Drag Handle */}
      <View className="pt-3">
        <GripVertical className="w-5 h-5 text-stone-400" />
      </View>

      {/* Step Number Badge */}
      <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 items-center justify-center mt-1">
        <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {stepNumber}
        </Text>
      </View>

      {/* Text Input */}
      <TextInput
        value={instruction.text}
        onChangeText={handleTextChange}
        placeholder={`Step ${stepNumber} instructions...`}
        placeholderTextColor="#a8a29e"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-base text-stone-900 dark:text-stone-100 min-h-[60px]"
      />

      {/* Delete Button */}
      {canDelete && (
        <Pressable
          onPress={onDelete}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-700"
        >
          <X className="w-5 h-5 text-stone-400" />
        </Pressable>
      )}
    </View>
  );
}
