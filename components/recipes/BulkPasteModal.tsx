/**
 * Bulk Paste Modal Component
 *
 * Modal for pasting and parsing multiple instruction steps at once.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Check, Edit3 } from "lucide-react-native";
import { FormInstruction } from "./types";

interface BulkPasteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (instructions: FormInstruction[]) => void;
}

type ViewState = "paste" | "preview";

/**
 * Parse pasted text into individual instruction steps
 */
function parseInstructions(text: string): string[] {
  // Try to detect numbered patterns: 1. Step, 1) Step, 1: Step
  const numberedPattern = /(?:^|\n)\s*\d+[\.\)\:]\s*/;

  if (numberedPattern.test(text)) {
    // Split on numbered patterns
    const steps = text
      .split(/(?:^|\n)\s*\d+[\.\)\:]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return steps;
  }

  // Fallback: split on double newlines
  const steps = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If still no steps, treat the whole text as one step
  if (steps.length === 0 && text.trim()) {
    return [text.trim()];
  }

  return steps;
}

/**
 * Generate unique IDs for instructions
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function BulkPasteModal({
  visible,
  onClose,
  onConfirm,
}: BulkPasteModalProps) {
  const [viewState, setViewState] = useState<ViewState>("paste");
  const [pastedText, setPastedText] = useState("");
  const [parsedSteps, setParsedSteps] = useState<string[]>([]);

  const handleParse = useCallback(() => {
    const steps = parseInstructions(pastedText);
    setParsedSteps(steps);
    setViewState("preview");
  }, [pastedText]);

  const handleStepChange = useCallback((index: number, text: string) => {
    setParsedSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index] = text;
      return newSteps;
    });
  }, []);

  const handleDeleteStep = useCallback((index: number) => {
    setParsedSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConfirm = useCallback(() => {
    const instructions: FormInstruction[] = parsedSteps
      .filter((text) => text.trim())
      .map((text) => ({
        id: generateId(),
        text: text.trim(),
      }));

    onConfirm(instructions);
    handleReset();
  }, [parsedSteps, onConfirm]);

  const handleReset = useCallback(() => {
    setPastedText("");
    setParsedSteps([]);
    setViewState("paste");
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => {
    setViewState("paste");
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleReset}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <Pressable
            onPress={handleReset}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
          >
            <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </Pressable>

          <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {viewState === "paste" ? "Bulk Paste" : "Preview Steps"}
          </Text>

          {viewState === "paste" ? (
            <Pressable
              onPress={handleParse}
              disabled={!pastedText.trim()}
              className={`px-4 py-2 rounded-full ${
                pastedText.trim()
                  ? "bg-orange-500 active:bg-orange-600"
                  : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              <Text
                className={`font-medium ${
                  pastedText.trim() ? "text-white" : "text-stone-400"
                }`}
              >
                Parse
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleConfirm}
              disabled={parsedSteps.length === 0}
              className={`px-4 py-2 rounded-full ${
                parsedSteps.length > 0
                  ? "bg-orange-500 active:bg-orange-600"
                  : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              <Text
                className={`font-medium ${
                  parsedSteps.length > 0 ? "text-white" : "text-stone-400"
                }`}
              >
                Confirm
              </Text>
            </Pressable>
          )}
        </View>

        {viewState === "paste" ? (
          /* Paste View */
          <View className="flex-1 p-4">
            <Text className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              Paste your instructions below. They will be automatically split
              into steps based on numbered patterns (1. Step, 1) Step, 1: Step)
              or double line breaks.
            </Text>
            <TextInput
              value={pastedText}
              onChangeText={setPastedText}
              placeholder="Paste your instructions here..."
              placeholderTextColor="#a8a29e"
              multiline
              textAlignVertical="top"
              className="flex-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-base text-stone-900 dark:text-stone-100"
            />
          </View>
        ) : (
          /* Preview View */
          <View className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Pressable
                onPress={handleBack}
                className="flex-row items-center gap-1"
              >
                <Edit3 className="w-4 h-4 text-orange-500" />
                <Text className="text-orange-500 font-medium">Edit Text</Text>
              </Pressable>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                {parsedSteps.length} step{parsedSteps.length !== 1 ? "s" : ""}{" "}
                detected
              </Text>
            </View>

            <ScrollView
              className="flex-1 px-4"
              contentContainerClassName="pb-6"
              keyboardShouldPersistTaps="handled"
            >
              {parsedSteps.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-stone-500 dark:text-stone-400">
                    No steps detected. Try editing the text.
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {parsedSteps.map((step, index) => (
                    <View
                      key={index}
                      className="flex-row items-start gap-2 bg-white dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700"
                    >
                      {/* Step Number */}
                      <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 items-center justify-center mt-1">
                        <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {index + 1}
                        </Text>
                      </View>

                      {/* Editable Text */}
                      <TextInput
                        value={step}
                        onChangeText={(text) => handleStepChange(index, text)}
                        multiline
                        textAlignVertical="top"
                        className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-base text-stone-900 dark:text-stone-100 min-h-[60px]"
                      />

                      {/* Delete Button */}
                      <Pressable
                        onPress={() => handleDeleteStep(index)}
                        className="w-8 h-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-700"
                      >
                        <X className="w-5 h-5 text-stone-400" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
