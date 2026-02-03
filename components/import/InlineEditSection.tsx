/**
 * Inline Edit Section Component
 *
 * A collapsible section that shows preview content by default
 * and expands to editable form fields when Edit is clicked.
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Edit, Check } from "lucide-react-native";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import type { InlineEditSectionProps, Confidence } from "./types";

/**
 * InlineEditSection
 *
 * Displays content in preview mode with an Edit button.
 * When editing, shows the editor content with a Done button.
 * Includes optional confidence indicator for AI-extracted fields.
 */
export function InlineEditSection({
  title,
  confidence,
  children,
  editMode,
  onEdit,
  onDone,
  renderEditor,
}: InlineEditSectionProps) {
  return (
    <View className="mb-4">
      {/* Header with title, confidence, and edit button */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-white">{title}</Text>
          {confidence && <ConfidenceIndicator level={confidence} />}
        </View>

        {editMode ? (
          <Pressable
            onPress={onDone}
            className="flex-row items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 active:bg-green-500/30"
          >
            <Check size={16} color="#22c55e" />
            <Text className="text-sm font-medium text-green-500">Done</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onEdit}
            className="flex-row items-center gap-1 rounded-lg bg-stone-700 px-3 py-1.5 active:bg-stone-600"
          >
            <Edit size={16} color="#a8a29e" />
            <Text className="text-sm font-medium text-stone-400">Edit</Text>
          </Pressable>
        )}
      </View>

      {/* Content area */}
      <View
        className={`rounded-xl border ${
          editMode
            ? "border-orange-500/50 bg-stone-800"
            : "border-stone-700 bg-stone-800/50"
        } p-3`}
      >
        {editMode ? renderEditor() : children}
      </View>
    </View>
  );
}

/**
 * MissingFieldPlaceholder
 *
 * Shows a placeholder for missing/empty fields.
 * Tapping it triggers edit mode.
 */
export function MissingFieldPlaceholder({
  message = "Not found - tap to add",
  onPress,
}: {
  message?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center rounded-lg border border-dashed border-stone-600 bg-stone-800/30 px-4 py-3 active:bg-stone-700/50"
    >
      <Text className="text-sm italic text-stone-500">{message}</Text>
    </Pressable>
  );
}
