/**
 * Instruction List Component
 *
 * Manages list of instruction steps with add, delete, reorder, and bulk paste.
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Plus, ClipboardPaste } from "lucide-react-native";
import { InstructionStep } from "./InstructionStep";
import { BulkPasteModal } from "./BulkPasteModal";
import { FormInstruction, createEmptyInstruction } from "./types";

interface InstructionListProps {
  instructions: FormInstruction[];
  onChange: (instructions: FormInstruction[]) => void;
  error?: string;
}

export function InstructionList({
  instructions,
  onChange,
  error,
}: InstructionListProps) {
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  const handleInstructionChange = useCallback(
    (index: number, updatedInstruction: FormInstruction) => {
      const newInstructions = [...instructions];
      newInstructions[index] = updatedInstruction;
      onChange(newInstructions);
    },
    [instructions, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      if (instructions.length <= 1) return; // Cannot delete last instruction
      const newInstructions = instructions.filter((_, i) => i !== index);
      onChange(newInstructions);
    },
    [instructions, onChange]
  );

  const handleAddInstruction = useCallback(() => {
    onChange([...instructions, createEmptyInstruction()]);
  }, [instructions, onChange]);

  const handleBulkPasteConfirm = useCallback(
    (newInstructions: FormInstruction[]) => {
      if (newInstructions.length === 0) return;

      // If current instructions are empty (just one blank), replace them
      const hasOnlyEmptyInstructions =
        instructions.length === 1 && !instructions[0].text.trim();

      if (hasOnlyEmptyInstructions) {
        onChange(newInstructions);
      } else {
        // Append to existing instructions
        onChange([...instructions, ...newInstructions]);
      }
    },
    [instructions, onChange]
  );

  return (
    <View>
      {/* Error message */}
      {error && (
        <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-3">
          <Text className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </Text>
        </View>
      )}

      {/* Instruction Steps */}
      <View className="gap-3">
        {instructions.map((instruction, index) => (
          <InstructionStep
            key={instruction.id}
            instruction={instruction}
            stepNumber={index + 1}
            onChange={(updated) => handleInstructionChange(index, updated)}
            onDelete={() => handleDelete(index)}
            canDelete={instructions.length > 1}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-3">
        {/* Add Step Button */}
        <Pressable
          onPress={handleAddInstruction}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 active:bg-stone-100 dark:active:bg-stone-800"
        >
          <Plus className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          <Text className="text-stone-600 dark:text-stone-400 font-medium">
            Add Step
          </Text>
        </Pressable>

        {/* Bulk Paste Button */}
        <Pressable
          onPress={() => setShowBulkPaste(true)}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700"
        >
          <ClipboardPaste className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <Text className="text-stone-600 dark:text-stone-400 font-medium">
            Bulk Paste
          </Text>
        </Pressable>
      </View>

      {/* Bulk Paste Modal */}
      <BulkPasteModal
        visible={showBulkPaste}
        onClose={() => setShowBulkPaste(false)}
        onConfirm={handleBulkPasteConfirm}
      />
    </View>
  );
}
