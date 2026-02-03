/**
 * DeleteConfirmationDialog Component
 *
 * Modal dialog to confirm recipe deletion.
 */

import { View, Text, Pressable, Modal } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface DeleteConfirmationDialogProps {
  visible: boolean;
  recipeTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({
  visible,
  recipeTitle,
  onCancel,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onCancel}
      >
        <View
          className="mx-6 w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-stone-800"
          onStartShouldSetResponder={() => true}
        >
          {/* Icon */}
          <View className="mb-4 items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-xl font-semibold text-stone-900 dark:text-stone-100">
            Delete Recipe?
          </Text>

          {/* Message */}
          <Text className="mb-6 text-center text-stone-600 dark:text-stone-400">
            Are you sure you want to delete "{recipeTitle}"? This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-xl border border-stone-200 py-3 active:bg-stone-100 dark:border-stone-700 dark:active:bg-stone-700"
            >
              <Text className="text-center font-medium text-stone-700 dark:text-stone-300">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 rounded-xl bg-red-500 py-3 active:bg-red-600"
            >
              <Text className="text-center font-medium text-white">Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
